"""
Seed script: populates MongoDB with demo data for quick testing.
Run: python seed_data.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "timetable_db"

async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    # Clear existing data
    for col in ['faculty', 'subjects', 'rooms', 'batches', 'timetables']:
        await db[col].drop()
    print("🗑  Cleared existing collections")

    # ── Subjects ─────────────────────────────────────────────────────────────
    subjects_data = [
        {"name": "Data Structures & Algorithms", "code": "CS301", "department": "CSE", "type": "theory", "weekly_hours": 4, "is_lab": False, "is_elective": False, "credits": 4},
        {"name": "Database Management Systems",  "code": "CS302", "department": "CSE", "type": "theory", "weekly_hours": 3, "is_lab": False, "is_elective": False, "credits": 3},
        {"name": "DBMS Lab",                     "code": "CS302L","department": "CSE", "type": "lab",    "weekly_hours": 2, "is_lab": True,  "is_elective": False, "credits": 2},
        {"name": "Operating Systems",             "code": "CS303", "department": "CSE", "type": "theory", "weekly_hours": 4, "is_lab": False, "is_elective": False, "credits": 4},
        {"name": "Computer Networks",             "code": "CS304", "department": "CSE", "type": "theory", "weekly_hours": 3, "is_lab": False, "is_elective": False, "credits": 3},
        {"name": "Machine Learning",              "code": "CS401", "department": "CSE", "type": "elective","weekly_hours":3, "is_lab": False, "is_elective": True,  "credits": 3},
        {"name": "Mathematics III",               "code": "MA301", "department": "CSE", "type": "theory", "weekly_hours": 4, "is_lab": False, "is_elective": False, "credits": 4},
    ]
    sub_result = await db.subjects.insert_many(subjects_data)
    subj_ids = [str(oid) for oid in sub_result.inserted_ids]
    print(f"✅ Inserted {len(subj_ids)} subjects")

    # ── Faculty ──────────────────────────────────────────────────────────────
    avail_full = {d: [1,2,3,4,5,6] for d in ["MON","TUE","WED","THU","FRI","SAT"]}
    avail_no_sat = {d: [1,2,3,4,5,6] for d in ["MON","TUE","WED","THU","FRI"]}
    avail_no_sat["SAT"] = []

    faculty_data = [
        {"name": "Dr. Ramesh Kumar",   "email": "ramesh@college.edu",   "department": "CSE", "subjects": subj_ids[:3], "availability": avail_full,   "max_hours_per_week": 18, "on_leave": []},
        {"name": "Prof. Priya Nair",   "email": "priya@college.edu",    "department": "CSE", "subjects": subj_ids[2:5],"availability": avail_no_sat, "max_hours_per_week": 16, "on_leave": []},
        {"name": "Dr. Suresh Babu",    "email": "suresh@college.edu",   "department": "CSE", "subjects": [subj_ids[4],subj_ids[5]], "availability": avail_full, "max_hours_per_week": 20, "on_leave": []},
        {"name": "Prof. Anita Sharma", "email": "anita@college.edu",    "department": "CSE", "subjects": [subj_ids[6]], "availability": avail_no_sat, "max_hours_per_week": 14, "on_leave": []},
    ]
    fac_result = await db.faculty.insert_many(faculty_data)
    fac_ids = [str(oid) for oid in fac_result.inserted_ids]
    print(f"✅ Inserted {len(fac_ids)} faculty")

    # ── Rooms ────────────────────────────────────────────────────────────────
    avail_rooms = {d: [1,2,3,4,5,6] for d in ["MON","TUE","WED","THU","FRI","SAT"]}
    rooms_data = [
        {"name": "Room 101", "building": "Block A", "floor": 1, "type": "classroom", "capacity": 65, "has_projector": True,  "has_ac": True,  "availability": avail_rooms},
        {"name": "Room 102", "building": "Block A", "floor": 1, "type": "classroom", "capacity": 60, "has_projector": True,  "has_ac": False, "availability": avail_rooms},
        {"name": "Room 201", "building": "Block B", "floor": 2, "type": "classroom", "capacity": 70, "has_projector": False, "has_ac": True,  "availability": avail_rooms},
        {"name": "CS Lab 1", "building": "Block C", "floor": 0, "type": "lab",       "capacity": 40, "has_projector": True,  "has_ac": True,  "availability": avail_rooms},
        {"name": "CS Lab 2", "building": "Block C", "floor": 0, "type": "lab",       "capacity": 40, "has_projector": True,  "has_ac": True,  "availability": avail_rooms},
    ]
    room_result = await db.rooms.insert_many(rooms_data)
    room_ids = [str(oid) for oid in room_result.inserted_ids]
    print(f"✅ Inserted {len(room_ids)} rooms")

    # ── Batches ──────────────────────────────────────────────────────────────
    batches_data = [
        {
            "name": "CSE-3A", "department": "CSE", "semester": 3, "section": "A", "strength": 60, "academic_year": "2024-25",
            "subjects": [
                {"subject_id": subj_ids[0], "faculty_id": fac_ids[0]},
                {"subject_id": subj_ids[1], "faculty_id": fac_ids[1]},
                {"subject_id": subj_ids[2], "faculty_id": fac_ids[1]},  # DBMS Lab
                {"subject_id": subj_ids[3], "faculty_id": fac_ids[0]},
                {"subject_id": subj_ids[6], "faculty_id": fac_ids[3]},
            ]
        },
        {
            "name": "CSE-3B", "department": "CSE", "semester": 3, "section": "B", "strength": 58, "academic_year": "2024-25",
            "subjects": [
                {"subject_id": subj_ids[0], "faculty_id": fac_ids[0]},
                {"subject_id": subj_ids[1], "faculty_id": fac_ids[1]},
                {"subject_id": subj_ids[4], "faculty_id": fac_ids[2]},
                {"subject_id": subj_ids[5], "faculty_id": fac_ids[2]},  # ML elective
                {"subject_id": subj_ids[6], "faculty_id": fac_ids[3]},
            ]
        },
    ]
    batch_result = await db.batches.insert_many(batches_data)
    batch_ids = [str(oid) for oid in batch_result.inserted_ids]
    print(f"✅ Inserted {len(batch_ids)} batches")

    print("\n🎉 Seed complete! IDs:")
    print(f"   Batches: {batch_ids}")
    print(f"\n▶  Now open the app, go to Timetable page, select batches and click Generate!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
