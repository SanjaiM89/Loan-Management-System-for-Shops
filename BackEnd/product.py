from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1)
    unit: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)  # Category ID
    photo: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: Optional[str] = None
    unit: Optional[str] = None
    category: Optional[str] = None

class Product(ProductBase):
    id: str = Field(..., alias="_id")
    createdAt: datetime

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True