from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db

router = APIRouter()

class LeadCreate(BaseModel):
    hospital_name: str
    hospital_id: Optional[str] = None
    city: str
    procedure_name: str
    procedure_id: Optional[str] = None
    full_name: str
    phone_number: str
    preferred_date: str
    message: Optional[str] = ""
    lead_type: str  # "Book Appointment" or "Contact Hospital"

@router.post("/")
def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    sql = """
        INSERT INTO leads (
            hospital_name, hospital_id, city, procedure_name, procedure_id, 
            full_name, phone_number, preferred_date, message, lead_type
        ) VALUES (
            :hospital_name, :hospital_id, :city, :procedure_name, :procedure_id,
            :full_name, :phone_number, :preferred_date, :message, :lead_type
        )
    """
    db.execute(text(sql), lead.dict())
    db.commit()
    return {"message": "Lead saved successfully"}

@router.get("/")
def get_leads(
    hospital: Optional[str] = None,
    city: Optional[str] = None,
    procedure: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = "SELECT * FROM leads WHERE 1=1"
    params = {}
    
    if hospital:
        query += " AND hospital_name LIKE :hospital"
        params["hospital"] = f"%{hospital}%"
    if city:
        query += " AND city LIKE :city"
        params["city"] = f"%{city}%"
    if procedure:
        query += " AND procedure_name LIKE :procedure"
        params["procedure"] = f"%{procedure}%"
    if start_date:
        query += " AND date(created_at) >= date(:start_date)"
        params["start_date"] = start_date
    if end_date:
        query += " AND date(created_at) <= date(:end_date)"
        params["end_date"] = end_date
        
    query += " ORDER BY created_at DESC"
    
    rows = db.execute(text(query), params).fetchall()
    return [dict(row._mapping) for row in rows]
