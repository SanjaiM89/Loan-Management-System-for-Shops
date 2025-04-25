from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId
from ..database import get_database
from ..models.category import Category, CategoryCreate, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.post("/", response_model=Category)
async def create_category(category: CategoryCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    category_dict = category.dict()
    category_dict["productsCount"] = 0
    category_dict["createdAt"] = datetime.utcnow()
    result = await db.categories.insert_one(category_dict)
    
    created_category = await db.categories.find_one({"_id": result.inserted_id})
    return Category(**created_category)

@router.get("/", response_model=List[Category])
async def list_categories(db: AsyncIOMotorDatabase = Depends(get_database)):
    categories = await db.categories.find().to_list(1000)
    return [Category(**c) for c in categories]

@router.get("/{id}", response_model=Category)
async def get_category(id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    category = await db.categories.find_one({"_id": ObjectId(id)})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return Category(**category)

@router.put("/{id}", response_model=Category)
async def update_category(id: str, category: CategoryUpdate, db: AsyncIOMotorDatabase = Depends(get_database)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    
    update_dict = {k: v for k, v in category.dict(exclude_unset=True).items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    result = await db.categories.update_one(
        {"_id": ObjectId(id)},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Category not found or no changes made")
    
    updated_category = await db.categories.find_one({"_id": ObjectId(id)})
    return Category(**updated_category)

@router.delete("/{id}")
async def delete_category(id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    
    category = await db.categories.find_one({"_id": ObjectId(id)})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category has associated products
    product_count = await db.products.count_documents({"category": id})
    if product_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete category with associated products")
    
    await db.categories.delete_one({"_id": ObjectId(id)})
    return {"message": "Category deleted"}