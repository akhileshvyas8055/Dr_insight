from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.smart_savings import SmartSavingsRequest, SmartSavingsResponse
from app.services.smart_savings_service import smart_savings_service

router = APIRouter()

@router.post("/", response_model=SmartSavingsResponse)
async def get_smart_savings(request: SmartSavingsRequest, db: Session = Depends(get_db)):
    """Compare prices across nearby cities with travel cost calculation"""
    try:
        return await smart_savings_service.get_smart_savings(db, request)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/nearby-cities/{city_name}")
def get_nearby_cities(city_name: str, max_distance: int = 600, db: Session = Depends(get_db)):
    """Get nearby cities with distance and travel info"""
    cities = smart_savings_service._get_nearby_cities(db, city_name, max_distance, 15)
    return {"city": city_name, "nearby_cities": cities}
