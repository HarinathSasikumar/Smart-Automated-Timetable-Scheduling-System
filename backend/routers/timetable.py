from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from bson import ObjectId
from database import get_db
from models.timetable import TimetableCreate
from algorithm.scheduler import GeneticScheduler, build_faculty_timetable, build_room_timetable
from datetime import datetime
from typing import List, Optional

router = APIRouter(prefix="/api/timetable", tags=["Timetable"])

def serialize_doc(doc):
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

# ── Generate ────────────────────────────────────────────────────────────────
@router.post("/generate", status_code=status.HTTP_201_CREATED)
async def generate_timetable(payload: TimetableCreate):
    """Run genetic algorithm and store generated timetables in DB."""
    db = get_db()

    # Fetch data
    batches = []
    for bid in payload.batch_ids:
        batch = await db.batches.find_one({"_id": ObjectId(bid)})
        if batch:
            batches.append(batch)

    if not batches:
        raise HTTPException(status_code=404, detail="No valid batches found")

    all_subjects_raw = await db.subjects.find().to_list(None)
    all_faculties_raw = await db.faculty.find().to_list(None)
    all_rooms_raw = await db.rooms.find().to_list(None)

    subjects_map = {str(s["_id"]): s for s in all_subjects_raw}
    faculty_map = {str(f["_id"]): f for f in all_faculties_raw}

    if not all_rooms_raw:
        raise HTTPException(status_code=400, detail="No rooms configured. Add rooms first.")

    scheduler = GeneticScheduler(
        batches=batches,
        subjects=subjects_map,
        faculties=faculty_map,
        rooms=all_rooms_raw,
        population_size=50,
        generations=200,
        mutation_rate=0.05,
        elite_size=10,
    )

    best_chrom, fitness_history = scheduler.run()
    conflicts = scheduler.detect_conflicts(best_chrom)
    batch_timetables = scheduler.chromosome_to_timetable(best_chrom)
    faculty_view = build_faculty_timetable(batch_timetables)
    room_view = build_room_timetable(batch_timetables)

    # Save batch timetables
    inserted_ids = []
    for batch_id, tt_data in batch_timetables.items():
        tt_doc = {
            **tt_data,
            "conflicts": conflicts,
            "status": "conflict" if conflicts else "draft",
            "fitness_history": fitness_history[-20:],  # last 20 gens
            "generated_at": datetime.utcnow().isoformat(),
        }
        # Remove old draft for same batch
        await db.timetables.delete_many({"batch_id": batch_id, "status": {"$in": ["draft", "conflict"]}})
        result = await db.timetables.insert_one(tt_doc)
        inserted_ids.append(str(result.inserted_id))

    # Save faculty timetable view
    await db.faculty_timetables.drop()
    for fid, fv in faculty_view.items():
        await db.faculty_timetables.insert_one({**fv, "generated_at": datetime.utcnow().isoformat()})

    # Save room timetable view
    await db.room_timetables.drop()
    for rid, rv in room_view.items():
        await db.room_timetables.insert_one({**rv, "generated_at": datetime.utcnow().isoformat()})

    return {
        "message": "Timetable generated successfully",
        "timetable_ids": inserted_ids,
        "fitness_score": best_chrom.fitness,
        "total_conflicts": len(conflicts),
        "conflicts": conflicts[:20],  # return first 20
        "generations_run": len(fitness_history),
    }

# ── List all timetables ──────────────────────────────────────────────────────
@router.get("/")
async def list_timetables():
    db = get_db()
    tts = await db.timetables.find({}, {"week_schedule": 0}).to_list(None)
    return [serialize_doc(t) for t in tts]

# ── Get timetable by batch ───────────────────────────────────────────────────
@router.get("/batch/{batch_id}")
async def get_timetable_by_batch(batch_id: str):
    db = get_db()
    tt = await db.timetables.find_one({"batch_id": batch_id})
    if not tt:
        raise HTTPException(status_code=404, detail="Timetable not found for this batch")
    return serialize_doc(tt)

# ── Get timetable by ID ──────────────────────────────────────────────────────
@router.get("/{timetable_id}")
async def get_timetable(timetable_id: str):
    db = get_db()
    tt = await db.timetables.find_one({"_id": ObjectId(timetable_id)})
    if not tt:
        raise HTTPException(status_code=404, detail="Timetable not found")
    return serialize_doc(tt)

