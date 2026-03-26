from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.query_service import QueryService

router = APIRouter()

class AssistantQuestion(BaseModel):
    question: str

@router.post('/assistant')
def assistant(payload: AssistantQuestion, db: Session = Depends(get_db)):
    q = payload.question.lower()
    qs = QueryService(db)
    if 'expensive city' in q or 'costly city' in q:
        rows = qs.fetch_all("""
            SELECT city, state, ROUND(AVG(package_price_demo), 2) AS avg_price
            FROM hospital_prices
            GROUP BY city, state
            ORDER BY avg_price DESC
            LIMIT 3
        """)
        return {"answer": f"Highest average package-price cities in this dataset are: {', '.join([r['city'] for r in rows])}.", "data": rows}
    if 'hidden charge' in q:
        row = qs.fetch_one("SELECT ROUND(AVG(hidden_charge_amount), 2) AS avg_hidden_charge_amount FROM survey_billing")
        return {"answer": f"Average hidden charge amount in the survey data is ₹{row['avg_hidden_charge_amount']}."}
    if 'cheapest' in q or 'affordable' in q or 'cheap' in q:
        rows = qs.fetch_all("""
            SELECT city, state, ROUND(AVG(package_price_demo), 2) AS avg_price
            FROM hospital_prices
            GROUP BY city, state
            ORDER BY avg_price ASC
            LIMIT 3
        """)
        return {"answer": f"Most affordable cities: {', '.join([r['city'] + ' (₹' + str(r['avg_price']) + ')' for r in rows])}.", "data": rows}
    if 'blood test' in q:
        rows = qs.fetch_all("""
            SELECT procedure_name, ROUND(AVG(package_price_demo), 2) AS avg_price,
                   MIN(package_price_demo) AS min_price, MAX(package_price_demo) AS max_price
            FROM hospital_prices
            WHERE category = 'Blood Test'
            GROUP BY procedure_name
            ORDER BY avg_price
        """)
        return {"answer": f"Found {len(rows)} blood test types. Prices range from ₹{rows[0]['min_price'] if rows else 'N/A'} to ₹{rows[-1]['max_price'] if rows else 'N/A'}.", "data": rows}
    if 'ct scan' in q or 'mri' in q or 'scan' in q:
        rows = qs.fetch_all("""
            SELECT procedure_name, ROUND(AVG(package_price_demo), 2) AS avg_price,
                   MIN(package_price_demo) AS min_price, MAX(package_price_demo) AS max_price
            FROM hospital_prices
            WHERE category = 'Imaging'
            GROUP BY procedure_name
            ORDER BY avg_price
        """)
        return {"answer": f"Found {len(rows)} imaging procedures. Average prices listed below.", "data": rows}
    if 'checkup' in q or 'health check' in q:
        rows = qs.fetch_all("""
            SELECT procedure_name, ROUND(AVG(package_price_demo), 2) AS avg_price,
                   MIN(package_price_demo) AS min_price, MAX(package_price_demo) AS max_price
            FROM hospital_prices
            WHERE category = 'Health Checkup'
            GROUP BY procedure_name
            ORDER BY avg_price
        """)
        return {"answer": f"Found {len(rows)} health checkup packages. Prices range from ₹{rows[0]['min_price'] if rows else 'N/A'} to ₹{rows[-1]['max_price'] if rows else 'N/A'}.", "data": rows}
    return {"answer": "Ask about expensive cities, cheapest cities, hidden charges, blood tests, CT scans, MRI, health checkups, or fair prices. This starter assistant is rule-based."}

class ReportRequest(BaseModel):
    city: str | None = None
    procedure: str | None = None

@router.post('/report')
def report(payload: ReportRequest, db: Session = Depends(get_db)):
    qs = QueryService(db)
    if payload.city and payload.procedure:
        row = qs.fetch_one("""
            SELECT city, procedure_name,
                   ROUND(AVG(package_price_demo), 2) AS avg_price,
                   ROUND(AVG(package_price_demo), 2) AS median_price,
                   MIN(package_price_demo) AS min_price,
                   MAX(package_price_demo) AS max_price,
                   ROUND(AVG(benchmark_rate_real), 2) AS benchmark_rate_real
            FROM hospital_prices
            WHERE city = :city AND procedure_name = :procedure
            GROUP BY city, procedure_name
            LIMIT 1
        """, {"city": payload.city, "procedure": payload.procedure})
        if not row:
            return {"report": "No matching city-procedure reference found."}
        report_text = (
            f"In {row['city']}, the procedure {row['procedure_name']} has an average package price of ₹{row['avg_price']}, "
            f"with observed prices ranging from ₹{row['min_price']} to ₹{row['max_price']}. "
            f"The benchmark reference is ₹{row['benchmark_rate_real']}. "
            f"This suggests a city-level spread of ₹{round(float(row['max_price'])-float(row['min_price']),2)}."
        )
        return {"report": report_text, "data": row}
    return {"report": "Provide both city and procedure to generate a focused report."}
