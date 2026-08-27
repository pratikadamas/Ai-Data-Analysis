<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=28&pause=1000&color=3B82F6&center=true&vCenter=true&width=800&lines=AI+Data+Analyst;Codebase+%26+Environment+Guide;Master+Your+Application" alt="Typing SVG" />
</div>

# 📘 Project Instructions & Codebase Guide

Welcome to the inner workings of the **AI Data Analyst**! This document explains the working principles of the individual files that power this application, and details the critical role of the environment (`.env`) file.

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
4. Give it a name (like `AI_Data_Analyst`) and hit Submit.
5. Copy the generated key (it usually starts with `gsk_`). **Note:** You can only view this key once!
6. Paste it into your `.env` file.

> **Format:** `GROQ_API_KEY=gsk_your_super_secret_api_key_here`

#### 3. ✉️ Email SMTP Setup (`MAIL_USERNAME`, `MAIL_PASSWORD`)

*The application needs an email account to send 6-digit OTP codes to users when they register or forget their password.*

1. Go to your [Google Account Security Page](https://myaccount.google.com/security).
2. Ensure **"2-Step Verification"** is turned **ON**.
3. In the search bar at the top, search for **"App passwords"** (or click into 2-Step Verification and scroll to the bottom).
4. For the app name, type a custom name like `AI Data Analyst` and click **"Generate"**.
5. Google will give you a 16-character password in a yellow box (e.g., `abcd efgh ijkl mnop`).
6. Copy this password, remove the spaces (`abcdefghijklmnop`), and paste it into your `.env` file as `MAIL_PASSWORD`.
7. Put your actual Gmail address as the `MAIL_USERNAME` and `MAIL_FROM`.

> **Format:**  
> `MAIL_USERNAME=your.email@gmail.com`  
> `MAIL_PASSWORD=abcdefghijklmnop`

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
  - *The Gatekeeper.* Handles user registration, OTP verification, login (JWT token generation), and password resets.
- **`backend/app/api/routes/chat.py`** 💬
  - *The Conversational Engine.* Receives chat messages, delegates SQL generation to the LLM, validates the SQL, executes it against DuckDB, and returns the data and chart configuration to the user.
- **`backend/app/services/llm_service.py`** 🧠
  - *The AI Whisperer.* Constructs the specialized system prompts, injects the dataset schema, and calls the Groq API to generate accurate SQL queries.
- **`backend/app/services/file_loader.py`** 📂
  - *The Data Engine.* Loads uploaded CSV or Excel files straight into DuckDB's fast, in-memory analytical engine.
- **`backend/app/utils/mail.py`** ✉️
  - *The Mailman.* Uses SMTP to format and send HTML-styled verification emails containing OTPs.

### 🎨 Frontend (React + Vite + Tailwind)

- **`frontend/src/main.jsx` & `App.jsx`** ⚛️
  - *The Web Roots.* Mounts the React application to the DOM and sets up the global routing and context providers.
- **`frontend/src/pages/Dashboard.jsx`** 🎛️
  - *The Command Center.* The main user interface where the Sidebar, Upload Area, Chat Panel, and Charts all come together.
- **`frontend/src/components/chat/ChatPanel.jsx`** 💬
  - *The User Interface.* Renders the chat bubbles, handles user input, displays typing indicators, and manages the conversation history state.
- **`frontend/src/components/charts/PlotlyChart.jsx`** 📊
  - *The Visualizer.* Takes the JSON data and layout configurations returned by the backend and renders beautiful, interactive graphs using Plotly.js.
- **`frontend/src/context/UserContext.jsx`** 🔐
  - *The State Manager.* Globally manages user authentication, stores JWT tokens, manages profile avatar state, and handles session expiration and logouts across the application.
- **`frontend/src/components/layout/UserNavProfile.jsx`** 👤
  - *The Profile Navigation Component.* Renders the active user pill on the floating navbar, shows user info/actions, and supports smooth outside-click modal dismissal.
- **`frontend/src/components/shared/MainAppLoader.jsx` & `AppLoadingBar.jsx`** ⏳
  - *The Experience Engines.* Delivers a branded splash screen on initial startup and responsive full-screen blurred loaders during in-app section transitions.

---

## 🚀 Deployment

For a comprehensive guide on deploying this application (including the Vercel Monorepo setup or the Render Split Architecture), please see our dedicated [Deployment Guide](DEPLOYMENT.md).

<br/>

<div align="center">
  <i>Master your codebase and deploy with confidence! 🚀🌐</i>
</div>
