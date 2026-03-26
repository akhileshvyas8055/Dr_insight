from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.nearby_hospitals import NearestHospitalsRequest
from app.services.nearby_hospitals_service import nearby_hospitals_service

router = APIRouter()

@router.post("/nearby-hospitals")
async def find_nearest_hospitals(request: NearestHospitalsRequest, db: Session = Depends(get_db)):
    """Find nearest hospitals from user's live location"""
    try:
        return await nearby_hospitals_service.find_nearest_with_voice(db, request)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/directions/{hospital_id}")
async def get_directions(
    hospital_id: int,
    hospital_name: str,
    user_lat: float, user_lng: float,
    language: str = "en-IN", speaker: str = "anushka",
    db: Session = Depends(get_db),
):
    """Get route directions from user location to hospital"""
    try:
        return await nearby_hospitals_service.get_directions_with_voice(
            db, user_lat, user_lng, hospital_id, hospital_name, language, speaker,
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
