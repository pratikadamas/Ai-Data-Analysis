<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=32&pause=1000&color=3B82F6&center=true&vCenter=true&width=800&lines=AI+Data+Analysis;Your+Intelligent+Data+Assistant" alt="Typing SVG" />
</div>

<div align="center">
  <h1>✨ AI Data Analysis website ✨</h1>
  <p><i>Your intelligent, conversational data analysis assistant.</i></p>

  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/DuckDB-FFF000?style=for-the-badge&logo=duckdb&logoColor=black" alt="DuckDB" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  
  <br/><br/>
</div>

> **🚀 Analyze your structured data (CSV, Excel, SQLite, SQL dump) in plain English — no SQL required!**  
> The backend runs queries securely through **DuckDB** with a strict read-only SQL whitelist, while the frontend provides a macOS-inspired Studio workspace with **Data Preview**, **Explore Visualizer**, **Ask AI (Llama 3.3 70B via Groq)**, and a full **SQL Editor**.

## 🌟 Key Features

- 🖥️ **macOS Studio Aesthetic**: Sleek frosted glass (`backdrop-blur-2xl`), interactive collapsible dock sidebar with hover tooltips, and ultra-compact responsive layout.
- 🌀 **Quantum Splash Loader (`MainAppLoader.jsx`)**: High-tech tri-orbital quantum reactor with alternating rotational arcs, satellite node, neural data frequency bars, unboxed floating favicon with ambient drop-shadow, and a minimum 3-second brand intro.
- 🧭 **Dynamic Scroll-Squeezing Navigation**: Starts full-screen width at the top (`scrollY === 0`) and smoothly squeezes into a floating frosted glass pill on scroll across the Home page and all legal/documentation pages (`/terms`, `/privacy`, `/docs`, `/faq`).
- 🎯 **Centered Hero Headers**: Clean, unified centered hero banners on all footer redirect pages with unclipped cursive typography (`font-kaushan`).
- ⚡ **Zero-Lag In-Memory Analytics**: Instant queries on multi-million row datasets via embedded DuckDB with read-only whitelist validation and multi-table joins.
- 📂 **Multi-File Upload & Background Queues**: Upload up to 10 CSV, Excel (`.xlsx`/`.xls`), SQLite (`.db`), or `.sql` files with persistent background upload queues and automatic session schema recovery.
- 🤖 **Conversational AI Analysis**: Ask questions in plain English. The AI generates verified SQL queries, markdown explanations, interactive Plotly visualizations, and downloadable HTML reports.
- 📊 **Auto-Explore & Visualizer**: Interactive chart builder with dynamic aggregation (`SUM`, `AVG`, `COUNT`, `MIN`, `MAX`) across 7 chart types.
- 💻 **SQL Editor & Schema Explorer**: Live table schema explorer, syntax validation, and instant table preview with export options.
- 🌓 **Animated View Transitions Theme Switcher**: Dynamic viewport-expanding clip-path dark/light mode toggle with native View Transitions API supporting 7 geometric shapes (`circle`, `square`, `triangle`, `diamond`, `hexagon`, `rectangle`, `star`).
- 📶 **Network & Loading State Animations**: Real-time connection latency monitor, offline detection, and glassmorphic skeleton cards (`CardSkeleton`, `StatCardSkeleton`, `ChartSkeleton`) with GPU-accelerated shimmer animations during network delays or background processing.
- 🔐 **Dual Authentication (Email OTP + Google OAuth)**: Secure registration with 6-digit email OTPs, password resets, and 1-click Google sign-in via Firebase with backend token validation.
- 🛡️ **Admin Portal & Control Center**: Dedicated management dashboard for Groq LLM API analytics, paginated user management, system health diagnostics, and live backend log streaming (Demo Admin: `admin@demo.com` / `admin123`).
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
ai-data-analysis/
├── backend/                        # FastAPI + DuckDB Analytical Engine
│   ├── app/
│   │   ├── api/routes/             # Endpoints (upload, chat, explore, auth, admin, dataset, download)
│   │   ├── db/                     # DuckDB session manager & MongoDB Atlas
│   │   ├── models/                 # Pydantic schemas & validation models
│   │   ├── services/               # LLM Groq prompt engine, DuckDB file loader, chart service
│   │   ├── utils/                  # Firebase OAuth SDK, JWT auth, logger streamer, bloom filter
│   │   ├── validation/             # Whitelist SQL safety & AST parse checker
│   │   └── main.py                 # FastAPI app entry point & CORS configuration
│   ├── tests/                      # Integration & multi-file upload test suite
│   ├── requirements.txt            # Python dependencies
│   └── .env.example                # Environment variable configuration template
│
├── frontend/                       # React (Vite) + Tailwind CSS + Plotly + AG Grid
│   ├── src/
│   │   ├── components/             # Modular UI components
│   │   │   ├── charts/             # Plotly canvas, ResultTable, SqlViewer, exports
│   │   │   ├── chat/               # Conversational AI panel & report exporter
│   │   │   ├── explore/            # Interactive aggregation & pivot builder
│   │   │   ├── layout/             # macOS studio window bar, collapsible sidebar, UserNavProfile
│   │   │   ├── preview/            # AG Grid compact dataset preview
│   │   │   ├── shared/             # MainAppLoader, shimmer skeletons, network HUD
│   │   │   ├── sql-editor/         # DuckDB SQL workspace & schema inspector
│   │   │   ├── upload/             # Drag-and-drop dataset dropzone
│   │   │   ├── AnimatedThemeToggler.tsx # View Transition animated theme switcher
│   │   │   └── ThemeToggle.jsx     # Dark/light mode toggle wrapper
│   │   ├── context/                # React state contexts (Dataset, User)
│   │   ├── hooks/                  # Custom hooks (dark mode, network latency)
│   │   ├── lib/                    # Shared utilities (type-safe clsx/twMerge)
│   │   ├── pages/                  # Route views (Dashboard, Admin, Landing, Terms, Privacy, etc.)
│   │   ├── services/               # Axios API client & backend endpoints
│   │   ├── utils/                  # HTML report exporter
│   │   ├── App.jsx                 # Main application router
│   │   └── styles/index.css        # Global theme tokens, typography, glassmorphism
│   ├── package.json                # Frontend scripts & NPM dependencies
│   ├── tailwind.config.js          # Tailwind CSS theme extensions & animations
│   └── vite.config.js              # Vite bundler settings & API reverse proxy
│
├── .vscode/                        # IDE workspace configuration (Python interpreter path)
├── ARCHITECTURE.md                 # System architecture & data flow specification
├── DEPLOYMENT.md                   # Multi-platform deployment instructions
├── INSTRUCTIONS.md                 # Setup guide, credentials & file breakdown
├── LICENSE                         # MIT License
└── README.md                       # Main project documentation & quickstart
```

---

## 🛠️ Setup & Installation

### ⚙️ Backend Setup

```bash
cd backend
# 1. Create Python virtual environment (Python 3.10 - 3.12 recommended; Python 3.11 is ideal)
# Note: Avoid Python 3.14 as PyPI does not yet have pre-compiled wheels for pandas/duckdb on Windows
python -m venv .venv

