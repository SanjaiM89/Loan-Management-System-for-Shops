from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from bson import ObjectId
from models.customer import PyObjectId

class LoanBase(BaseModel):
    customerId: PyObjectId
    productName: str
    amount: float
    loanDate: str
    dueDate: str
    status: str = "unpaid"

class LoanCreate(LoanBase):
    pass

class LoanUpdate(BaseModel):
    status: Optional[str] = None
    paymentDate: Optional[str] = None

class Loan(LoanBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    paymentDate: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True