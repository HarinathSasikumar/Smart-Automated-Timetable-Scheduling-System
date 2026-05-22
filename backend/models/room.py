from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from enum import Enum

class RoomType(str, Enum):
    classroom = "classroom"
    lab = "lab"
    seminar = "seminar"
    auditorium = "auditorium"

class RoomBase(BaseModel):
    name: str
    building: Optional[str] = None
    floor: Optional[int] = None
    type: RoomType = RoomType.classroom
    capacity: int
    has_projector: bool = False
    has_ac: bool = False
    availability: Dict[str, List[int]] = {
        "MON": [1, 2, 3, 4, 5, 6],
        "TUE": [1, 2, 3, 4, 5, 6],
        "WED": [1, 2, 3, 4, 5, 6],
        "THU": [1, 2, 3, 4, 5, 6],
        "FRI": [1, 2, 3, 4, 5, 6],
        "SAT": [1, 2, 3, 4, 5, 6],
    }

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[int] = None
    type: Optional[RoomType] = None
    capacity: Optional[int] = None
    has_projector: Optional[bool] = None
    has_ac: Optional[bool] = None
    availability: Optional[Dict[str, List[int]]] = None

class RoomResponse(RoomBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
