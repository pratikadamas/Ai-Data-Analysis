import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

# Add backend directory to sys.path
sys.path.append(str(Path("e:/ai-data-analyst/backend")))

# Patch pymongo BEFORE importing app.main
mock_client = MagicMock()
mock_db = MagicMock()
mock_client.__getitem__.return_value = mock_db

# Mock find_one to return a dummy user so auth succeeds if token is validated
mock_db["users"].find_one.return_value = {
    "_id": "dummy_id",
    "username": "testuser",
    "email": "test@example.com",
    "password": "hashed_password"
}

with patch("pymongo.MongoClient", return_value=mock_client):
    with patch("app.db.mongodb.init_db") as mock_init:
        # Also patch db import in auth
        import app.db.mongodb
        app.db.mongodb.client = mock_client
        app.db.mongodb.db = mock_db
        
        from fastapi.testclient import TestClient
        from app.main import app
        from app.utils.auth import get_current_user

# Mock get_current_user to bypass authentication for testing
async def mock_get_current_user():
    return {"id": "dummy_id", "username": "testuser", "email": "test@example.com"}

app.dependency_overrides[get_current_user] = mock_get_current_user

client = TestClient(app)

def test_upload():
    # 1. Create a dummy CSV file contents
    csv_content = b"id,name,value\n1,Alice,10.5\n2,Bob,20.0\n3,Charlie,15.2"
    
    print("Sending POST /api/upload request...")
    response = client.post(
        "/api/upload",
        files={"file": ("test_data.csv", csv_content, "text/csv")}
    )
    
    print(f"Status Code: {response.status_code}")
    print("Response Content:")
    print(response.content.decode("utf-8"))

if __name__ == "__main__":
    test_upload()
