<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=32&pause=1000&color=3B82F6&center=true&vCenter=true&width=800&lines=AI+Data+Analyst;Your+Intelligent+Data+Assistant" alt="Typing SVG" />
</div>

<div align="center">
  <h1>✨ AI Data Analyst ✨</h1>
  <p><i>Your intelligent, conversational data analysis assistant.</i></p>

  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/DuckDB-FFF000?style=for-the-badge&logo=duckdb&logoColor=black" alt="DuckDB" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  
  <br/><br/>
</div>

> **🚀 Analyze your structured data (CSV, Excel, SQLite, SQL dump) in plain English — no SQL required!**  
> The backend runs queries securely through DuckDB with a strict read-only SQL whitelist, while the frontend provides manual chart building and an AI chat mode powered by **Groq** (Llama 3.3 70B).

## 📚 Documentation

- 📖 [Project Instructions & Codebase Guide](INSTRUCTIONS.md)
- 🚀 [Deployment Guide](DEPLOYMENT.md)
- 🏗️ [Architecture Overview](ARCHITECTURE.md)
- ⚙️ [Backend README](backend/README.md)
- 🎨 [Frontend README](frontend/README.md)
- ⚖️ [MIT License](LICENSE)

---

## 📁 Project Layout

```text
ai-data-analyst/
  backend/                  ⚙️ FastAPI + DuckDB service
    app/
      api/routes/           🌐 upload, explore, chat, dataset, download endpoints
      services/             🧠 file_loader, schema_service, llm_service, chart_service
      validation/           🛡️ sql_validator (whitelist-based SQL safety checks)
      models/               📦 Pydantic request/response schemas
      db/                   🗄️ DuckDBManager (per-dataset in-memory connections)
      utils/                🛠️ filename sanitizing, extension detection
      main.py               🚀 FastAPI app + router wiring
    requirements.txt        📝 Python dependencies
    .env.example            🔐 Example environment variables
  frontend/                 🎨 React (Vite) + Tailwind + Plotly
    src/
      components/
        charts/             📈 ResultChart, ResultTable, SqlViewer, DownloadButtons
        chat/               💬 ChatPanel (AI chat with export + clear)
        explore/            🔍 ExplorePanel (manual column/aggregation builder)
        layout/             🏗️ Header, Sidebar
        preview/            👀 PreviewTable (AG Grid data preview)
        upload/             ☁️ UploadArea (drag-and-drop)
      pages/                🏠 Dashboard.jsx
      context/              🧠 DatasetContext (dataset + chat history state)
      services/             🔌 api.js (Axios client)
      utils/                📄 exportChat.js (HTML report generator)
```

---

## 🛠️ Setup & Installation

### ⚙️ Backend Setup

```bash
cd backend
# 1. Create Python virtual environment
python -m venv .venv

# 2. Activate virtual environment:
# 🔹 Git Bash (MINGW64 / Windows):
source .venv/Scripts/activate

# 🔹 PowerShell (Windows):
.\.venv\Scripts\Activate.ps1

# 🔹 Command Prompt (CMD / Windows):
.venv\Scripts\activate.bat

# 🔹 macOS / Linux:
source .venv/bin/activate

# 3. Install dependencies & configure environment:
pip install -r requirements.txt
cp .env.example .env   # 🔑 Add your GROQ_API_KEY, MONGODB_URI, and MAIL credentials

# 4. Start the backend server:
uvicorn app.main:app --reload --port 8000
```

*API docs available at [http://localhost:8000/docs](http://localhost:8000/docs) once running.*

### 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

*The Vite dev server proxies `/api/*` to `http://localhost:8000`.*

---

## 🔐 Environment Variables (`backend/.env`)

| Variable | Required | Description |
| --- | :---: | --- |
| `GROQ_API_KEY` | 🟢 **Yes** | Groq API key for LLM features. Get one free at [console.groq.com/keys](https://console.groq.com/keys) |
| `APP_ENV` | ⚪ No | `development` (default) or `production` |
| `MAX_UPLOAD_MB` | ⚪ No | Max file size in MB (default: `200`) |
| `UPLOAD_DIR` | ⚪ No | Temp upload path (default: `./uploads`) |
| `CORS_ORIGINS` | ⚪ No | Comma-separated allowed origins (default: `http://localhost:5173`) |

> 💡 **Tip:** The app works without an API key for upload, preview, and manual explore! Only the AI chat tab requires `GROQ_API_KEY`.

---

## ✨ Features Implemented

### 📥 Data Ingestion

- **Drag-and-drop** or click-to-upload for CSV, Excel (`.xlsx`/`.xls`), SQLite (`.db`/`.sqlite`), and SQL dump (`.sql`).
- Format auto-detection → loaded into a per-session in-memory DuckDB database.
- **Smart Naming**: The uploaded filename becomes the SQL table name (e.g. `sales_2024.csv` → table `sales_2024`), ensuring natural AI queries.

### 🤖 AI Chat (`/api/chat`)

- 🛡️ **Off-topic guard**: Fast LLM classifier rejects non-data questions without polluting chat history.
- ⚡ **On-topic flow**: Question → Groq Llama 3.3 70B generates SQL → Whitelist validation → DuckDB execution → Groq explains results → Deterministic chart selection.
- 💾 **Persistent Chat**: Chat history is preserved across tab switches.
- 📄 **Export Chat**: Download the entire conversation as a styled, printable HTML report!

### 🔍 Manual Explore (`/api/explore`)

- Pick X / Y columns, aggregation (sum/avg/count/min/max), and chart type.
- Plotly-rendered charts: bar, line, scatter, horizontal bar, KPI, heatmap, table.

### 🛡️ SQL Safety

- Whitelist-based validator rejects destructive commands (`DROP`, `DELETE`, `INSERT`, `UPDATE`, etc.).
- Multi-statement detection, leading-keyword check, and sqlparse-based parse tree validation.

### 📊 Result Display

- 🗣️ AI explanation text in plain English.
- 💻 Generated SQL (collapsible SQL viewer with copy button).
- 📋 **Paginated data table** (sticky headers, null highlighting).
- 📉 Plotly charts based on returned data.

### 🔐 User Authentication & Profile (`/api/auth`)

- **Secure JWT Session Management**: Email verification with 6-digit OTPs, bcrypt hashed passwords, and password resets.
- **Persistent Header Profile**: Real-time user avatar, username display, modal window with outside-click dismissal, and account settings.

### 🎨 Modern Apple macOS Studio UI

- **120Hz Smooth Inertia Scrolling**: Powered by Lenis with dynamic interactive spring animations.
- **Frosted Glass Navigation**: Translucent floating navbar with instant light/dark mode switcher and Kaushan Script typography.
- **MacBook Pro Window Aesthetics**: Realistic traffic light controls, bento grid layout, and backgroundless floating graphics.

---

## 🔮 Future Roadmap

- [x] 🔐 Auth and user sessions with OTP email verification
- [x] 🎨 Apple macOS / MacBook Pro design system with dark & light theme persistence
- [x] ⚡ 120Hz Lenis smooth inertial scrolling
- [ ] 📌 Saved/named dashboards
- [ ] 🔄 Multi-turn conversation context (history passed to the LLM)
- [ ] 🔗 Multi-file joins
- [ ] 🐘 External DB connections (MySQL / Postgres / Snowflake)
- [ ] 📄 PDF/PPTX export
- [ ] 🎙️ Voice queries

<div align="center">
  <i>Built with ❤️ for data analysts everywhere! Happy Querying! 📊✨</i>
</div>
