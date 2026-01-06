# python/app/analytics.py
from typing import Dict, List, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

class AnalyticsEngine:
    def __init__(self):
        self.data = None
        self.initialize_sample_data()
    
    def initialize_sample_data(self):
        """Initialize with sample data for demonstration"""
        np.random.seed(42)
        random.seed(42)
        
        # Generate sample user data
        num_users = 1245
        user_ids = [f"user_{i}" for i in range(1, num_users + 1)]
        user_types = ['free'] * 822 + ['paid'] * 423
        random.shuffle(user_types)
        
        # Generate sample feature usage data
        features = ['image_generation', 'code_generation', 'text_completion', 'video_generation']
        
        # Create sample data
        self.data = {
            'users': {
                'total': num_users,
                'paid': user_types.count('paid'),
                'free': user_types.count('free'),
                'user_types': dict(zip(user_ids, user_types))
            },
            'usage': self._generate_usage_data(features, user_ids)
        }
    
    def _generate_usage_data(self, features: List[str], user_ids: List[str]) -> List[Dict[str, Any]]:
        """Generate sample usage data"""
        usage = []
        days = 30
        end_date = datetime.now()
        
        for i in range(days):
            date = end_date - timedelta(days=days - i - 1)
            for _ in range(np.random.randint(50, 200)):
                user_id = random.choice(user_ids)
                feature = random.choices(
                    features,
                    weights=[0.4, 0.3, 0.2, 0.1],  # Weighted random selection
                    k=1
                )[0]
                
                usage.append({
                    'timestamp': date + timedelta(seconds=random.randint(0, 86400)),
                    'user_id': user_id,
                    'feature': feature,
                    'duration': np.random.exponential(scale=30),  # In seconds
                    'success': random.random() > 0.05  # 95% success rate
                })
        
        return usage
    
    def get_metrics(self) -> Dict[str, Any]:
        """Calculate and return all metrics"""
        usage_df = pd.DataFrame(self.data['usage'])
        
        # Calculate most used feature
        feature_counts = usage_df['feature'].value_counts()
        most_used_feature = feature_counts.idxmax() if not feature_counts.empty else 'N/A'
        
        # Calculate daily usage
        usage_df['date'] = pd.to_datetime(usage_df['timestamp']).dt.date
        daily_usage = usage_df.groupby('date').size().to_dict()
        
        return {
            'total_users': self.data['users']['total'],
            'paid_users': self.data['users']['paid'],
            'free_users': self.data['users']['free'],
            'conversion_rate': round((self.data['users']['paid'] / self.data['users']['total']) * 100, 2),
            'total_usage': len(usage_df),
            'most_used_feature': most_used_feature.replace('_', ' ').title(),
            'feature_distribution': (usage_df['feature']
                                   .value_counts(normalize=True)
                                   .mul(100)
                                   .round(1)
                                   .to_dict()),
            'daily_usage': {str(k): int(v) for k, v in daily_usage.items()},
            'active_users': usage_df['user_id'].nunique(),
            'success_rate': round(usage_df['success'].mean() * 100, 2),
            'avg_session_duration': round(usage_df['duration'].mean(), 2),
            'last_updated': datetime.now().isoformat()
        }
    
    def get_feature_usage(self, feature: str) -> Dict[str, Any]:
        """Get usage statistics for a specific feature"""
        if not self.data:
            return {}
            
        feature_data = [u for u in self.data['usage'] if u['feature'] == feature.lower().replace(' ', '_')]
        if not feature_data:
            return {}
            
        df = pd.DataFrame(feature_data)
        df['date'] = pd.to_datetime(df['timestamp']).dt.date
        
        # Calculate daily stats
        daily_stats = df.groupby('date').agg({
            'user_id': 'count',
            'duration': 'mean',
            'success': 'mean'
        }).rename(columns={
            'user_id': 'count',
            'duration': 'avg_duration_seconds',
            'success': 'success_rate'
        })
        
        return {
            'feature': feature,
            'total_usage': len(feature_data),
            'unique_users': df['user_id'].nunique(),
            'avg_duration_seconds': round(df['duration'].mean(), 2),
            'success_rate': round(df['success'].mean() * 100, 2),
            'daily_stats': daily_stats.to_dict('index')
        }