# 2. Activate virtual environment:
# 🔹 PowerShell (Windows):
.\.venv\Scripts\Activate.ps1

# 🔹 Git Bash (MINGW64 / Windows):
source .venv/Scripts/activate

# 🔹 Command Prompt (CMD / Windows):
.venv\Scripts\activate.bat

# 🔹 macOS / Linux:
source .venv/bin/activate

# 3. Install dependencies & configure environment:
pip install -r requirements.txt
cp .env.example .env   # 🔑 Add your GROQ_API_KEY, MONGODB_URI, and MAIL credentials

# 4. (Optional) Run automated tests:
python tests/test_fastapi_upload.py
python tests/test_multi_upload.py

# 5. Start the backend server:
uvicorn app.main:app --reload --port 8000
```

*API docs available at [http://localhost:8000/docs](http://localhost:8000/docs) and Admin API endpoints at [http://localhost:8000/api/admin](http://localhost:8000/api/admin) once running.*  
*Default Demo Admin Credentials: `admin@demo.com` / `admin123`.*

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
| `MONGODB_URI` | 🟢 **Yes** | MongoDB connection URI for user authentication, OTPs, and Groq usage analytics |
| `SECRET_KEY` | 🟢 **Yes** | JWT secret key for signing authentication tokens |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | ⚪ Optional | Gmail SMTP credentials for sending 6-digit email OTPs |
| `FIREBASE_PROJECT_ID` | ⚪ Optional | Firebase Project ID for server-side Google OAuth token verification |
| `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | ⚪ Optional | Service account credentials for Firebase Admin SDK (optional fallback to Google public certs) |
| `APP_ENV` | ⚪ No | `development` (default) or `production` |
| `MAX_UPLOAD_MB` | ⚪ No | Max file size in MB (default: `200`) |
| `UPLOAD_DIR` | ⚪ No | Temp upload path (default: `./uploads`) |
| `CORS_ORIGINS` | ⚪ No | Comma-separated allowed origins (default: `http://localhost:5173,http://127.0.0.1:5173`) |