# ── Approve timetable ────────────────────────────────────────────────────────
@router.post("/{timetable_id}/approve")
async def approve_timetable(timetable_id: str):
    db = get_db()
    await db.timetables.update_one(
        {"_id": ObjectId(timetable_id)},
        {"$set": {"status": "approved", "approved_at": datetime.utcnow().isoformat()}}
    )
    return {"message": "Timetable approved"}

# ── Edit a slot ──────────────────────────────────────────────────────────────
@router.patch("/{timetable_id}/slot")
async def edit_slot(timetable_id: str, day: str, slot: int, subject_id: Optional[str] = None,
                    faculty_id: Optional[str] = None, room_id: Optional[str] = None):
    db = get_db()
    tt = await db.timetables.find_one({"_id": ObjectId(timetable_id)})
    if not tt:
        raise HTTPException(status_code=404, detail="Timetable not found")

    schedule = tt.get("week_schedule", {})
    day_slots = schedule.get(day, [])

    for s in day_slots:
        if s.get("slot") == slot:
            if subject_id:
                subj = await db.subjects.find_one({"_id": ObjectId(subject_id)})
                s["subject_id"] = subject_id
                s["subject_name"] = subj.get("name", "") if subj else ""
                s["is_free"] = False
            if faculty_id:
                faculty = await db.faculty.find_one({"_id": ObjectId(faculty_id)})
                s["faculty_id"] = faculty_id
                s["faculty_name"] = faculty.get("name", "") if faculty else ""
            if room_id:
                room = await db.rooms.find_one({"_id": ObjectId(room_id)})
                s["room_id"] = room_id
                s["room_name"] = room.get("name", "") if room else ""
            break

    await db.timetables.update_one(
        {"_id": ObjectId(timetable_id)},
        {"$set": {"week_schedule": schedule, "status": "draft"}}
    )
    return {"message": "Slot updated"}

# ── Delete timetable ─────────────────────────────────────────────────────────
@router.delete("/{timetable_id}")
async def delete_timetable(timetable_id: str):
    db = get_db()
    await db.timetables.delete_one({"_id": ObjectId(timetable_id)})
    return {"message": "Timetable deleted"}

# ── Faculty timetable view ───────────────────────────────────────────────────
@router.get("/view/faculty/{faculty_id}")
async def get_faculty_timetable(faculty_id: str):
    db = get_db()
    ft = await db.faculty_timetables.find_one({"faculty_id": faculty_id})
    if not ft:
        raise HTTPException(status_code=404, detail="Faculty timetable not found")
    return serialize_doc(ft)

# ── Room timetable view ──────────────────────────────────────────────────────
@router.get("/view/room/{room_id}")
async def get_room_timetable(room_id: str):
    db = get_db()
    rt = await db.room_timetables.find_one({"room_id": room_id})
    if not rt:
        raise HTTPException(status_code=404, detail="Room timetable not found")
    return serialize_doc(rt)

# ── Analytics summary ────────────────────────────────────────────────────────
@router.get("/analytics/summary")
async def analytics_summary():
    db = get_db()
    total_batches = await db.batches.count_documents({})
    total_faculty = await db.faculty.count_documents({})
    total_subjects = await db.subjects.count_documents({})
    total_rooms = await db.rooms.count_documents({})
    total_timetables = await db.timetables.count_documents({})
    approved = await db.timetables.count_documents({"status": "approved"})
    with_conflicts = await db.timetables.count_documents({"status": "conflict"})

    # Average fitness
    agg = await db.timetables.aggregate([
        {"$group": {"_id": None, "avg_fitness": {"$avg": "$fitness_score"}}}
    ]).to_list(None)
    avg_fitness = agg[0]["avg_fitness"] if agg else 0

    return {
        "total_batches": total_batches,
        "total_faculty": total_faculty,
        "total_subjects": total_subjects,
        "total_rooms": total_rooms,
        "total_timetables": total_timetables,
        "approved_timetables": approved,
        "conflict_timetables": with_conflicts,
        "average_fitness_score": round(avg_fitness, 2),
    }
