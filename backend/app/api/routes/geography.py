from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.query_service import QueryService

router = APIRouter()

@router.get('/map-points')
def map_points(limit: int = Query(500, le=2000), city: str | None = None, db: Session = Depends(get_db)):
    qs = QueryService(db)
    return qs.fetch_all("""
        SELECT hospital_name, city, type, latitude, longitude
        FROM hospital_locations
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
          AND latitude != 0 AND longitude != 0
          AND (:city IS NULL OR city = :city)
        LIMIT :limit
    """, {"limit": limit, "city": city})

@router.get('/deserts')
def deserts(limit: int = Query(25, le=100), db: Session = Depends(get_db)):
    qs = QueryService(db)
    return qs.fetch_all("""
        SELECT c.city, c.state, c.coverage_type,
               COALESCE(COUNT(h.hospital_id), 0) AS hospital_count,
               COALESCE(ROUND(AVG(h.beds), 2), 0) AS avg_beds,
               CASE
                 WHEN COALESCE(COUNT(h.hospital_id), 0) = 0 THEN 'Critical desert'
                 WHEN COALESCE(COUNT(h.hospital_id), 0) <= 3 THEN 'Severe shortage'
                 WHEN COALESCE(COUNT(h.hospital_id), 0) <= 8 THEN 'Moderate shortage'
                 ELSE 'Relatively served'
               END AS access_band
        FROM cities c
        LEFT JOIN hospitals h ON h.city = c.city AND h.state = c.state
        GROUP BY c.city, c.state, c.coverage_type
        ORDER BY hospital_count ASC, avg_beds ASC
        LIMIT :limit
    """, {"limit": limit})

@router.get('/nearest-by-pincode')
def nearest_by_pincode(pincode: int, db: Session = Depends(get_db)):
    qs = QueryService(db)
    return qs.fetch_all("""
        SELECT hospital_name, city, state, pincode, hospital_type, ownership_type, rating, beds,
               ABS(pincode - :pincode) AS pincode_distance_proxy
        FROM hospitals
        ORDER BY ABS(pincode - :pincode), rating DESC
        LIMIT 10
    """, {"pincode": pincode})
