"""
Voice API routes — Sarvam AI voice integration endpoints.
Does NOT modify any existing routes or database logic.
"""

from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.query_service import QueryService
from app.services.sarvam_service import text_to_speech, translate_text, speech_to_text
from app.services.response_builder import build_comparison_response, build_fair_price_response

router = APIRouter()


@router.post("/speak-comparison")
async def speak_comparison(
    body: dict,
    db: Session = Depends(get_db),
):
    """
    Build a spoken response for comparison results and return audio.
    Body: { city, procedure, language, speaker? }
    """
    city = body.get("city", "")
    procedure = body.get("procedure", "")
    language = body.get("language", "en-IN")
    speaker = body.get("speaker", "anushka")

    if not city or not procedure:
        return {"error": "city and procedure are required", "audio": None}

    # Fetch cheapest and most expensive from existing data
    qs = QueryService(db)
    rows = qs.fetch_all(
        """
        SELECT hospital_name, city, procedure_name, package_price_demo
        FROM hospital_prices
        WHERE city = :city AND procedure_name = :procedure
        ORDER BY package_price_demo ASC
        """,
        {"city": city, "procedure": procedure},
    )

    if not rows or len(rows) < 2:
        return {"error": "Not enough data for comparison", "audio": None, "text": ""}

    cheapest = rows[0]
    expensive = rows[-1]
    price_diff = float(expensive["package_price_demo"]) - float(cheapest["package_price_demo"])

    # Build English response text
    english_text = build_comparison_response(
        cheapest_hospital=cheapest["hospital_name"],
        cheapest_price=float(cheapest["package_price_demo"]),
        expensive_hospital=expensive["hospital_name"],
        expensive_price=float(expensive["package_price_demo"]),
        price_difference=price_diff,
        city=city,
        procedure=procedure,
    )

    # Translate if not English
    final_text = english_text
    if language and language != "en-IN":
        translated = await translate_text(english_text, "en-IN", language)
        if translated:
            final_text = translated

    # Generate TTS audio
    audio_b64 = await text_to_speech(final_text, language, speaker)

    return {
        "text": final_text,
        "english_text": english_text,
        "audio": audio_b64,
        "language": language,
    }


@router.post("/speak-fair-price")
async def speak_fair_price(
    body: dict,
    db: Session = Depends(get_db),
):
    """
    Build a spoken response for fair-price check and return audio.
    Body: { city, procedure, quote, language, speaker? }
    """
    city = body.get("city", "")
    procedure = body.get("procedure", "")
    quote = body.get("quote", 0)
    language = body.get("language", "en-IN")
    speaker = body.get("speaker", "anushka")

    if not city or not procedure or not quote:
        return {"error": "city, procedure, and quote are required", "audio": None}

    # Reuse the same logic from fair-price-checker
    qs = QueryService(db)
    row = qs.fetch_one(
        """
        SELECT procedure_name, city,
               ROUND(AVG(package_price_demo), 2) AS median_price,
               MIN(package_price_demo) AS min_price,
               MAX(package_price_demo) AS max_price,
               ROUND(AVG(benchmark_rate_real), 2) AS benchmark_rate_real
        FROM hospital_prices
        WHERE city = :city AND procedure_name = :procedure
        GROUP BY city, procedure_name
        LIMIT 1
        """,
        {"city": city, "procedure": procedure},
    )

    if not row:
        return {"error": "No data found", "audio": None, "text": ""}

    median = float(row["median_price"])
    quote_f = float(quote)
    if quote_f <= median * 0.9:
        verdict = "a good deal"
    elif quote_f <= median * 1.15:
        verdict = "fair"
    elif quote_f <= median * 1.4:
        verdict = "expensive"
    else:
        verdict = "potentially unfair"

    english_text = build_fair_price_response(
        procedure=procedure,
        city=city,
        user_quote=quote_f,
        median_price=median,
        min_price=float(row["min_price"]),
        max_price=float(row["max_price"]),
        benchmark_rate=float(row["benchmark_rate_real"]),
        verdict=verdict,
    )

    final_text = english_text
    if language and language != "en-IN":
        translated = await translate_text(english_text, "en-IN", language)
        if translated:
            final_text = translated

    audio_b64 = await text_to_speech(final_text, language, speaker)

    return {
        "text": final_text,
        "english_text": english_text,
        "audio": audio_b64,
        "language": language,
    }


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form("hi-IN"),
):
    """
    Transcribe uploaded audio using Sarvam STT.
    """
    audio_bytes = await file.read()
    transcript = await speech_to_text(audio_bytes, file.filename or "recording.wav", language)

    return {
        "transcript": transcript or "",
        "language": language,
    }
