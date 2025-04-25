from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.customers.CustomerAdd import router as customer_add_router
from routes.customers.CustomerDetail import router as customer_detail_router
from routes.customers.CustomerList import router as customer_list_router
from routes.dashboard.Dashboard import router as dashboard_router
import motor.motor_asyncio
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Customer Management API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "product_management")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
db = client[DATABASE_NAME]

# Include routers
app.include_router(customer_add_router, prefix="/customers", tags=["CustomerAdd"])
app.include_router(customer_detail_router, prefix="/customers", tags=["CustomerDetail"])
app.include_router(customer_list_router, prefix="/customers", tags=["CustomerList"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])

@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = client
    app.mongodb = db

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

@app.get("/")
async def root():
    return {"message": "Customer Management API"}