> 💡 **Frontend Firebase Variables (`frontend/.env`):**  
> For Google sign-in on the frontend, add `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`.
>
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
- **Google OAuth via Firebase**: 1-click Google Sign-In with popup OAuth flow, server-side token claim validation (supporting both Firebase Admin SDK and direct Google public cert verification), and automatic user account upserting.
- **Persistent Header Profile**: Real-time user avatar, username display, modal window with outside-click dismissal, and account settings.

### 🛡️ Admin Portal & Control Center (Frontend: `http://localhost:5173/admin` | Backend API: `http://localhost:8000/api/admin`)

- **Role-Protected & Demo Auth**: Access via email/password or 1-click Demo Admin (`admin@demo.com`), secured by JWT Bearer tokens and admin role authorization.
- **Groq API Usage Tracker with Date Range Filtering**: Custom SVG daily bar chart and summary analytics tracking total LLM API calls, estimated token consumption, today's request count, and recorded days in MongoDB `groq_usage` collection, with support for date range filters (`All Time`, `Today`, `Last 7 Days`, `Last 30 Days`, and Custom Start/End Date Pickers).
- **Standalone Admin & User Directories**: Independent top-level tabs for **Admin Management** and **User Management** with server-side MongoDB `.skip()` / `.limit()` pagination, regex search, role badges, and verification status.
- **Active WebApp User Session Tracker**: Thread-safe live session monitoring (`/api/admin/active-sessions`) tracking real-time active user sessions, admin vs standard user breakdown, idle time, and online state.
- **System Health Diagnostics**: Real-time monitoring of MongoDB connectivity & ping response time (ms), active DuckDB in-memory connections, active webapp sessions, Groq API key readiness, and API latency.
- **Live System Log Streamer**: In-memory ring buffer log capture streaming real-time FastAPI logs with log level filtering (`ALL`, `INFO`, `WARNING`, `ERROR`), search filtering, and 3-second live auto-refresh.

### 🎨 Modern Apple macOS Studio UI & Motion Engine

- **Animated View Transitions Theme Switcher**: Full View Transitions API integration (`AnimatedThemeToggler.tsx`) with GPU clip-path animations expanding from the click origin across 7 geometry variants (`circle`, `square`, `triangle`, `diamond`, `hexagon`, `rectangle`, `star`).
- **Low-Network & Background Loading Skeletons**: Integrated network status hook (`useNetworkStatus.js`) and header badge displaying live latency (ms) and connection state. Shimmering skeleton placeholders (`CardSkeleton.jsx`) seamlessly take over cards, metrics, and chart canvas during data fetching or background DuckDB execution.
- **120Hz Smooth Inertia Scrolling**: Powered by Lenis with dynamic interactive spring animations.
- **Frosted Glass Navigation**: Translucent floating navbar with instant theme switcher and Kaushan Script typography.
- **MacBook Pro Window Aesthetics**: Realistic traffic light controls, bento grid layout, and backgroundless floating graphics.

---

## 🔮 Future Roadmap

- [x] 🔐 Auth and user sessions with OTP email verification & Google OAuth
- [x] 🛡️ Admin Portal with user management, Groq LLM analytics, health checks, & live log streamer
- [x] 🎨 Apple macOS / MacBook Pro design system with dark & light theme persistence
- [x] ⚡ 120Hz Lenis smooth inertial scrolling
- [x] 🌓 Silky smooth View Transitions theme switcher with 7 geometric shapes & quintic easing
- [x] 📶 Real-time network latency HUD & responsive shimmer skeleton loading states
- [ ] 📌 Saved/named dashboards
- [ ] 🔄 Multi-turn conversation context (history passed to the LLM)
- [ ] 🔗 Multi-file joins
- [ ] 🐘 External DB connections (MySQL / Postgres / Snowflake)
- [ ] 📄 PDF/PPTX export
- [ ] 🎙️ Voice queries

---

## 🛠️ Remaining Roadmap Features: Implementation Blueprints

Below is the end-to-end engineering blueprint for each remaining feature, detailing how it will be built, the underlying architecture, data flows, and UI integration:

