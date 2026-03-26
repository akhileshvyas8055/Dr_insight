from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.query_service import QueryService

router = APIRouter()

@router.get('/overview')
def overview(db: Session = Depends(get_db)):
    qs = QueryService(db)
    base = qs.fetch_one("""
        SELECT
          (SELECT COUNT(*) FROM hospitals) AS hospitals,
          (SELECT COUNT(*) FROM hospital_prices) AS price_rows,
          (SELECT COUNT(*) FROM procedures) AS procedures,
          (SELECT COUNT(*) FROM cities) AS cities,
          (SELECT ROUND(AVG(package_price_demo), 2) FROM hospital_prices) AS avg_package_price
    """)
    return base

@router.get('/city-stats')
def city_stats(limit: int = Query(20, le=100), db: Session = Depends(get_db)):
    qs = QueryService(db)
    return qs.fetch_all("""
        SELECT city, state,
               COUNT(*) AS price_records,
               ROUND(AVG(package_price_demo), 2) AS avg_price,
               MIN(package_price_demo) AS min_price,
               MAX(package_price_demo) AS max_price,
               ROUND(MAX(package_price_demo) - MIN(package_price_demo), 2) AS price_spread
        FROM hospital_prices
        GROUP BY city, state
        ORDER BY price_records DESC, avg_price DESC
        LIMIT :limit
    """, {"limit": limit})

@router.get('/procedure-variation')
def procedure_variation(limit: int = Query(20, le=100), db: Session = Depends(get_db)):
    qs = QueryService(db)
    return qs.fetch_all("""
        SELECT procedure_name, category,
               COUNT(*) AS price_records,
               ROUND(AVG(package_price_demo), 2) AS avg_price,
               MIN(package_price_demo) AS min_price,
               MAX(package_price_demo) AS max_price,
               ROUND(MAX(package_price_demo) - MIN(package_price_demo), 2) AS price_spread,
               CASE WHEN AVG(package_price_demo) > 0
                    THEN ROUND(1.0 * (MAX(package_price_demo) - MIN(package_price_demo)) / AVG(package_price_demo), 4)
                    ELSE 0 END AS cv_ratio
        FROM hospital_prices
        GROUP BY procedure_name, category
        ORDER BY cv_ratio DESC, price_records DESC
        LIMIT :limit
    """, {"limit": limit})

@router.get('/hidden-charges')
def hidden_charges(db: Session = Depends(get_db)):
    qs = QueryService(db)
    return qs.fetch_one("""
        SELECT
          COUNT(*) AS survey_rows,
          SUM(CASE WHEN hidden_charges='Yes' THEN 1 ELSE 0 END) AS rows_with_hidden_charges,
          ROUND(AVG(hidden_charge_amount), 2) AS avg_hidden_charge_amount,
          ROUND(AVG(CASE WHEN amount_paid > 0 THEN 1.0 * hidden_charge_amount / amount_paid END), 4) AS avg_hidden_share
        FROM survey_billing
    """)
