from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from models.customer import Customer
from database import customers_collection
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
import csv
import io

router = APIRouter()

@router.get("/", response_model=List[Customer])
async def list_customers(
    search: Optional[str] = Query(None),
    show_unpaid_only: Optional[bool] = Query(False),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    query = {}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"mobileNumber": {"$regex": search, "$options": "i"}},
            {"address": {"$regex": search, "$options": "i"}}
        ]
    
    if show_unpaid_only:
        query["unpaidLoans"] = {"$gt": 0}
    
    if start_date and end_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            query["createdAt"] = {"$gte": start, "$lte": end}
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    try:
        skip = (page - 1) * limit
        customers = await customers_collection.find(query).skip(skip).limit(limit).to_list(None)
        return [Customer(**customer) for customer in customers]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch customers: {str(e)}")

@router.get("/export/csv")
async def export_customers_csv(
    search: Optional[str] = Query(None),
    show_unpaid_only: Optional[bool] = Query(False),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    query = {}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"mobileNumber": {"$regex": search, "$options": "i"}},
            {"address": {"$regex": search, "$options": "i"}}
        ]
    
    if show_unpaid_only:
        query["unpaidLoans"] = {"$gt": 0}
    
    if start_date and end_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            query["createdAt"] = {"$gte": start, "$lte": end}
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    try:
        customers = await customers_collection.find(query).to_list(None)
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write CSV headers
        writer.writerow(["ID", "Name", "Mobile Number", "Address", "Created At", "Total Loans", "Unpaid Loans", "Last Loan Date"])
        
        # Write customer data
        for customer in customers:
            writer.writerow([
                str(customer["_id"]),
                customer["name"],
                customer["mobileNumber"],
                customer["address"],
                customer["createdAt"].strftime("%Y-%m-%d"),
                customer["totalLoans"],
                customer["unpaidLoans"],
                customer.get("lastLoanDate", "")
            ])
        
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": 'attachment; filename="customers.csv"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export customers: {str(e)}")