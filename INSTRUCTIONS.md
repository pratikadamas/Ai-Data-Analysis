<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=28&pause=1000&color=3B82F6&center=true&vCenter=true&width=800&lines=AI+Data+Analysis;Codebase+%26+Environment+Guide;Master+Your+Application" alt="Typing SVG" />
</div>

# 📘 Project Instructions & Codebase Guide

Welcome to the inner workings of **AI Data Analysis**! This document explains the working principles of the individual files that power this application, and details the critical role of the environment (`.env`) file.

---

## 🔐 The `.env` File: The Heart of the Application

The `.env` file is where all the secret credentials and configuration settings live. **Without this file, the backend cannot function.**

### 🛠️ Step-by-Step Setup Guide for Credentials

Here is exactly how to get all the required keys for your `.env` file to get the application running perfectly!

#### 1. 🍃 MongoDB Setup (`MONGODB_URI`)

*MongoDB is used to securely store user accounts, passwords, and email verification codes.*

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Click **"Build a Database"** and select the **"M0 Free"** tier.
3. Once the cluster is created, it will ask for a **Username and Password**. Create a Database User and save the password.
4. Under "Where would you like to connect from?", select **"My Local Environment"** and add your current IP address (or `0.0.0.0/0` to allow access from anywhere).
5. Click **"Connect"** on your cluster dashboard, select **"Drivers"**, and copy the connection string.
6. Paste it into your `.env` file, replacing `<username>` and `<password>` with the credentials you just made.

> **Format:** `MONGODB_URI=mongodb+srv://user:password@cluster0.abc.mongodb.net/?retryWrites=true&w=majority`

#### 2. 🧠 Groq API Setup (`GROQ_API_KEY`)

*Groq powers the AI. It translates plain English into DuckDB SQL and explains your charts at lightning speed.*

