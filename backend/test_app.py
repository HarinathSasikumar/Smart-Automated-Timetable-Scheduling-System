import asyncio
import traceback
from fastapi.testclient import TestClient
from main import app, connect_db, close_db

client = TestClient(app)

async def test_auth():
    print("Testing signup and login...")
    try:
        await connect_db()
        # Ensure user doesn't block signup if already there
        client.post("/auth/signup", json={"name": "Debug User", "email": "debug_auth@college.edu", "password": "password123"})
        
        response = client.post("/auth/login", json={"email": "debug_auth@college.edu", "password": "password123"})
        print(response.status_code, "Login Response:", response.text)
        await close_db()
    except Exception as e:
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_auth())
