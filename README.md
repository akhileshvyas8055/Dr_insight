# D₹ Insights

Production-ready starter for **D₹ Insights** — an India-focused hospital price transparency web app.

## Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS + Recharts + React Leaflet
- Backend: FastAPI + SQLAlchemy + Pydantic
- Database: SQLite (`dr_insights.db`)
- Data Pipeline: Python scripts (`rebuild_db.py`, `regenerate_data.py`)

## Honest Data Note
This project uses your uploaded hybrid dataset. Procedure names, benchmark rates, city coverage, and seed files are grounded in real uploaded sources. Most hospital records in the 5200-hospital master and hospital-level price rows are augmented demo records intended for product demo and analytics, not verified production truth.

## Included Modules
- **Overview & Analytics:** Comprehensive charts on procedure prices and ranges.
- **Price Comparison:** City-specific variance comparisons for routine procedures (like CT scans and checkups).
- **Smart Savings:** Advanced calculation and mapping experience for out-of-pocket health savings.
- **Fair Price Checker:** Verify if a quoted price aligns with the benchmark average.
- **Healthcare Map:** Explore and drill down into geographical distributions of hospitals and services.
- **Tejas AI Assistant:** Global floating interactive chat & voice bot leveraging Sarvam service API.

## Quick Start (Local Development)
To run the application locally on your machine, you need to start the backend and frontend separately.

**1. Copy the environment variables:**
```bash
cp .env.example .env
```
*(Make sure to add your SARVAM API keys inside `.env`)*

**2. Start the Backend API:**
```bash
cd backend
# Create and activate a Virtual Environment if necessary
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend docs will be at: http://localhost:8000/docs*

**3. Start the Frontend:**
Open a new terminal session.
```bash
cd frontend
npm install
npm run dev
```
*Frontend will be running at: http://localhost:5173*

## Structure
```text
backend/     FastAPI app & SQLite database
frontend/    Vite + React app
database/    SQL schema documents & old scripts
data/        Raw seed data and geodata CSVs
docs/        Architecture and reference notes
```
