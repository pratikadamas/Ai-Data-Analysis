import os
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.append(str(Path("e:/ai-data-analyst/backend")))

import duckdb
from app.db.duckdb_manager import duckdb_manager, filename_to_table_name
from app.services.file_loader import file_loader
from app.services.schema_service import extract_schema

def test_process():
    # 1. Create a dummy CSV file
    dummy_csv = Path("e:/ai-data-analyst/backend/uploads/test_data.csv")
    dummy_csv.write_text("id,name,value\n1,Alice,10.5\n2,Bob,20.0\n3,Charlie,15.2")
    
    dataset_id = "test_dataset_123"
    safe_name = "test_data.csv"
    table_name = filename_to_table_name(safe_name)
    
    print(f"Table name: {table_name}")
    print(f"Dummy file exists: {dummy_csv.exists()}")
    
    try:
        conn = duckdb_manager.create_connection(dataset_id, table_name=table_name)
        print("DuckDB connection created successfully.")
        
        file_loader.load(conn, dummy_csv, safe_name)
        print("File loader loaded dummy CSV successfully.")
        
        schema = extract_schema(conn, dataset_id)
        print("Schema extracted successfully:")
        print(schema)
        
        preview_rows = conn.execute(
            f'SELECT * FROM "{table_name}" LIMIT 100'
        ).fetch_df().to_dict(orient="records")
        print("Preview rows:")
        print(preview_rows)
        
    except Exception as e:
        print(f"Error occurred during upload processing: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if dummy_csv.exists():
            dummy_csv.unlink()

if __name__ == "__main__":
    test_process()
