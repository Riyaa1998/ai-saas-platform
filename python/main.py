from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.analytics import AnalyticsEngine

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analytics = AnalyticsEngine()

@app.get("/api/analytics")
async def get_analytics():
    return analytics.get_metrics()

@app.get("/api/analytics/feature/{feature_name}")
async def get_feature_analytics(feature_name: str):
    return analytics.get_feature_usage(feature_name)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)