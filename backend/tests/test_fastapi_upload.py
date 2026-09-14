import sys
from pathlib import Path

# Add backend directory dynamically to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.utils.auth import get_current_user

# Mock get_current_user to bypass authentication for testing the upload endpoint itself
async def mock_get_current_user():
    return {"username": "testuser", "email": "test@example.com"}

# Override dependency
app.dependency_overrides[get_current_user] = mock_get_current_user

client = TestClient(app)

def test_upload():
    # 1. Create a dummy CSV file contents
    csv_content = b"id,name,value\n1,Alice,10.5\n2,Bob,20.0\n3,Charlie,15.2"
    
    print("Sending POST /api/upload request...")
    response = client.post(
        "/api/upload",
        files=[("files", ("test_data.csv", csv_content, "text/csv"))]
    )
    
    print(f"Status Code: {response.status_code}")
    print("Response Content:")
    print(response.content.decode("utf-8"))
    assert response.status_code == 200, f"Upload failed: {response.text}"

if __name__ == "__main__":
    test_upload()
