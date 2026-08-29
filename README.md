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
> The backend runs queries securely through **DuckDB** with a strict read-only SQL whitelist, while the frontend provides a macOS-inspired Studio workspace with **Data Preview**, **Explore Visualizer**, **Ask AI (Llama 3.3 70B via Groq)**, and a full **SQL Editor**.

## 🌟 Key Features

- 🖥️ **macOS Studio Aesthetic**: Sleek frosted glass (`backdrop-blur-2xl`), interactive collapsible dock sidebar with hover tooltips, and ultra-compact responsive layout.
- ⚡ **Zero-Lag In-Memory Analytics**: Instant queries on multi-million row datasets via embedded DuckDB with read-only whitelist validation.
- 📂 **Multi-File Upload & Background Queues**: Upload up to 10 CSV, Excel (`.xlsx`/`.xls`), SQLite (`.db`), or `.sql` files with persistent background upload queues.
- 🤖 **Conversational AI Analysis**: Ask questions in plain English. The AI generates verified SQL queries, markdown explanations, interactive Plotly visualizations, and downloadable HTML reports.
- 📊 **Auto-Explore & Visualizer**: Interactive chart builder with dynamic aggregation (`SUM`, `AVG`, `COUNT`, `MIN`, `MAX`) across 7 chart types.
- 💻 **SQL Editor & Schema Explorer**: Live table schema explorer, syntax validation, and instant table preview with export options.
- 🛡️ **Admin Portal & Control Center**: Dedicated management dashboard for Groq LLM API analytics, paginated user management, system health diagnostics, and live backend log streaming.
- 📱 **Adaptive Responsive Design**: Natural 120Hz physics on desktop, floating iOS top-pill toast notifications, and compact mobile bottom dock.

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
      api/routes/           🌐 upload, explore, chat, dataset, sql_editor, auth, admin endpoints
      services/             🧠 file_loader, schema_service, llm_service, chart_service
      validation/           🛡️ sql_validator (whitelist-based SQL safety checks)
      models/               📦 Pydantic request/response schemas
      db/                   🗄️ DuckDBManager (per-dataset in-memory connections) & MongoDB
      utils/                🛠️ filename sanitizing, auth, logger_streamer, firebase_admin_sdk
      main.py               🚀 FastAPI app + router wiring
    requirements.txt        📝 Python dependencies
    .env.example            🔐 Example environment variables
  frontend/                 🎨 React (Vite) + Tailwind + Plotly + AG Grid
    src/
      components/
        charts/             📈 ResultChart, ResultTable, SqlViewer, DownloadButtons
        chat/               💬 ChatPanel (AI chat with export + clear)
        explore/            🔍 ExplorePanel (manual column/aggregation builder)
        sql-editor/         💻 SqlEditorPanel (DuckDB SQL runner & schema tree)
        layout/             🏗️ Header (macOS window bar), Sidebar (collapsible icon dock)
        preview/            👀 PreviewTable (AG Grid compact data preview)
        upload/             ☁️ UploadArea (drag-and-drop seamless dropzone)
        auth/               🔐 Auth modal, OTP verification, password reset
      pages/                🏠 Dashboard.jsx, LandingPage.jsx, Admin.jsx, AdminAuth.jsx, Docs.jsx, FaqPage.jsx
      context/              🧠 DatasetContext & UserContext
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

*API docs available at [http://localhost:8000/docs](http://localhost:8000/docs) and Admin API endpoints at [http://localhost:8000/api/admin](http://localhost:8000/api/admin) once running.*

### 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

*The Vite dev server proxies `/api/*` to `http://localhost:8000`.*  
*Admin Portal UI available at [http://localhost:5173/admin](http://localhost:5173/admin) (Login page: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)).*

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

### 🛡️ Admin Portal & Control Center (Frontend: `http://localhost:5173/admin` | Backend API: `http://localhost:8000/api/admin`)

- **Role-Protected & Demo Auth**: Access via email/password or 1-click Demo Admin (`admin@demo.com`), secured by JWT Bearer tokens and admin role authorization.
- **Groq API Usage Tracker with Date Range Filtering**: Custom SVG daily bar chart and summary analytics tracking total LLM API calls, estimated token consumption, today's request count, and recorded days in MongoDB `groq_usage` collection, with support for date range filters (`All Time`, `Today`, `Last 7 Days`, `Last 30 Days`, and Custom Start/End Date Pickers).
- **Standalone Admin & User Directories**: Independent top-level tabs for **Admin Management** and **User Management** with server-side MongoDB `.skip()` / `.limit()` pagination, regex search, role badges, and verification status.
- **Active WebApp User Session Tracker**: Thread-safe live session monitoring (`/api/admin/active-sessions`) tracking real-time active user sessions, admin vs standard user breakdown, idle time, and online state.
- **System Health Diagnostics**: Real-time monitoring of MongoDB connectivity & ping response time (ms), active DuckDB in-memory connections, active webapp sessions, Groq API key readiness, and API latency.
- **Live System Log Streamer**: In-memory ring buffer log capture streaming real-time FastAPI logs with log level filtering (`ALL`, `INFO`, `WARNING`, `ERROR`), search filtering, and 3-second live auto-refresh.

### 🎨 Modern Apple macOS Studio UI

- **120Hz Smooth Inertia Scrolling**: Powered by Lenis with dynamic interactive spring animations.
- **Frosted Glass Navigation**: Translucent floating navbar with instant light/dark mode switcher and Kaushan Script typography.
- **MacBook Pro Window Aesthetics**: Realistic traffic light controls, bento grid layout, and backgroundless floating graphics.

---

## 🔮 Future Roadmap

- [x] 🔐 Auth and user sessions with OTP email verification
- [x] 🛡️ Admin Portal with user management, Groq LLM analytics, health checks, & live log streamer
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
