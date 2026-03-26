from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.query_service import QueryService

router = APIRouter()

@router.get('/')
def insights(db: Session = Depends(get_db)):
    qs = QueryService(db)
    return {
        "most_expensive_cities": qs.fetch_all("""
            SELECT city, state, ROUND(AVG(package_price_demo), 2) AS avg_price
            FROM hospital_prices
            GROUP BY city, state
            ORDER BY avg_price DESC
            LIMIT 5
        """),
        "widest_spread_procedures": qs.fetch_all("""
            SELECT procedure_name,
                   ROUND(MAX(package_price_demo) - MIN(package_price_demo), 2) AS price_spread,
                   CASE WHEN AVG(package_price_demo) > 0
                        THEN ROUND(1.0 * (MAX(package_price_demo) - MIN(package_price_demo)) / AVG(package_price_demo), 4)
                        ELSE 0 END AS cv_ratio
            FROM hospital_prices
            GROUP BY procedure_name
            ORDER BY cv_ratio DESC
            LIMIT 5
        """),
        "lowest_coverage_cities": qs.fetch_all("""
            SELECT c.city, c.state,
                   COUNT(h.hospital_id) AS hospital_count
            FROM cities c
            LEFT JOIN hospitals h ON h.city = c.city AND h.state = c.state
            GROUP BY c.city, c.state
            ORDER BY hospital_count ASC
            LIMIT 5
        """),
    }
