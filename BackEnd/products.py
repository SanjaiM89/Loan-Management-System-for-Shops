from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId
from ..database import get_database
from ..models.product import Product, ProductCreate, ProductUpdate
from ..models.category import Category

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("/", response_model=Product)
async def create_product(product: ProductCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    # Verify category exists
    category = await db.categories.find_one({"_id": ObjectId(product.category)})
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category ID")
    
    product_dict = product.dict()
    product_dict["createdAt"] = datetime.utcnow()
    result = await db.products.insert_one(product_dict)
    
    # Update category productsCount
    await db.categories.update_one(
        {"_id": ObjectId(product.category)},
        {"$inc": {"productsCount": 1}}
    )
    
    created_product = await db.products.find_one({"_id": result.inserted_id})
    return Product(**created_product)

@router.get("/", response_model=List[Product])
async def list_products(db: AsyncIOMotorDatabase = Depends(get_database)):
    products = await db.products.find().to_list(1000)
    return [Product(**p) for p in products]

@router.get("/{id}", response_model=Product)
async def get_product(id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    product = await db.products.find_one({"_id": ObjectId(id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@router.put("/{id}", response_model=Product)
async def update_product(id: str, product: ProductUpdate, db: AsyncIOMotorDatabase = Depends(get_database)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    update_dict = {k: v for k, v in product.dict(exclude_unset=True).items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    # Verify category exists if provided
    if "category" in update_dict:
        category = await db.categories.find_one({"_id": ObjectId(update_dict["category"])})
        if not category:
            raise HTTPException(status_code=400, detail="Invalid category ID")
        
        # Update productsCount if category changes
        existing_product = await db.products.find_one({"_id": ObjectId(id)})
        if existing_product and existing_product["category"] != update_dict["category"]:
            await db.categories.update_one(
                {"_id": ObjectId(existing_product["category"])},
                {"$inc": {"productsCount": -1}}
            )
            await db.categories.update_one(
                {"_id": ObjectId(update_dict["category"])},
                {"$inc": {"productsCount": 1}}
            )
    
    result = await db.products.update_one(
        {"_id": ObjectId(id)},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found or no changes made")
    
    updated_product = await db.products.find_one({"_id": ObjectId(id)})
    return Product(**updated_product)

@router.delete("/{id}")
async def delete_product(id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    product = await db.products.find_one({"_id": ObjectId(id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.products.delete_one({"_id": ObjectId(id)})
    
    # Update category productsCount
    await db.categories.update_one(
        {"_id": ObjectId(product["category"])},
        {"$inc": {"productsCount": -1}}
    )
    
    return {"message": "Product deleted"}