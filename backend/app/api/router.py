from fastapi import APIRouter
from app.api.routes import analytics, assistant, comparison, geography, insights, voice, leads, smart_savings, nearby_routes

api_router = APIRouter()
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(comparison.router, prefix="/comparison", tags=["comparison"])
api_router.include_router(geography.router, prefix="/geography", tags=["geography"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(assistant.router, prefix="/ai", tags=["ai"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
api_router.include_router(smart_savings.router, prefix="/smart-savings", tags=["smart-savings"])
api_router.include_router(nearby_routes.router, prefix="/nearby", tags=["nearby"])
