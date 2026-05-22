from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class SubjectType(str, Enum):
    theory = "theory"
    lab = "lab"
    elective = "elective"

class SubjectBase(BaseModel):
    name: str
    code: str
    department: str
    type: SubjectType = SubjectType.theory
    weekly_hours: int = 4
    is_lab: bool = False
    is_elective: bool = False
    credits: int = 4
    lab_duration_slots: Optional[int] = None  # e.g. 2 consecutive slots for labs

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    department: Optional[str] = None
    type: Optional[SubjectType] = None
    weekly_hours: Optional[int] = None
    is_lab: Optional[bool] = None
    is_elective: Optional[bool] = None
    credits: Optional[int] = None

class SubjectResponse(SubjectBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
