from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from database import get_db
from models.faculty import FacultyCreate, FacultyUpdate

router = APIRouter(prefix="/api/faculty", tags=["Faculty"])

def serialize_doc(doc):
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

@router.get("/")
async def list_faculty():
    db = get_db()
    faculty_list = await db.faculty.find().to_list(None)
    return [serialize_doc(f) for f in faculty_list]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_faculty(faculty: FacultyCreate):
    db = get_db()
    result = await db.faculty.insert_one(faculty.model_dump())
    new_doc = await db.faculty.find_one({"_id": result.inserted_id})
    return serialize_doc(new_doc)

@router.get("/{faculty_id}")
async def get_faculty(faculty_id: str):
    db = get_db()
    doc = await db.faculty.find_one({"_id": ObjectId(faculty_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Faculty not found")
    return serialize_doc(doc)

@router.put("/{faculty_id}")
async def update_faculty(faculty_id: str, update: FacultyUpdate):
    db = get_db()
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    await db.faculty.update_one({"_id": ObjectId(faculty_id)}, {"$set": update_data})
    doc = await db.faculty.find_one({"_id": ObjectId(faculty_id)})
    return serialize_doc(doc)

@router.delete("/{faculty_id}")
async def delete_faculty(faculty_id: str):
    db = get_db()
    result = await db.faculty.delete_one({"_id": ObjectId(faculty_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Faculty not found")
    return {"message": "Faculty deleted"}

@router.post("/{faculty_id}/leave")
async def mark_leave(faculty_id: str, dates: list[str]):
    """Mark faculty on leave for specific dates (triggers self-healing)."""
    db = get_db()
    await db.faculty.update_one(
        {"_id": ObjectId(faculty_id)},
        {"$addToSet": {"on_leave": {"$each": dates}}}
    )
    doc = await db.faculty.find_one({"_id": ObjectId(faculty_id)})
    return {"message": f"Leave marked", "faculty": serialize_doc(doc)}
