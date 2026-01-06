"""
AI Analytics Service - A FastAPI-based analytics service for tracking feature usage.
"""

__version__ = "0.1.0"

# Only expose AnalyticsEngine
from .analytics import AnalyticsEngine

__all__ = ["AnalyticsEngine"]