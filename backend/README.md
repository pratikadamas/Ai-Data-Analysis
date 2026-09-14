<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=28&pause=1000&color=10B981&center=true&vCenter=true&width=800&lines=Backend+Engine;FastAPI+%2B+DuckDB" alt="Typing SVG" />
</div>

# ⚙️ AI Data Analysis - Backend

This is the Python (FastAPI) backend for the AI Data Analysis application. It handles file uploads, in-memory DuckDB query execution, and intelligent SQL generation powered by Groq (Llama 3.3).

## 🗂️ Directory Structure

- `app/api/`: 🌐 Route handlers (Upload, Explore, Chat, Auth, Admin, Dataset, SQL Editor, Download)
- `app/services/`: 🧠 Core business logic (LLM integrations, schema extraction, chart specs, file loader)
- `app/validation/`: 🛡️ Security components (SQL Whitelisting & AST Parser)
- `app/db/`: 🗄️ DuckDB manager (in-memory sessions) and MongoDB connection pool
- `app/models/`: 📦 Pydantic schemas for structured inputs/outputs
- `app/utils/`: 🛠️ JWT Auth, Google OAuth / Firebase Admin SDK, SMTP Mail, Rate limiting, Session tracker, Log streamer, and Bloom Filter
- `app/main.py`: 🚀 The main FastAPI application entrypoint
- `tests/`: 🧪 Automated unit and integration tests

## 🛠️ Setup & Running

```bash
# 1. Create a virtual environment (Python 3.10 - 3.12 recommended)
python -m venv .venv

# 2. Activate virtual environment
# 🔹 Git Bash (MINGW64 / Windows):
source .venv/Scripts/activate

# 🔹 PowerShell (Windows):
.\.venv\Scripts\Activate.ps1

# 🔹 Command Prompt (CMD / Windows):
.venv\Scripts\activate.bat

# 🔹 macOS / Linux:
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Setup environment variables
cp .env.example .env
# Edit .env and configure GROQ_API_KEY, MONGODB_URI, and MAIL credentials

# 5. Start the server
uvicorn app.main:app --reload --port 8000
```

> 💡 Check out the interactive API documentation at [http://localhost:8000/docs](http://localhost:8000/docs) after starting the server!

<br/>

<div align="center">
  <i>Powering your data analysis with speed, AI, and robust security! ⚙️🦆</i>
</div>
