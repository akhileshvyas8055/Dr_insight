from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.query_service import QueryService

router = APIRouter()

@router.get('/prices')
def prices(
    city: str | None = None,
    procedure: str | None = None,
    hospital: str | None = None,
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    qs = QueryService(db)
    sql = """
        SELECT p.hospital_id, p.hospital_name, p.city, p.state, p.procedure_id, p.procedure_name, p.category,
               p.benchmark_rate_real, p.listed_price_demo, p.package_price_demo,
               ROUND(p.package_price_demo - p.benchmark_rate_real, 2) AS premium_vs_benchmark,
               CASE
                 WHEN p.package_price_demo <= p.benchmark_rate_real * 0.90 THEN 'Under benchmark'
                 WHEN p.package_price_demo <= p.benchmark_rate_real * 1.20 THEN 'Reasonable'
                 WHEN p.package_price_demo <= p.benchmark_rate_real * 1.60 THEN 'High'
                 ELSE 'Very high'
               END AS fairness_band,
               h.rating
        FROM hospital_prices p
        LEFT JOIN hospitals h ON p.hospital_id = h.hospital_id
        WHERE (:city IS NULL OR p.city = :city)
          AND (:procedure IS NULL OR p.procedure_name = :procedure)
          AND (:hospital IS NULL OR p.hospital_name LIKE '%' || :hospital || '%')
        ORDER BY p.package_price_demo ASC
        LIMIT :limit OFFSET :offset
    """
    return qs.fetch_all(sql, {"city": city, "procedure": procedure, "hospital": hospital, "limit": limit, "offset": offset})

@router.get('/fair-price-checker')
def fair_price_checker(procedure: str, city: str, quote: float, db: Session = Depends(get_db)):
    qs = QueryService(db)
    row = qs.fetch_one("""
        SELECT procedure_name, city,
               ROUND(AVG(package_price_demo), 2) AS avg_price,
               ROUND(AVG(package_price_demo), 2) AS median_price,
               MIN(package_price_demo) AS min_price,
               MAX(package_price_demo) AS max_price,
               ROUND(AVG(benchmark_rate_real), 2) AS benchmark_rate_real
        FROM hospital_prices
        WHERE city = :city AND procedure_name = :procedure
        GROUP BY city, procedure_name
        LIMIT 1
    """, {"city": city, "procedure": procedure})
    if not row:
        return {"found": False, "message": "No city-procedure reference found for this combination."}
    median = float(row['median_price'])
    benchmark = float(row['benchmark_rate_real'])
    if quote <= median * 0.9:
        verdict = 'Good deal'
    elif quote <= median * 1.15:
        verdict = 'Fair'
    elif quote <= median * 1.4:
        verdict = 'Expensive'
    else:
        verdict = 'Potentially unfair'
    return {
        "found": True,
        **row,
        "user_quote": quote,
        "delta_vs_median": round(quote - median, 2),
        "delta_vs_benchmark": round(quote - benchmark, 2),
        "verdict": verdict,
    }

@router.get('/cities')
def cities(db: Session = Depends(get_db)):
    qs = QueryService(db)
    return qs.fetch_all("SELECT city, state FROM cities ORDER BY city")

@router.get('/procedures')
def procedures(db: Session = Depends(get_db)):
    qs = QueryService(db)
    return qs.fetch_all("SELECT procedure_id, procedure_name, category, benchmark_rate FROM procedures ORDER BY procedure_name")
