<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=28&pause=1000&color=F59E0B&center=true&vCenter=true&width=800&lines=Deployment+Guide;Render+%26+Vercel+Strategies" alt="Typing SVG" />
</div>

# 🚀 Deployment Guide (Render & Vercel)

There are two primary ways to deploy this application: the **Split Architecture** (Recommended for data persistence) and the **Unified Vercel Architecture** (Monorepo).

> [!WARNING]
> **DuckDB Serverless Limitation:** If you choose to deploy the backend on a serverless platform (like Vercel), keep in mind that serverless functions are ephemeral. Because this application relies on **DuckDB** running in-memory and local file uploads, the data state will wipe out when the serverless function spins down between requests. For a production app with persistent in-memory data, the Render Web Service is recommended.

---

## Option A: Unified Deployment (Vercel Only)

Vercel *can* host both the React frontend and the Python FastAPI backend in a single deployment using a `vercel.json` configuration file at the root of your project.

1. Ensure the `vercel.json` file is present in your root directory. It contains the configuration needed to map `/api/*` routes to your Python backend and the rest to your Vite frontend.
2. Import the project into Vercel.
3. Vercel will automatically build the frontend and set up the Python environment for the backend based on `backend/requirements.txt`.
4. Ensure you add your environment variables (`GROQ_API_KEY`, `MONGODB_URI`, etc.) in the Vercel project settings.

---

## Option B: Split Architecture (Render Backend + Vercel Frontend)

Render is ideal for the backend because it provides a persistent Web Service that keeps your DuckDB instance loaded in memory during a user's session.

### 1. Backend (Render)

1. Go to [Render.com](https://render.com/) and connect your GitHub account.
2. Click **New +** and select **Web Service**.
3. Select your repository.
4. Configure the settings:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click **Advanced** and add **all** of the Environment Variables from your `.env` file (MongoDB URI, Groq API Key, Mail settings).
6. Click **Create Web Service**.
7. Save the provided live URL (e.g., `https://ai-data-analyst-backend.onrender.com`).

### 2. Frontend (Vercel)

1. Go to [Vercel.com](https://vercel.com/) and connect your GitHub account.
2. Click **Add New -> Project** and import your repository.
3. In the configuration settings, set the **Root Directory** to `frontend`.
4. Vercel will automatically detect Vite and set the build commands (`npm run build`).
5. *Crucial Step:* You must configure your frontend to point to the new Render backend URL instead of `localhost:8000`. Set the Environment Variable `VITE_API_URL` to your Render URL.
6. Click **Deploy**.

*Note: Once both are deployed, ensure your Render Web Service `CORS_ORIGINS` environment variable is updated to accept traffic from your new Vercel domain!*

<br/>

<div align="center">
  <i>Deploy your app to the world with confidence! 🚀🌐</i>
</div>
