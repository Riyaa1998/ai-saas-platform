from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from pymongo.database import Database
from app.services.analytics_service import AnalyticsService
from app.dependencies import get_db
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_analytics_service(db: Database = Depends(get_db)) -> AnalyticsService:
    return AnalyticsService(db)

@router.get("/usage/metrics", response_model=Dict[str, Any])
async def get_usage_metrics(
    days: int = 30,
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """
    Get overall usage metrics
    - **days**: Number of days of data to include (default: 30)
    """
    try:
        return analytics_service.get_usage_metrics(days=days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/analytics/{user_id}", response_model=Dict[str, Any])
async def get_user_analytics(
    user_id: str,
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """
    Get analytics for a specific user
    - **user_id**: ID of the user to get analytics for
    """
    try:
        return analytics_service.get_user_analytics(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/usage/features", response_model=Dict[str, Any])
async def get_feature_usage(
    days: int = 30,
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """
    Get feature usage statistics
    - **days**: Number of days of data to include (default: 30)
    """
    try:
        metrics = analytics_service.get_usage_metrics(days=days)
        return {
            "feature_usage": metrics.get("usage_by_feature", {}),
            "total_usage": metrics.get("total_usage", 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/usage/peak-hours", response_model=Dict[str, Any])
async def get_peak_hours(
    days: int = 30,
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """
    Get peak usage hours
    - **days**: Number of days of data to include (default: 30)
    """
    try:
        metrics = analytics_service.get_usage_metrics(days=days)
        return {"peak_hours": metrics.get("peak_hours", {})}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
