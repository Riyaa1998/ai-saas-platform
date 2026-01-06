from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints import analytics
import os
from .dependencies import get_db

app = FastAPI(
    title="AI SaaS Analytics API",
    description="API for AI SaaS platform analytics",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(
    analytics.router,
    prefix="/api/analytics",
    tags=["analytics"]
)

@app.get("/")
async def root():
    return {"message": "AI SaaS Analytics API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
