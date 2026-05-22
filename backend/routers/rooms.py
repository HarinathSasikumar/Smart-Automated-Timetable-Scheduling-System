from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from database import get_db
from models.room import RoomCreate, RoomUpdate

router = APIRouter(prefix="/api/rooms", tags=["Rooms"])

def serialize_doc(doc):
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

@router.get("/")
async def list_rooms():
    db = get_db()
    rooms = await db.rooms.find().to_list(None)
    return [serialize_doc(r) for r in rooms]

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_room(room: RoomCreate):
    db = get_db()
    result = await db.rooms.insert_one(room.model_dump())
    doc = await db.rooms.find_one({"_id": result.inserted_id})
    return serialize_doc(doc)

@router.get("/{room_id}")
async def get_room(room_id: str):
    db = get_db()
    doc = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Room not found")
    return serialize_doc(doc)

@router.put("/{room_id}")
async def update_room(room_id: str, update: RoomUpdate):
    db = get_db()
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    await db.rooms.update_one({"_id": ObjectId(room_id)}, {"$set": update_data})
    doc = await db.rooms.find_one({"_id": ObjectId(room_id)})
    return serialize_doc(doc)

@router.delete("/{room_id}")
async def delete_room(room_id: str):
    db = get_db()
    result = await db.rooms.delete_one({"_id": ObjectId(room_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room deleted"}

@router.get("/analytics/utilization")
async def room_utilization():
    """Returns utilization stats for all rooms."""
    db = get_db()
    rooms = await db.rooms.find().to_list(None)
    timetables = await db.timetables.find().to_list(None)

    utilization = {}
    for room in rooms:
        room_id = str(room["_id"])
        utilization[room_id] = {
            "room_name": room.get("name"),
            "capacity": room.get("capacity"),
            "total_slots": 36,  # 6 days * 6 slots
            "used_slots": 0,
            "utilization_pct": 0,
        }

    for tt in timetables:
        for day, slots in tt.get("week_schedule", {}).items():
            for slot in slots:
                rid = slot.get("room_id")
                if rid and rid in utilization and not slot.get("is_free"):
                    utilization[rid]["used_slots"] += 1

    for rid in utilization:
        used = utilization[rid]["used_slots"]
        total = utilization[rid]["total_slots"]
        utilization[rid]["utilization_pct"] = round((used / total) * 100, 2)

    return list(utilization.values())