1. Go to the [Groq Console](https://console.groq.com/) and sign in.
2. On the left sidebar, click on **"API Keys"**.
3. Click the **"Create API Key"** button.
4. Give it a name (like `AI_Data_Analysis`) and hit Submit.
5. Copy the generated key (it usually starts with `gsk_`). **Note:** You can only view this key once!
6. Paste it into your `.env` file.

> **Format:** `GROQ_API_KEY=gsk_your_super_secret_api_key_here`

#### 3. ✉️ Email SMTP Setup (`MAIL_USERNAME`, `MAIL_PASSWORD`)

*The application needs an email account to send 6-digit OTP codes to users when they register or forget their password.*

1. Go to your [Google Account Security Page](https://myaccount.google.com/security).
2. Ensure **"2-Step Verification"** is turned **ON**.
3. In the search bar at the top, search for **"App passwords"** (or click into 2-Step Verification and scroll to the bottom).
4. For the app name, type a custom name like `AI Data Analysis` and click **"Generate"**.
5. Google will give you a 16-character password in a yellow box (e.g., `abcd efgh ijkl mnop`).
6. Copy this password, remove the spaces (`abcdefghijklmnop`), and paste it into your `.env` file as `MAIL_PASSWORD`.
7. Put your actual Gmail address as the `MAIL_USERNAME` and `MAIL_FROM`.

> **Format:**  
> `MAIL_USERNAME=your.email@gmail.com`  
> `MAIL_PASSWORD=abcdefghijklmnop`

#### 4. 🔥 Firebase Google OAuth Setup (`VITE_FIREBASE_*`)

*Firebase handles 1-click Google Sign-In with zero client-side private keys.*

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create or select a project.
2. In the left sidebar under **Build**, open **Authentication** and enable the **Google** provider.
3. Open **Project Settings $\rightarrow$ General** and find your Web App configuration.
4. Copy the keys to `frontend/.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
#### 5. 🛡️ Admin Portal Credentials (`/admin/login`)

*The application includes a built-in admin dashboard for system diagnostics, Groq API usage tracking, and user account management.*

- **Admin Login URL:** `http://localhost:5173/admin/login` (or directly via `/admin`)
- **Demo Admin Email:** `admin@demo.com`
- **Demo Admin Password:** `admin123`
- *Signing in with these credentials automatically provisions or validates the `admin_demo` account in MongoDB with full admin privileges.*

---

## 🗂️ Working Principle of Key Files

### ⚙️ Backend (FastAPI + DuckDB + MongoDB)

- **`backend/app/main.py`** 🚀
  - *The Entry Point.* Initializes the FastAPI application, configures CORS so the React frontend can talk to it, and registers all the API routes.
- **`backend/app/config.py`** 🎛️
  - *The Configuration Manager.* Reads your `.env` file and loads the variables into a structured Python class, making it easy and safe for the rest of the app to access your secrets.
- **`backend/app/db/mongodb.py`** 🗄️
  - *The Database Connector.* Establishes the connection to MongoDB using `pymongo` and sets up TTL (Time-To-Live) indexes so OTP codes automatically expire after 10 minutes.
- **`backend/app/api/routes/auth.py`** 🛡️
  - *The Gatekeeper.* Handles user registration, OTP verification, login (JWT token generation), password resets, and the `/api/auth/google` verification flow.
- **`backend/app/api/routes/admin.py`** 📊
  - *The Control Center.* Serves admin diagnostics, Groq API usage stats with date range filtering, user management tables, and active session telemetry.
- **`backend/app/api/routes/chat.py`** 💬
  - *The Conversational Engine.* Receives chat messages, delegates SQL generation to the LLM, validates the SQL, executes it against DuckDB, and returns the data and chart configuration to the user.
- **`backend/app/services/llm_service.py`** 🧠
  - *The AI Whisperer.* Constructs the specialized system prompts, injects the dataset schema, and calls the Groq API to generate accurate SQL queries with backward-compatible httpx client patching.
- **`backend/app/services/file_loader.py`** 📂
  - *The Data Engine.* Loads uploaded CSV or Excel files straight into DuckDB's fast, in-memory analytical engine.
- **`backend/app/utils/firebase_admin_sdk.py`** 🔥
  - *The Token Verifier.* Dual-strategy token verifier: validates Google/Firebase OAuth ID tokens via Firebase Admin SDK or direct Google public cert verification.
- **`backend/app/utils/session_tracker.py`** ⏱️
  - *The Live Monitor.* Thread-safe tracker recording active user requests, roles, online presence, and idle timeouts.
- **`backend/app/utils/mail.py`** ✉️
  - *The Mailman.* Uses SMTP to format and send HTML-styled verification emails containing OTPs.
- **`backend/tests/test_fastapi_upload.py` & `test_multi_upload.py`** 🧪
  - *Automated Test Suites.* Validates single-file and multi-file multipart uploads, dataset appending, joined DuckDB SQL queries across tables, and schema session restoration.

### 🎨 Frontend (React + Vite + Tailwind)

- **`frontend/src/main.jsx` & `App.jsx`** ⚛️
  - *The Web Roots.* Mounts the React application to the DOM, initializes theme persistence, sets up global routing and context providers, and controls the 3-second initial brand splash loader.
- **`frontend/src/components/shared/MainAppLoader.jsx`** 🌀
  - *The Quantum Splash Loader.* Features a tri-orbital quantum reactor with alternating rotational arcs, satellite node, neural data frequency bars, unboxed floating favicon, and a dynamic laser progress beam.
- **`frontend/src/pages/Dashboard.jsx`** 🎛️
  - *The Command Center.* The main user interface where the Sidebar, Upload Area, Chat Panel, and Charts all come together.
- **`frontend/src/pages/Terms.jsx`, `PrivacyPolicy.jsx`, `Docs.jsx`, `FaqPage.jsx`** 📜
  - *Legal & Knowledge Base Pages.* Features dynamic scroll-squeezing navigation (full-width initially, smoothly squeezing into a floating pill on scroll), centered hero headers, and unclipped cursive typography (`font-kaushan`).
- **`frontend/src/components/AnimatedThemeToggler.tsx` & `ThemeToggle.jsx`** 🌓
  - *The Motion Theme Switcher.* View Transitions API implementation supporting 7 geometry transition shapes (`circle`, `square`, `triangle`, `diamond`, `hexagon`, `rectangle`, `star`) expanding from the click origin.
- **`frontend/src/components/shared/CardSkeleton.jsx`** ⏳
  - *The Skeleton Loading System.* Glassmorphic skeleton cards and shimmers providing smooth visual feedback during data queries and low network connections.
- **`frontend/src/components/shared/NetworkStatusBadge.jsx` & `useNetworkStatus.js`** 📶
  - *The Network Diagnostic HUD.* Periodically measures round-trip latency to the backend API, monitors online/offline status, and displays real-time connection badges.
- **`frontend/src/components/chat/ChatPanel.jsx`** 💬
  - *The User Interface.* Renders the chat bubbles, handles user input, displays typing indicators, and manages the conversation history state.
- **`frontend/src/components/charts/PlotlyChart.jsx`** 📊
  - *The Visualizer.* Takes the JSON data and layout configurations returned by the backend and renders beautiful, interactive graphs using Plotly.js.
- **`frontend/src/context/UserContext.jsx`** 🔐
  - *The State Manager.* Globally manages user authentication (both email/password and Google OAuth), stores JWT tokens, and handles profile avatar states.
- **`frontend/src/components/layout/UserNavProfile.jsx`** 👤
  - *The Profile Navigation Component.* Renders the active user pill on the floating navbar, shows user info/actions, and supports smooth outside-click modal dismissal.
- **`frontend/src/lib/utils.ts` & `utils.js`** 🛠️
  - *Utility Functions.* Provides the type-safe `cn` class combiner helper with iterative array flattening to prevent infinite type recursion, paired with `tsconfig.json` for IDE path mapping.

---

## 🚀 Deployment

For a comprehensive guide on deploying this application (including the Vercel Monorepo setup or the Render Split Architecture), please see our dedicated [Deployment Guide](DEPLOYMENT.md).

<br/>

<div align="center">
  <i>Master your codebase and deploy with confidence! 🚀🌐</i>
</div>
