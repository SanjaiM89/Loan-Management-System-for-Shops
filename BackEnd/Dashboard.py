from fastapi import APIRouter, HTTPException, Query
from database import customers_collection, loans_collection
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
from bson import ObjectId

router = APIRouter()

class DashboardStats(BaseModel):
    totalCustomers: int
    totalLoans: int
    totalUnpaidAmount: float
    totalPaidAmount: float

class ChartDataPoint(BaseModel):
    name: str
    loans: float
    collections: float

class DashboardResponse(BaseModel):
    stats: DashboardStats
    chartData: list[ChartDataPoint]

@router.get("/", response_model=DashboardResponse)
async def get_dashboard_data(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    try:
        # Parse date range or default to last 6 months
        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                end = datetime.strptime(end_date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        else:
            end = datetime.utcnow()
            start = end - timedelta(days=180)  # 6 months

        # Calculate stats
        customer_count = await customers_collection.count_documents({})
        loan_count = await loans_collection.count_documents({
            "loanDate": {"$gte": start.strftime("%Y-%m-%d"), "$lte": end.strftime("%Y-%m-%d")}
        })
        
        # Aggregate unpaid and paid amounts
        unpaid_pipeline = [
            {"$match": {
                "status": "unpaid",
                "loanDate": {"$gte": start.strftime("%Y-%m-%d"), "$lte": end.strftime("%Y-%m-%d")}
            }},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        paid_pipeline = [
            {"$match": {
                "status": "paid",
                "paymentDate": {"$gte": start.strftime("%Y-%m-%d"), "$lte": end.strftime("%Y-%m-%d")}
            }},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        
        unpaid_result = await loans_collection.aggregate(unpaid_pipeline).to_list(1)
        paid_result = await loans_collection.aggregate(paid_pipeline).to_list(1)
        
        total_unpaid = unpaid_result[0]["total"] if unpaid_result else 0
        total_paid = paid_result[0]["total"] if paid_result else 0

        # Generate chart data (monthly aggregation)
        chart_data = []
        current_date = start
        while current_date <= end:
            month_end = (current_date.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            month_name = current_date.strftime("%b")
            
            # Aggregate loans for the month
            loans_pipeline = [
                {"$match": {
                    "loanDate": {
                        "$gte": current_date.strftime("%Y-%m-%d"),
                        "$lte": month_end.strftime("%Y-%m-%d")
                    }
                }},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ]
            collections_pipeline = [
                {"$match": {
                    "status": "paid",
                    "paymentDate": {
                        "$gte": current_date.strftime("%Y-%m-%d"),
                        "$lte": month_end.strftime("%Y-%m-%d")
                    }
                }},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ]
            
            loans_result = await loans_collection.aggregate(loans_pipeline).to_list(1)
            collections_result = await loans_collection.aggregate(collections_pipeline).to_list(1)
            
            loans_amount = loans_result[0]["total"] if loans_result else 0
            collections_amount = collections_result[0]["total"] if collections_result else 0
            
            chart_data.append({
                "name": month_name,
                "loans": loans_amount,
                "collections": collections_amount
            })
            
            current_date = month_end + timedelta(days=1)

        return {
            "stats": {
                "totalCustomers": customer_count,
                "totalLoans": loan_count,
                "totalUnpaidAmount": total_unpaid,
                "totalPaidAmount": total_paid
            },
            "chartData": chart_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard data: {str(e)}")