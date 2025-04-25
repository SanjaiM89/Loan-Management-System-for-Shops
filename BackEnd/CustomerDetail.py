from fastapi import APIRouter, HTTPException, Depends
from models.customer import Customer, CustomerUpdate
from models.loan import Loan, LoanCreate, LoanUpdate
from database import customers_collection, loans_collection
from bson import ObjectId
from typing import List
from datetime import datetime

router = APIRouter()

@router.get("/{id}", response_model=Customer)
async def get_customer(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid customer ID")
    customer = await customers_collection.find_one({"_id": ObjectId(id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return Customer(**customer)

@router.put("/{id}", response_model=Customer)
async def update_customer(id: str, customer_update: CustomerUpdate):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid customer ID")
    update_data = {k: v for k, v in customer_update.dict(exclude_unset=True).items()}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided to update")
    
    result = await customers_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    updated_customer = await customers_collection.find_one({"_id": ObjectId(id)})
    return Customer(**updated_customer)

@router.delete("/{id}")
async def delete_customer(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid customer ID")
    
    # Check if customer has unpaid loans
    unpaid_loans = await loans_collection.count_documents({
        "customerId": ObjectId(id),
        "status": "unpaid"
    })
    if unpaid_loans > 0:
        raise HTTPException(status_code=400, detail="Cannot delete customer with unpaid loans")
    
    # Delete loans
    await loans_collection.delete_many({"customerId": ObjectId(id)})
    
    # Delete customer
    result = await customers_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {"message": "Customer deleted successfully"}

@router.get("/{id}/loans", response_model=List[Loan])
async def get_customer_loans(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid customer ID")
    loans = await loans_collection.find({"customerId": ObjectId(id)}).to_list(None)
    return [Loan(**loan) for loan in loans]

@router.post("/{id}/loans", response_model=Loan)
async def create_loan(id: str, loan: LoanCreate):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid customer ID")
    
    customer = await customers_collection.find_one({"_id": ObjectId(id)})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    loan_dict = loan.dict()
    loan_dict["customerId"] = ObjectId(id)
    
    try:
        result = await loans_collection.insert_one(loan_dict)
        loan_dict["_id"] = result.inserted_id
        
        # Update customer loan stats
        await customers_collection.update_one(
            {"_id": ObjectId(id)},
            {
                "$inc": {"totalLoans": 1, "unpaidLoans": 1},
                "$set": {"lastLoanDate": loan_dict["loanDate"]}
            }
        )
        
        return Loan(**loan_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create loan: {str(e)}")

@router.put("/{id}/loans/{loan_id}/mark-paid", response_model=Loan)
async def mark_loan_as_paid(id: str, loan_id: str):
    if not ObjectId.is_valid(id) or not ObjectId.is_valid(loan_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    
    loan = await loans_collection.find_one({"_id": ObjectId(loan_id), "customerId": ObjectId(id)})
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    if loan["status"] == "paid":
        raise HTTPException(status_code=400, detail="Loan already paid")
    
    update_data = {
        "status": "paid",
        "paymentDate": datetime.utcnow().strftime("%Y-%m-%d")
    }
    
    result = await loans_collection.update_one(
        {"_id": ObjectId(loan_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    # Update customer unpaid loans count
    await customers_collection.update_one(
        {"_id": ObjectId(id)},
        {"$inc": {"unpaidLoans": -1}}
    )
    
    updated_loan = await loans_collection.find_one({"_id": ObjectId(loan_id)})
    return Loan(**updated_loan)