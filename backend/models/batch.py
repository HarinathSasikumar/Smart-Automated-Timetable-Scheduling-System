from pydantic import BaseModel, Field
from typing import Optional, List

class BatchSubject(BaseModel):
    subject_id: str
    faculty_id: str

class BatchBase(BaseModel):
    name: str
    department: str
    semester: int
    section: str = "A"
    strength: int = 60
    subjects: List[BatchSubject] = []
    academic_year: str = "2024-25"

class BatchCreate(BatchBase):
    pass

class BatchUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    section: Optional[str] = None
    strength: Optional[int] = None
    subjects: Optional[List[BatchSubject]] = None
    academic_year: Optional[str] = None

class BatchResponse(BatchBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
