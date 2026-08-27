import sys
from pathlib import Path

# Add backend directory dynamically to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.utils.auth import get_current_user
from app.db.duckdb_manager import duckdb_manager

async def mock_get_current_user():
    return {"username": "testuser", "email": "test@example.com"}

app.dependency_overrides[get_current_user] = mock_get_current_user
client = TestClient(app)

def test_multi_file_upload_and_query():
    csv1 = b"id,customer_name\n1,Alice\n2,Bob"
    csv2 = b"id,amount,customer_id\n101,50.0,1\n102,75.5,2"

    print("--- Test 1: Upload 2 files in single request ---")
    resp = client.post(
        "/api/upload",
        files=[
            ("files", ("customers.csv", csv1, "text/csv")),
            ("files", ("orders.csv", csv2, "text/csv")),
        ]
    )
    assert resp.status_code == 200, f"Upload failed: {resp.text}"
    data = resp.json()
    dataset_id = data["dataset_id"]
    files = data["files"]
    print(f"Dataset ID: {dataset_id}")
    print(f"Uploaded files count: {len(files)}")
    assert len(files) == 2, f"Expected 2 files, got {len(files)}"
    table_names = [f["table_name"] for f in files]
    print(f"Table names in DuckDB: {table_names}")

    print("--- Test 2: Append 3rd file to existing dataset_id ---")
    csv3 = b"product_id,product_name\n1,Laptop\n2,Phone"
    resp_append = client.post(
        "/api/upload",
        data={"dataset_id": dataset_id},
        files=[("files", ("products.csv", csv3, "text/csv"))]
    )
    assert resp_append.status_code == 200, f"Append failed: {resp_append.text}"
    data_append = resp_append.json()
    assert data_append["dataset_id"] == dataset_id, "dataset_id should remain identical"
    print(f"Appended file table name: {data_append['files'][0]['table_name']}")

    tables = duckdb_manager.get_table_names(dataset_id)
    print(f"All active table names in DuckDB manager for {dataset_id}: {tables}")
    assert len(tables) == 3, f"Expected 3 tables in DuckDB manager, got {len(tables)}"

    print("--- Test 3: Run SQL editor query across multiple tables ---")
    sql_resp = client.post("/api/sql-editor", json={
        "dataset_id": dataset_id,
        "sql": "SELECT c.customer_name, o.amount FROM customers c JOIN orders o ON c.id = o.customer_id"
    })
    assert sql_resp.status_code == 200, f"SQL Query failed: {sql_resp.text}"
    sql_data = sql_resp.json()
    print("SQL Query Result:", sql_data["rows"])
    assert len(sql_data["rows"]) == 2, "Expected 2 joined rows"

    print("--- Test 4: Check /api/dataset/{dataset_id}/schemas ---")
    schemas_resp = client.get(f"/api/dataset/{dataset_id}/schemas")
    assert schemas_resp.status_code == 200
    schemas = schemas_resp.json()
    print(f"Schemas fetched for session restoration: {len(schemas)} schemas")
    assert len(schemas) == 3

    print("\nALL BACKEND MULTI-FILE TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_multi_file_upload_and_query()