### 1. 📌 Saved & Named Dashboards

#### 🎯 Objective & Workflow for Saved Dashboards

Allow authenticated users to pin generated charts, KPI widgets, and custom SQL tables from AI Chat or Explore into persistent, named dashboard views that can be reloaded anytime.

#### ⚙️ Technical Architecture for Saved Dashboards

1. **MongoDB Collection (`dashboards`)**:

   ```json
   {
     "_id": "ObjectId(...)",
     "user_id": "user_id_string",
     "name": "Q3 Executive Revenue Overview",
     "description": "Quarterly breakdown of margins and category growth",
     "dataset_name": "sales_q3.csv",
     "widgets": [
       {
         "id": "w_01",
         "title": "Profit Margin by Category",
         "type": "chart",
         "sql": "SELECT category, SUM(profit) FROM sales_q3 GROUP BY 1",
         "chart_type": "bar",
         "chart_spec": { },
         "layout": { "x": 0, "y": 0, "w": 6, "h": 4 }
       }
     ],
     "created_at": "ISO-8601",
     "updated_at": "ISO-8601"
   }
   ```

2. **Backend API Endpoints (`/api/dashboards`)**:
   - `POST /api/dashboards`: Create/save a dashboard configuration with widget queries and layouts.
   - `GET /api/dashboards`: Retrieve all saved dashboards belonging to the authenticated user.
   - `GET /api/dashboards/{id}`: Fetch a specific dashboard and execute saved queries against the active DuckDB in-memory session.
   - `PUT /api/dashboards/{id}`: Update widget layout, titles, or chart configurations.
   - `DELETE /api/dashboards/{id}`: Delete a saved dashboard.

3. **Frontend Implementation**:
   - **Pin Button**: Added to each AI chat result card and Explore view: `"Pin to Dashboard"`.
   - **Dashboard Studio View (`DashboardsPanel.jsx`)**: Responsive CSS Grid / Bento Grid displaying saved widgets with auto-refresh and export capabilities.

---

### 2. 🔄 Multi-Turn Conversation Context

#### 🎯 Objective & Workflow for Multi-Turn Context

Enable contextual follow-up questions in the AI Chat (e.g., *"Show top 5 products by revenue"*, followed by *"Now filter that only for Europe"* or *"What was the total profit for these?"*).

#### ⚙️ Technical Architecture for Multi-Turn Context

1. **Request Schema Update (`ChatRequest`)**:
   - Add `conversation_history: List[ConversationTurn] = []`.
   - Each turn contains `{ role: "user" | "assistant", question: str, sql?: str, summary?: str }`.

2. **Sliding-Window Context Ingestion (`llm_service.py`)**:
   - Build a contextual system prompt incorporating the last 4–6 conversational turns.
   - Structure prompt with clear demarcations:

     ```text
     PREVIOUS CONTEXT:
     User: "Show top 5 products by revenue"
     Executed SQL: SELECT product_name, SUM(revenue) FROM sales GROUP BY 1 ORDER BY 2 DESC LIMIT 5
     Assistant Summary: Here are the top 5 products leading sales...

     CURRENT FOLLOW-UP:
     User: "Now filter that only for Europe"
     INSTRUCTION: Modify or extend the previous SQL query using the conversation context above.
     ```

3. **Contextual Intent Guard**:
   - Ensure the intent classifier evaluates follow-up questions against previous context so queries like *"Now show Europe"* are recognized as data refinements rather than ambiguous inputs.

4. **Frontend State Management**:
   - `ChatPanel.jsx` persists conversation state and passes recent turn history in each `/api/chat` request with an option to `"Start New Topic"` to reset context.

---

### 3. 🔗 Multi-File Joins

#### 🎯 Objective & Workflow for Multi-File Joins

Allow users to upload multiple interrelated files (e.g. `orders.csv` and `customers.xlsx`) and ask cross-table analytical questions that require automatic SQL `JOIN` operations.

#### ⚙️ Technical Architecture for Multi-File Joins

1. **Multi-Table Session Registry (`duckdb_manager.py`)**:
   - Register all uploaded files in a session as independent tables within the same DuckDB in-memory database (`conn.register("orders", ...)`, `conn.register("customers", ...)`).

2. **Cross-Table Relationship Discovery (`schema_service.py`)**:
   - Inspect primary/foreign key naming conventions (e.g. `customer_id` present in both `orders` and `customers`).
   - Sample column values to check intersection overlap and suggest join paths.

