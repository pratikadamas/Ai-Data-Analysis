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
5. Click **Advanced** and add your Environment Variables from `.env`:
   - `PYTHON_VERSION`: `3.11.9` *(Recommended: Ensures pre-compiled binary wheels for pandas and duckdb without compiling from source)*
   - `GROQ_API_KEY`: Your Groq Cloud API key
   - `MONGODB_URI`: MongoDB Atlas connection string (Ensure `0.0.0.0/0` or Render IPs are whitelisted)
   - `JWT_SECRET`: Random 32+ character secret
   - `RESEND_API_KEY`: *(Highly Recommended on Render)* Cloud HTTP email API key from [Resend.com](https://resend.com) (free 3,000 emails/month). Render blocks outbound SMTP ports 587 and 465, so HTTP APIs over port 443 are required for reliable OTP email delivery.
   - `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`: SMTP credentials (optional fallback for local/VPS environments where ports 587/465 are unblocked)
   - `ADMIN_EMAIL`: Admin email (defaults to `admin@demo.com`)
   - `ADMIN_PASSWORD_HASH`: Pre-hashed admin password or let the app initialize demo admin (`admin@demo.com` / `admin123`)
6. Click **Create Web Service**.
7. Save the provided live URL (e.g., `https://ai-data-analysis-backend.onrender.com`).

### 2. Frontend (Vercel)

1. Go to [Vercel.com](https://vercel.com/) and connect your GitHub account.
2. Click **Add New -> Project** and import your repository.
3. In the configuration settings, set the **Root Directory** to `frontend`.
4. Vercel will automatically detect Vite and set the build commands (`npm run build`).
5. *Crucial Step:* Set the Environment Variable `VITE_API_URL` to your backend URL (e.g. `https://ai-data-analysis-backend.onrender.com`).
6. Click **Deploy**.

---

### 3. Firebase Google OAuth Configuration (Important for Vercel)

When deploying the frontend to Vercel, Firebase will block Google Sign-In popup authentication until the Vercel domain is authorized:

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your Project.
3. In the left navigation, click **Build** $\rightarrow$ **Authentication**.
4. Go to the **Settings** tab $\rightarrow$ **Authorized domains**.
5. Click **Add domain** and enter your Vercel domain:
   - `ai-data-analysis-web-version.vercel.app` (and any custom domain you use).
6. Click **Save**.

> [!TIP]
> Make sure all `VITE_FIREBASE_*` environment variables (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.) are also added to your **Vercel Project Settings $\rightarrow$ Environment Variables**.

---

### 4. Production Pre-Flight Checklist

Before launching to production, verify:
- [x] **Backend Integration Tests:** Run `python tests/test_fastapi_upload.py` and `python tests/test_multi_upload.py` (both return HTTP 200).
- [x] **Frontend Production Bundle:** Run `npm run build` inside `frontend/` (verifies zero Rollup/Vite compilation or JSX syntax errors).
- [x] **CORS Whitelist:** Update `CORS_ORIGINS` in your backend environment to explicitly include your production Vercel domain.
- [x] **Admin Authentication:** Access `/admin/login` on your deployed frontend using your production or demo credentials (`admin@demo.com` / `admin123`).

---

<br/>

<div align="center">
  <i>Deploy your app to the world with confidence! 🚀🌐</i>
</div>

