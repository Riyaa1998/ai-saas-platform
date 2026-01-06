# AI Analytics Service

A FastAPI-based analytics service for tracking feature usage and generating insights.

## Features

- Track user activity and feature usage
- Generate analytics reports
- Monitor conversion rates and user engagement
- Feature-specific usage statistics

## Installation

1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate  # On Windows
   source venv/bin/activate  # On Unix/macOS
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Running the Service

```bash
uvicorn ai_analytics.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /api/analytics` - Get overall analytics
- `GET /api/analytics/feature/{feature_name}` - Get analytics for a specific feature
