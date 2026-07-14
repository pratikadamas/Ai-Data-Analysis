<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=28&pause=1000&color=10B981&center=true&vCenter=true&width=800&lines=Backend+Engine;FastAPI+%2B+DuckDB" alt="Typing SVG" />
</div>

# ⚙️ AI Data Analyst - Backend

This is the Python (FastAPI) backend for the AI Data Analyst application. It handles file uploads, in-memory DuckDB query execution, and intelligent SQL generation powered by Groq (Llama 3.3).

## 🗂️ Directory Structure

- `app/api/`: 🌐 Route handlers (Upload, Explore, Chat)
- `app/services/`: 🧠 Core business logic (LLM integrations, schema extraction, chart specs)
- `app/validation/`: 🛡️ Security components (SQL Whitelisting & Parser)
- `app/db/`: 🗄️ DuckDB manager for per-dataset dynamic connection pooling
- `app/models/`: 📦 Pydantic schemas for structured inputs/outputs
- `app/main.py`: 🚀 The main FastAPI application entrypoint

## 🛠️ Setup & Running

```bash
# 1. Create a virtual environment
python -m venv .venv
.venv\Scripts\activate   # (Windows)
# source .venv/bin/activate  # (Mac/Linux)

# 2. Install dependencies
pip install -r requirements.txt

# 3. Setup environment variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY!

# 4. Start the server
uvicorn app.main:app --reload --port 8000
```

> 💡 Check out the interactive API documentation at [http://localhost:8000/docs](http://localhost:8000/docs) after starting the server!
