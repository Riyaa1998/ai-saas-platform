from fastapi import FastAPI
from app.analytics import AnalyticsEngine

# Create the FastAPI app
app = FastAPI()
analytics = AnalyticsEngine()

@app.get("/")
async def root():
    return {"message": "AI Analytics API is running"}

@app.get("/api/analytics")
async def get_analytics():
    return analytics.get_metrics()

@app.get("/api/analytics/feature/{feature_name}")
async def get_feature_analytics(feature_name: str):
    return analytics.get_feature_usage(feature_name)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("run:app", host="0.0.0.0", port=8000, reload=True)
