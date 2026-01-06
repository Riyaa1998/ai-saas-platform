from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import pandas as pd
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
import os

class AnalyticsService:
    def __init__(self, db: Database):
        self.db = db
        self.usage_logs: Collection = db['UsageLog']
        self.users: Collection = db['User']

    def _get_user_plan(self, user_id: str) -> str:
        """Helper to get user's plan type"""
        user = self.users.find_one({"_id": user_id})
        return user.get('plan', 'FREE') if user else 'FREE'

    def log_usage(
        self,
        user_id: str,
        feature: str,
        tokens_used: int,
        input_tokens: int,
        output_tokens: int,
        cost: float,
        metadata: Optional[Dict] = None
    ) -> None:
        """Log an AI usage event"""
        self.usage_logs.insert_one({
            "userId": user_id,
            "feature": feature,
            "tokensUsed": tokens_used,
            "inputTokens": input_tokens,
            "outputTokens": output_tokens,
            "cost": cost,
            "metadata": metadata or {},
            "createdAt": datetime.utcnow()
        })

    def get_usage_metrics(self, days: int = 30) -> Dict[str, Any]:
        """Get comprehensive usage metrics"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get usage logs for the period
        logs = list(self.usage_logs.find({
            "createdAt": {"$gte": start_date, "$lte": end_date}
        }))
        
        if not logs:
            return {"total_usage": 0, "avg_daily_usage": 0, "usage_by_feature": {}}
        
        # Convert to DataFrame for analysis
        df = pd.DataFrame(logs)
        
        # Convert ObjectId to string for JSON serialization
        df['_id'] = df['_id'].astype(str)
        df['userId'] = df['userId'].astype(str)
        
        # Basic metrics
        total_usage = df['tokensUsed'].sum()
        avg_daily_usage = total_usage / days
        
        # Usage by feature
        usage_by_feature = df.groupby('feature')['tokensUsed'].sum().to_dict()
        
        # Usage by user type
        df['plan'] = df['userId'].apply(self._get_user_plan)
        usage_by_plan = df.groupby('plan')['tokensUsed'].sum().to_dict()
        
        # Daily usage trend
        df['date'] = pd.to_datetime(df['createdAt']).dt.date
        daily_usage = df.groupby('date')['tokensUsed'].sum().reset_index()
        daily_usage['date'] = daily_usage['date'].astype(str)
        
        # Peak hours
        df['hour'] = pd.to_datetime(df['createdAt']).dt.hour
        peak_hours = df.groupby('hour').size().sort_values(ascending=False).head(5).to_dict()
        
        return {
            "total_usage": int(total_usage),
            "avg_daily_usage": int(avg_daily_usage),
            "usage_by_feature": usage_by_feature,
            "usage_by_plan": usage_by_plan,
            "daily_usage": daily_usage.to_dict('records'),
            "peak_hours": peak_hours,
            "user_count": self.users.count_documents({}),
            "active_users": len(df['userId'].unique())
        }

    def get_user_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get analytics for a specific user"""
        user_logs = list(self.usage_logs.find({"userId": user_id}).sort("createdAt", -1).limit(1000))
        
        if not user_logs:
            return {"total_usage": 0, "features_used": [], "recent_activity": []}
        
        df = pd.DataFrame(user_logs)
        
        # Basic usage stats
        total_tokens = df['tokensUsed'].sum()
        avg_tokens_per_request = df['tokensUsed'].mean()
        
        # Features used
        features_used = df['feature'].value_counts().to_dict()
        
        # Recent activity
        recent_activity = df.head(10)[['feature', 'tokensUsed', 'createdAt']].to_dict('records')
        
        return {
            "total_usage": int(total_tokens),
            "avg_tokens_per_request": float(avg_tokens_per_request),
            "features_used": features_used,
            "recent_activity": recent_activity,
            "total_requests": len(df)
        }
