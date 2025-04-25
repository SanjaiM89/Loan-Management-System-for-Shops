from fastapi import APIRouter, HTTPException, Depends
from models.customer import CustomerCreate, Customer
from database import customers_collection
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=Customer)
async def create_customer(customer: CustomerCreate):
    customer_dict = customer.dict()
    customer_dict["createdAt"] = datetime.utcnow()
    customer_dict["totalLoans"] = 0
    customer_dict["unpaidLoans"] = 0
    customer_dict["lastLoanDate"] = None

    try:
        result = await customers_collection.insert_one(customer_dict)
        customer_dict["_id"] = result.inserted_id
        return Customer(**customer_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create customer: {str(e)}")