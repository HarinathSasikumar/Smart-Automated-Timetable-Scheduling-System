from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from database import get_db
from models.subject import SubjectCreate, SubjectUpdate

router = APIRouter(prefix="/api/subjects", tags=["Subjects"])

def serialize_doc(doc):
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

@router.get("/")
async def list_subjects():
    db = get_db()
    subjects = await db.subjects.find().to_list(None)
    return [serialize_doc(s) for s in subjects]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_subject(subject: SubjectCreate):
    db = get_db()
    result = await db.subjects.insert_one(subject.model_dump())
    doc = await db.subjects.find_one({"_id": result.inserted_id})
    return serialize_doc(doc)

@router.get("/{subject_id}")
async def get_subject(subject_id: str):
    db = get_db()
    doc = await db.subjects.find_one({"_id": ObjectId(subject_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Subject not found")
    return serialize_doc(doc)

@router.put("/{subject_id}")
async def update_subject(subject_id: str, update: SubjectUpdate):
    db = get_db()
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    await db.subjects.update_one({"_id": ObjectId(subject_id)}, {"$set": update_data})
    doc = await db.subjects.find_one({"_id": ObjectId(subject_id)})
    return serialize_doc(doc)

@router.delete("/{subject_id}")
async def delete_subject(subject_id: str):
    db = get_db()
    result = await db.subjects.delete_one({"_id": ObjectId(subject_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subject not found")
    return {"message": "Subject deleted"}
