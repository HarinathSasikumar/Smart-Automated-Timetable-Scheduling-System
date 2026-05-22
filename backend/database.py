from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    db_name: str = os.getenv("DB_NAME", "timetable_db")
    secret_key: str = os.getenv("SECRET_KEY", "supersecretkey")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

settings = Settings()

class Database:
    client: AsyncIOMotorClient = None

db_instance = Database()

async def connect_db():
    db_instance.client = AsyncIOMotorClient(settings.mongodb_url)
    print("Connected to MongoDB")

async def close_db():
    if db_instance.client:
        db_instance.client.close()
        print("Disconnected from MongoDB")

def get_db():
    return db_instance.client[settings.db_name]
