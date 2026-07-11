# AI Data Analyst

Upload structured data (CSV, Excel, SQLite, SQL dump) and analyze it in plain
English — no SQL required. The backend runs queries through DuckDB with a strict
read-only SQL whitelist; the frontend gives you manual chart building plus an
AI chat mode powered by **Groq** (Llama 3.3 70B).

## Project layout

```
ai-data-analyst/
  backend/                  FastAPI + DuckDB service
    app/
      api/routes/           upload, explore, chat, dataset, download endpoints
      services/             file_loader, schema_service, llm_service, chart_service
      validation/           sql_validator (whitelist-based SQL safety checks)
      models/               Pydantic request/response schemas
      db/                   DuckDBManager (per-dataset in-memory connections)
      utils/                filename sanitizing, extension detection
      main.py               FastAPI app + router wiring
    requirements.txt
    .env.example
  frontend/                 React (Vite) + Tailwind + Plotly
    src/
      components/
        charts/             ResultChart, ResultTable, SqlViewer, DownloadButtons
        chat/               ChatPanel (AI chat with export + clear)
        explore/            ExplorePanel (manual column/aggregation builder)
        layout/             Header, Sidebar
        preview/            PreviewTable (AG Grid data preview)
        upload/             UploadArea (drag-and-drop)
      pages/                Dashboard.jsx
      context/              DatasetContext (dataset + chat history state)
      services/             api.js (Axios client)
      utils/                exportChat.js (HTML report generator)
```

## Backend setup

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate   # Windows
# python3 -m venv .venv && source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
cp .env.example .env   # add your GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs` once running.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:8000` (see
`vite.config.js`), so run both servers together.

## Environment variables (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | **Yes** | Groq API key for LLM features. Get one free at [console.groq.com/keys](https://console.groq.com/keys) |
| `APP_ENV` | No | `development` (default) or `production` |
| `MAX_UPLOAD_MB` | No | Max file size in MB (default: `200`) |
| `UPLOAD_DIR` | No | Temp upload path (default: `./uploads`) |
| `CORS_ORIGINS` | No | Comma-separated allowed origins (default: `http://localhost:5173`) |

> The app works without a key for upload, preview, and explore. Only the AI chat
> tab requires `GROQ_API_KEY`. A missing key returns HTTP 503 with a clear error.

## What's implemented

### Data ingestion
- Drag-and-drop or click-to-upload for CSV, Excel (`.xlsx`/`.xls`), SQLite (`.db`/`.sqlite`), and SQL dump (`.sql`)
- Format auto-detection → loaded into a per-session in-memory DuckDB database
- The **uploaded filename becomes the SQL table name** (e.g. `sales_2024.csv` → table `sales_2024`), so the AI generates natural SQL using the real name. A `uploaded_data` view alias is also created for compatibility.
- Schema extraction with dtype / missing-count / duplicate-count stats

### AI Chat (`/api/chat`)
- Off-topic guard: a fast LLM classifier rejects non-data questions (shows a popup, does not pollute chat history)
- On-topic flow: question → Groq Llama 3.3 70B generates SQL → whitelist validation → DuckDB execution → Groq explains results → deterministic chart selection
- Chat history **persists across tab switches** (state is held in context, not the component)
- **Clear chat** button wipes history
- **Export Chat** button downloads the entire conversation as a styled, printable HTML report (all questions, answers, SQL, and full data tables — no backend call needed)

### Manual Explore (`/api/explore`)
- Pick X / Y columns, aggregation (sum / avg / count / min / max), and chart type
- Plotly-rendered charts: bar, line, scatter, horizontal bar, KPI, heatmap, table

### SQL safety
- Whitelist-based validator rejects `DROP`, `DELETE`, `INSERT`, `UPDATE`, `ALTER`, `CREATE`, `TRUNCATE`, `ATTACH`, `DETACH`, `COPY`, `PRAGMA`, and more
- Multi-statement detection, leading-keyword check, sqlparse-based parse tree validation

### Result display (in chat)
- AI explanation text
- Generated SQL (collapsible SQL viewer with copy button)
- **Paginated data table** (20 rows/page, sticky headers, null highlighting)
- Plotly chart (bar / line / scatter / KPI / heatmap / table fallback)

### Downloads
- `/api/download/csv` and `/api/download/excel` — re-validates SQL before export
- Chat-level **Export Chat** → full HTML report (printable to PDF via browser)

## LLM integration

`llm_service.py` uses the **Groq Python SDK** (`groq` package) with model
`llama-3.3-70b-versatile`. Three calls are made per chat turn:

1. **Off-topic classifier** — `max_tokens=10`, `temperature=0.0` → `DATA` or `OFF_TOPIC`
2. **SQL generation** — `max_tokens=512`, `temperature=0.0` (deterministic)
3. **Result explanation** — `max_tokens=256`, `temperature=0.3` (conversational)

All Groq errors are wrapped as `LLMServiceError` and surfaced as HTTP 503 with a
readable `detail` field — the rest of the app (upload, preview, explore) continues
working even with an invalid or missing API key.

## Not yet implemented (future features)

- Auth and user sessions
- Saved/named dashboards
- Multi-turn conversation context (history passed to the LLM)
- Multi-file joins
- External DB connections (MySQL / Postgres / Snowflake)
- PDF/PPTX export
- Voice queries
- Mobile-responsive layout