3. **Join-Aware LLM Prompting (`llm_service.py`)**:
   - Feed the schema of *all* session tables into the LLM prompt.
   - Instruct the LLM to generate explicit ANSI SQL joins (`FROM orders INNER JOIN customers ON orders.customer_id = customers.id`) using table aliases.

4. **Frontend Schema Explorer**:
   - Schema tree displays interrelated tables with connection link badges and suggested join queries.

---

### 4. 🐘 External Database Connections (MySQL, PostgreSQL, Snowflake)

#### 🎯 Objective & Workflow for External Databases

Connect directly to live relational and cloud data warehouses without manual CSV/Excel exports.

#### ⚙️ Technical Architecture for External Databases

1. **Native DuckDB Engine Connectors**:
   - Utilize DuckDB's native zero-copy extensions:
     - `INSTALL postgres; LOAD postgres;` $\rightarrow$ `ATTACH 'dbname=... host=...' AS pg_db (TYPE POSTGRES);`
     - `INSTALL mysql; LOAD mysql;` $\rightarrow$ `ATTACH 'host=... user=...' AS my_db (TYPE MYSQL);`
     - Snowflake / BigQuery connector via SQLAlchemy and Apache Arrow record batch streaming.

2. **Secure Credential Vault (`backend/app/db/connections.py`)**:
   - Credentials stored in MongoDB with AES-256 field-level encryption.
   - Enforce strictly read-only connections (`read_only=True`) to guarantee database safety.

3. **Connection Endpoints (`/api/connectors`)**:
   - `POST /api/connectors/test`: Performs connection handshake, latency ping, and schema inspection.
   - `POST /api/connectors/attach`: Mounts remote tables into the session DuckDB instance.

4. **Frontend Modal (`DatabaseConnectorModal.jsx`)**:
   - Tabbed setup form for PostgreSQL, MySQL, SQLite, and Snowflake with test connection validation.

---

### 5. 📄 PDF & PPTX Executive Export

#### 🎯 Objective & Workflow for PDF and PowerPoint Export

Generate executive-ready PDF analytics reports and formatted PowerPoint slide decks from chat insights, KPI cards, and Plotly charts.

#### ⚙️ Technical Architecture for PDF and PowerPoint Export

1. **Client-Side Instant Export**:
   - **PDF Generation**: Powered by `jspdf` and `html2canvas-pro` to capture vector Plotly charts, executive markdown summaries, and data tables with custom branding and pagination.
   - **PowerPoint (.pptx) Generation**: Powered by `pptxgenjs`:
     - **Slide 1**: Title slide with dataset name, author, and timestamp.
     - **Slide 2**: Executive Summary & high-level KPI cards.
     - **Slides 3+**: One slide per query with the question, high-res chart image, and AI insight bullets.

2. **Backend Server-Side Export (`/api/export/report`)**:
   - Python `reportlab` / `python-pptx` pipeline for automated scheduled reports.

3. **Frontend UI**:
   - Dedicated export dropdown in `Header.jsx` and `ChatPanel.jsx`:
     - 🌐 *Export as Interactive HTML* (Live)
     - 📄 *Export as PDF Document* (Formatted executive document)
     - 📊 *Export as PowerPoint (.pptx)* (Slide deck presentation)

---

### 6. 🎙️ Voice Queries (Speech-to-Text)

#### 🎯 Objective & Workflow for Voice Queries

Enable hands-free data analysis by allowing users to speak their questions directly into the chat input.

#### ⚙️ Technical Architecture for Voice Queries

1. **Dual-Layer Speech Recognition**:
   - **Layer 1 (Browser Web Speech API)**: Native `webkitSpeechRecognition` for zero-latency, client-side streaming transcription with real-time waveform animation.
   - **Layer 2 (Groq Whisper Fallback)**: For browsers without native speech recognition (Firefox/custom browsers), records audio via `MediaRecorder` and sends audio chunks to `/api/chat/transcribe` powered by Groq's high-speed `whisper-large-v3-turbo` model (<300ms turnaround).

2. **Frontend UI/UX (`VoiceInputButton.jsx`)**:
   - Microphone button integrated inside the chat input bar.
   - Pulsating audio wave animation while listening.
   - Auto-stops on silence detection and automatically triggers the analytical query.

<div align="center">
  <i>Built with ❤️ for data analysis everywhere! Happy Querying! 📊✨</i>
</div>
