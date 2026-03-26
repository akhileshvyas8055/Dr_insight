from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="D₹ Insights API", version="1.0.0")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    frontend_url,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    return response

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def health():
    return {"status": "healthy", "service": "dr-insights-backend"}
