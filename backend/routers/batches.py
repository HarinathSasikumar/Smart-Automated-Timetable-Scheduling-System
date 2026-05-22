from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from database import get_db
from models.batch import BatchCreate, BatchUpdate

router = APIRouter(prefix="/api/batches", tags=["Batches"])

def serialize_doc(doc):
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

@router.get("/")
async def list_batches():
    db = get_db()
    batches = await db.batches.find().to_list(None)
    return [serialize_doc(b) for b in batches]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_batch(batch: BatchCreate):
    db = get_db()
    result = await db.batches.insert_one(batch.model_dump())
    doc = await db.batches.find_one({"_id": result.inserted_id})
    return serialize_doc(doc)

@router.get("/{batch_id}")
async def get_batch(batch_id: str):
    db = get_db()
    doc = await db.batches.find_one({"_id": ObjectId(batch_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Batch not found")
    return serialize_doc(doc)

@router.put("/{batch_id}")
async def update_batch(batch_id: str, update: BatchUpdate):
    db = get_db()
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    await db.batches.update_one({"_id": ObjectId(batch_id)}, {"$set": update_data})
    doc = await db.batches.find_one({"_id": ObjectId(batch_id)})
    return serialize_doc(doc)

@router.delete("/{batch_id}")
async def delete_batch(batch_id: str):
    db = get_db()
    result = await db.batches.delete_one({"_id": ObjectId(batch_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Batch not found")
    return {"message": "Batch deleted"}
