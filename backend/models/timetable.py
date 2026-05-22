from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

class TimetableStatus(str, Enum):
    draft = "draft"
    approved = "approved"
    conflict = "conflict"

class TimeSlot(BaseModel):
    slot: int                    # 1-6 (period number)
    subject_id: Optional[str] = None
    subject_name: Optional[str] = None
    faculty_id: Optional[str] = None
    faculty_name: Optional[str] = None
    room_id: Optional[str] = None
    room_name: Optional[str] = None
    is_break: bool = False
    is_free: bool = False

class DaySchedule(BaseModel):
    day: str
    slots: List[TimeSlot] = []

class TimetableBase(BaseModel):
    batch_id: str
    batch_name: Optional[str] = None
    week_schedule: Dict[str, List[Dict[str, Any]]] = {}
    status: TimetableStatus = TimetableStatus.draft
    conflicts: List[str] = []
    fitness_score: float = 0.0
    academic_year: str = "2024-25"

class TimetableCreate(BaseModel):
    batch_ids: List[str]  # generate for these batches

class TimetableResponse(TimetableBase):
    id: str = Field(alias="_id")
    generated_at: Optional[str] = None

    class Config:
        populate_by_name = True
