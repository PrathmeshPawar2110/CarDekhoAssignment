from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers.recommend import router as recommend_router

app = FastAPI(
    title="CarMatch API",
    description="AI-powered car recommendation platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommend_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
