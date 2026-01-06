from pymongo import MongoClient
from pymongo.database import Database
from typing import Generator

def get_db() -> Generator[Database, None, None]:
    """Get MongoDB database connection"""
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/ai_saas")
    client = MongoClient(mongo_uri)
    try:
        db = client.get_database()
        yield db
    finally:
        client.close()
