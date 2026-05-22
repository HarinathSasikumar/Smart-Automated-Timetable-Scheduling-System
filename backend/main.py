from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_db, close_db
from routers import auth, faculty, subjects, rooms, batches, timetable

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(
    title="Smart Timetable Scheduling API",
    description="Automated timetable generation for higher education using Genetic Algorithms",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(faculty.router)
app.include_router(subjects.router)
app.include_router(rooms.router)
app.include_router(batches.router)
app.include_router(timetable.router)

@app.get("/")
async def root():
    return {
        "message": "Smart Timetable Scheduling API",
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

