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
- `pyproject.toml`: 📦 PEP 621 project configuration and package dependencies
- `requirements.txt`: 📋 Standard requirements lockfile fallback

---

## 🛠️ Setup & Running

### Step 1: Install Dependencies

#### ⚡ Option A: Fast Setup with `uv` & `pyproject.toml` (Recommended)

```bash
# Automatically creates .venv (Python 3.11) and installs all dependencies
uv sync
```

#### 🐍 Option B: Standard Python `venv` + `pip`

```bash
# 1. Create a virtual environment (Python 3.10 - 3.12 recommended; Python 3.11 is ideal)
# Note: Avoid Python 3.14 as PyPI pre-compiled wheels for pydantic-core/duckdb are not yet supported
python -m venv .venv

# 2. Activate the virtual environment
# 🔹 PowerShell (Windows):
.\.venv\Scripts\Activate.ps1

# 🔹 Command Prompt (CMD / Windows):
.venv\Scripts\activate.bat

# 🔹 Git Bash / macOS / Linux:
source .venv/Scripts/activate  # Windows Git Bash
# or: source .venv/bin/activate  # macOS / Linux

# 3. Install packages from pyproject.toml
pip install -e .
# (or fallback: pip install -r requirements.txt)
```

---

### Step 2: Configure Environment Variables

```bash
# Copy template environment file
cp .env.example .env
# Windows Command Prompt (CMD):
# copy .env.example .env
```

Open `.env` and fill in your keys:

- `GROQ_API_KEY`: Groq API key for Llama 3.3 natural language queries.
- `MONGODB_URI`: MongoDB Atlas connection URI for authentication and persistence.
- `JWT_SECRET`: Secret key used for signing authentication tokens.
- `MAIL_*`: (Optional) SMTP credentials for verification emails / OTP.

---

### Step 3: Start the Backend Server

```bash
# Using uv:
uv run uvicorn app.main:app --reload --port 8000

# Or with activated virtual environment:
uvicorn app.main:app --reload --port 8000
```

> 💡 **Interactive API Documentation**: Once running, access the Swagger UI at [http://localhost:8000/docs](http://localhost:8000/docs) or ReDoc at [http://localhost:8000/redoc](http://localhost:8000/redoc).

---

### Step 4: (Optional) Run Automated Tests

```bash
# Using pytest via uv:
uv run pytest

# Or run individual test scripts:
python tests/test_fastapi_upload.py
python tests/test_multi_upload.py
```

---

## 🔐 Default Credentials & Notes

- **Admin Access**: Default demo admin credentials are `admin@demo.com` / `admin123`.
- **VS Code / IDE Integration**: The workspace includes `.vscode/settings.json` configured to automatically point Python language servers and linters to `backend/.venv/Scripts/python.exe`.

<br/>

<div align="center">
  <i>Powering your data analysis with speed, AI, and robust security! ⚙️🦆</i>
</div>
