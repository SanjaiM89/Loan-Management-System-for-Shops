from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "product_management")

client = AsyncIOMotorClient(MONGODB_URI)
db = client[DATABASE_NAME]

customers_collection = db.get_collection("customers")
loans_collection = db.get_collection("loans")