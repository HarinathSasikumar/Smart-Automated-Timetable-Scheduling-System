@echo off
echo Starting Smart Automated Timetable Scheduling System...

echo Starting Backend API...
start cmd /k "cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Frontend Dev Server...
start cmd /k "cd frontend && npm run dev"

echo Both servers should now be starting up in separate windows!
exit
