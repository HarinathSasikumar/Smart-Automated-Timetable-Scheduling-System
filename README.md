# Smart-Automated-Timetable-Scheduling-System
AI-powered timetable scheduling for higher education using a Genetic Algorithm engine, FastAPI backend, MongoDB, React + Tailwind dashboard with JWT authentication.
# 🎓 Smart Automated Timetable Scheduling System
An AI-powered, full-stack timetable scheduling solution for higher education institutions, built with React + FastAPI + MongoDB + Genetic Algorithm.
<div align="center">
![SmartSchedule AI](https://img.shields.io/badge/SmartSchedule-AI%20Powered-4f46e5?style=for-the-badge&logo=graduation-cap)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
**An AI-powered, conflict-free timetable scheduling platform for higher education institutions — built with a Genetic Algorithm engine, real-time JWT authentication, and a SaaS-grade analytics dashboard.**
[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Docs](#-api-endpoints) · [Screenshots](#-screenshots)
</div>
---
## 📖 Overview
Manual timetable scheduling in universities is complex, error-prone, and time-consuming. Faculty availability conflicts, classroom underutilization, student elective clashes, and uneven workload distribution all compound under modern academic requirements like NEP 2020.
**SmartSchedule AI** solves this by automating the entire scheduling process using a **Genetic Algorithm** that:
- Evaluates thousands of candidate timetables across **200+ generations**
- Enforces hard constraints (no room/faculty double-booking) and soft constraints (workload balance)
- Produces **conflict-free, optimized timetables** in seconds
- Provides a **real-time analytics dashboard** to monitor room utilization and faculty workload
---
## ✨ Features
- **Genetic Algorithm Engine** — auto-generates conflict-free timetables
- **Constraint Handling** — hard (no double-booking) + soft (workload balance, stress-aware)
- **Multi-view Output** — Class-wise, Faculty-wise, Room-wise timetables  
- **Conflict Detection** — real-time alerts for scheduling conflicts
- **Analytics Dashboard** — room utilization charts, workload stats
- **Manual Override** — approve, edit, delete any generated timetable
- **Self-healing** — re-generate when faculty mark leave
- **Export** — Print/PDF via browser print dialog
### 🧠 AI Scheduling Engine
- **Genetic Algorithm** with configurable population size and generation count
- Handles **hard constraints**: no faculty/room double-booking, capacity limits
- Handles **soft constraints**: balanced workload, even distribution
- Supports **Theory, Lab, and Elective** subject types
- Multi-batch, multi-department scheduling
### 🔐 Real-time Authentication
- **JWT-based** sign up and login system
- Passwords securely hashed with **bcrypt**
- Protected routes — dashboard inaccessible without a valid token
- Axios interceptors auto-attach tokens to every API request
### 📊 Analytics Dashboard
- Animated stat cards with count-up number effects
- **Faculty Workload** — Bar chart visualization
- **Subject Distribution** — Pie/Donut chart (Theory / Lab / Elective)
- **Weekly Schedule Density** — Line chart with capacity indicator
- **Room Utilization** — Radial bar chart
- Setup progress checklist
### 🗓️ Timetable Management
- Interactive grid view (Days × Time Slots)
- Color-coded cells: Theory / Lab / Free
- Approve or reject generated timetables
- Filter by batch
- Print / Export support
### 👨‍🏫 Resource Management
|
 Module   
|
 Capabilities 
|
|
----------
|
-------------
|
|
 Faculty  
|
 Add, edit, delete, mark leave dates 
|
|
 Subjects 
|
 Create Theory / Lab / Elective types, assign faculty 
|
|
 Rooms    
|
 Register classrooms and labs with capacity 
|
|
 Batches  
|
 Create student groups, assign subjects 
|
---
## 🔧 Tech Stack
## 🛠 Tech Stack
|
 Layer      
|
 Technology                     
|
|
------------
|
-------------------------------
|
|
 Frontend   
|
 React 18 + Vite + Tailwind CSS 
|
|
 Backend    
|
 FastAPI (Python 3.11+)         
|
|
 Database   
|
 MongoDB + Motor (async driver) 
|
|
 Algorithm  
|
 Genetic Algorithm (pure Python)
|
|
 Charts     
|
 Recharts                       
|
|
 Layer       
|
 Technology                            
|
|
-------------
|
---------------------------------------
|
|
 Frontend    
|
 React 18, Vite, Tailwind CSS          
|
|
 Animations  
|
 Framer Motion                         
|
|
 Charts      
|
 Recharts                              
|
|
 Backend     
|
 FastAPI (Python 3.10+)                
|
|
 Database    
|
 MongoDB (via Motor async driver)      
|
|
 Auth        
|
 JWT (
`python-jose`
) + bcrypt (
`passlib`
) 
|
|
 Algorithm   
|
 Genetic Algorithm (Python / OR-Tools) 
|
|
 Icons       
|
 Lucide React                          
|
|
 Fonts       
|
 Inter (Google Fonts)                  
|
---
## 🚀 Quick Start
## 📁 Project Structure
```
Smart Automated Timetable Scheduling System/
│
├── backend/                        # FastAPI Backend
│   ├── main.py                     # App entry point, CORS, routers
│   ├── database.py                 # MongoDB connection (Motor)
│   ├── requirements.txt            # Python dependencies
│   ├── models/
│   │   ├── faculty.py
│   │   ├── subject.py
│   │   ├── room.py
│   │   ├── batch.py
│   │   ├── timetable.py
│   │   └── user.py                 # Auth models (UserCreate, Token, etc.)
│   ├── routers/
│   │   ├── auth.py                 # /auth/signup, /auth/login
│   │   ├── faculty.py
│   │   ├── subjects.py
│   │   ├── rooms.py
│   │   ├── batches.py
│   │   └── timetable.py            # Generate + manage timetables
│   └── algorithm/
│       └── genetic.py              # Genetic Algorithm engine
│
├── frontend/                       # React + Vite Frontend
│   ├── src/
│   │   ├── api/index.js            # Axios API wrappers + JWT interceptors
│   │   ├── App.jsx                 # Routes + protected auth flow
│   │   ├── components/
│   │   │   └── Sidebar.jsx         # Gradient sidebar with nav + logout
│   │   └── pages/
│   │       ├── Login.jsx           # JWT login page
│   │       ├── SignUp.jsx          # User registration page
│   │       ├── Dashboard.jsx       # Analytics + charts hub
│   │       ├── Faculty.jsx
│   │       ├── Subjects.jsx
│   │       ├── Rooms.jsx
│   │       ├── Batches.jsx
│   │       └── Timetable.jsx       # Grid view + generate + approve
│   ├── index.css                   # Design system (cards, buttons, badges)
│   └── index.html
│
├── package.json                    # Root: run both servers together
├── start.bat                       # One-click startup script (Windows)
└── README.md
```
---
## 🚀 Getting Started
### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)
- **Node.js** v18+ and npm
- **Python** 3.10+
- **MongoDB** running locally (`mongodb://localhost:27017`) or a MongoDB Atlas connection string
### 1. Start Everything
```bat
# Double-click or run:
start.bat
### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/smart-timetable-scheduling.git
cd smart-timetable-scheduling
```
This opens two terminal windows — backend on :8000 and frontend on :5173.
### 2. Seed Demo Data
### 2. Configure Environment Variables
Create a `.env` file inside the `backend/` folder:
```env
MONGODB_URL=mongodb://localhost:27017
DB_NAME=timetable_db
SECRET_KEY=your_super_secret_jwt_key_here
```
### 3. Install Dependencies
**Backend (Python):**
```bash
cd backend
python seed_data.py
pip install -r requirements.txt
```
### 3. Open App
- **Frontend**: http://localhost:5173  
- **Backend API Docs**: http://localhost:8000/docs
**Frontend (Node):**
```bash
cd frontend
npm install
```
**Demo Login**: any email + password (4+ chars)
### 4. Run Both Servers Together
#### ▶ Option A — Single Command (from root folder)
```bash
npm install       # only needed once, installs 'concurrently'
npm run dev
```
#### ▶ Option B — Windows CMD (one-liner)
```cmd
start cmd /k "cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000" && start cmd /k "cd frontend && npm run dev"
```
#### ▶ Option C — Double-click `start.bat`
Just double-click the `start.bat` file in the root folder.
### 5. Open the App
|
 Service  
|
 URL 
|
|
----------
|
-----
|
|
 Frontend 
|
 http://localhost:5173 
|
|
 Backend API 
|
 http://localhost:8000 
|
|
 API Docs (Swagger) 
|
 http://localhost:8000/docs 
|
---
## 📁 Project Structure
## 🔌 API Endpoints
```
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── database.py             # MongoDB Motor connection
│   ├── algorithm/
│   │   └── scheduler.py        # 🧬 Genetic Algorithm Engine
│   ├── models/                 # Pydantic models
│   ├── routers/                # API route handlers
│   └── seed_data.py            # Demo data seeder
│
├── frontend/
│   └── src/
│       ├── pages/              # React pages
│       ├── components/         # Shared components
│       └── api/index.js        # Axios API client
│
└── start.bat                   # One-click startup (Windows)
```
### Authentication
|
 Method 
|
 Endpoint 
|
 Description 
|
|
--------
|
----------
|
-------------
|
|
`POST`
|
`/auth/signup`
|
 Register a new user 
|
|
`POST`
|
`/auth/login`
|
 Login and receive a JWT token 
|
### Resource APIs
|
 Method 
|
 Endpoint 
|
 Description 
|
|
--------
|
----------
|
-------------
|
|
`GET/POST`
|
`/api/faculty/`
|
 List / create faculty 
|
|
`PUT/DELETE`
|
`/api/faculty/{id}`
|
 Update / delete a faculty member 
|
|
`GET/POST`
|
`/api/subjects/`
|
 List / create subjects 
|
|
`GET/POST`
|
`/api/rooms/`
|
 List / create rooms 
|
|
`GET`
|
`/api/rooms/analytics/utilization`
|
 Room utilization stats 
|
|
`GET/POST`
|
`/api/batches/`
|
 List / create batches 
|
|
`POST`
|
`/api/timetable/generate`
|
 Run the GA engine to generate timetables 
|
|
`GET`
|
`/api/timetable/`
|
 List all generated timetables 
|
|
`POST`
|
`/api/timetable/{id}/approve`
|
 Approve a timetable 
|
|
`GET`
|
`/api/timetable/analytics/summary`
|
 Dashboard analytics summary 
|
Full interactive documentation is available at **http://localhost:8000/docs**
---
## 🧬 Algorithm Details
## 🎨 Design System
### Genetic Algorithm
- **Chromosome**: list of `(batch, subject, faculty, room, day, slot)` genes
- **Fitness Function**:
  - `-100` per faculty/room/batch conflict (hard violations)
  - `-50` per faculty availability violation
  - `-40` per lab-in-wrong-room violation
  - `-10` per repeated subject in same day
  - `-15` per stress cluster (3+ labs in a row)
  - `+5` per well-utilized room (70-100% capacity)
- **Selection**: Tournament selection (k=5)
- **Crossover**: Two-point crossover
- **Mutation**: 5% rate — random day/slot/room swap
- **Population**: 50 chromosomes, 200 generations, 10 elites
The UI follows a **SaaS-grade light-mode design** built with:
- **Primary**: Indigo `#4F46E5`
- **Secondary**: Cyan `#06B6D4`
- **Accent**: Emerald `#10B981`
- **Background**: Slate `#F8FAFC`
- **Font**: [Inter](https://fonts.google.com/specimen/Inter) — clean, highly legible at all sizes
All components use utility-first Tailwind CSS classes with custom design tokens defined in `index.css`.
---
## 📊 API Endpoints
## 🔐 Security
|
 Method 
|
 Route 
|
 Description 
|
|
--------
|
-------
|
-------------
|
|
 GET    
|
`/api/faculty/`
|
 List all faculty 
|
|
 POST   
|
`/api/faculty/`
|
 Add faculty 
|
|
 POST   
|
`/api/timetable/generate`
|
 🧬 Run GA & generate 
|
|
 GET    
|
`/api/timetable/batch/{id}`
|
 Get batch timetable 
|
|
 POST   
|
`/api/timetable/{id}/approve`
|
 Approve timetable 
|
|
 GET    
|
`/api/timetable/analytics/summary`
|
 Dashboard stats 
|
- Passwords are **never stored in plaintext** — bcrypt hashing is enforced
- JWTs are signed with a configurable `SECRET_KEY` and expire after 60 minutes
- All protected frontend routes redirect unauthenticated users to `/`
- Axios automatically attaches `Authorization: Bearer <token>` to every API call
Full interactive docs: **http://localhost:8000/docs**
---
## 🧬 Genetic Algorithm
The scheduling engine (`backend/algorithm/genetic.py`) works as follows:
1. **Initialization** — Generate a population of random valid timetable candidates
2. **Fitness Evaluation** — Score each candidate based on:
   - Hard constraint violations (conflicts → heavy penalty)
   - Soft constraint adherence (workload balance, room efficiency)
3. **Selection** — Tournament selection of the fittest candidates
4. **Crossover** — Combine two parent timetables to produce children
5. **Mutation** — Randomly swap slot assignments to explore new solutions
6. **Repeat** for 200+ generations until convergence
---
## 🌐 Deployment
## 📦 Deployment
|
 Service   
|
 Platform Recommendation 
|
|
-----------
|
------------------------
|
|
 Frontend  
|
 Vercel / Netlify        
|
|
 Backend   
|
 Render / Railway        
|
|
 Database  
|
 MongoDB Atlas           
|
|
 Service    
|
 Platform           
|
|
------------
|
--------------------
|
|
 Frontend   
|
[
Vercel
](
https://vercel.com
)
 or 
[
Netlify
](
https://netlify.com
)
|
|
 Backend    
|
[
Render
](
https://render.com
)
 or 
[
Railway
](
https://railway.app
)
|
|
 Database   
|
[
MongoDB Atlas
](
https://www.mongodb.com/atlas
)
|
Set `VITE_API_URL` env var in frontend to point to deployed backend.
---
## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.
1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request
---
## 📋 MongoDB Schema
## 📄 License
See `backend/models/` for full Pydantic schemas. Key collections:
- `faculty` — Staff with availability grids
- `subjects` — Theory/Lab/Elective courses
- `rooms` — Classrooms and labs
- `batches` — Class groups with subject-faculty pairs
- `timetables` — Day-wise weekly schedules
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
---
<div align="center">
Built with ❤️ for higher education institutions using AI-powered automation.
**SmartSchedule AI** — Conflict-free timetables in seconds.
</div>
