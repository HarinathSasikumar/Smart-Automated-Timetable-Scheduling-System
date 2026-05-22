from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)

class FacultyBase(BaseModel):
    name: str
    email: str
    department: str
    subjects: List[str] = []
    availability: Dict[str, List[int]] = {
        "MON": [1, 2, 3, 4, 5, 6],
        "TUE": [1, 2, 3, 4, 5, 6],
        "WED": [1, 2, 3, 4, 5, 6],
        "THU": [1, 2, 3, 4, 5, 6],
        "FRI": [1, 2, 3, 4, 5, 6],
        "SAT": [1, 2, 3, 4, 5, 6],
    }
    max_hours_per_week: int = 18
    on_leave: List[str] = []  # list of date strings "YYYY-MM-DD"

class FacultyCreate(FacultyBase):
    pass

class FacultyUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    subjects: Optional[List[str]] = None
    availability: Optional[Dict[str, List[int]]] = None
    max_hours_per_week: Optional[int] = None
    on_leave: Optional[List[str]] = None

class FacultyResponse(FacultyBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
