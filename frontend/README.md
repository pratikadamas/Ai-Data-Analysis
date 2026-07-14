# 🎨 AI Data Analyst - Frontend

This is the React (Vite) frontend for the AI Data Analyst application. It provides a beautiful, modern, glassmorphism-inspired UI to upload datasets, explore them manually, and chat with your data using an AI assistant.

## 🗂️ Directory Structure

- `src/components/chat/`: 💬 AI Chat Interface, message bubbles, and typing indicators
- `src/components/charts/`: 📈 Plotly charting components and SQL viewers
- `src/components/explore/`: 🔍 Manual data exploration panels
- `src/components/upload/`: ☁️ Drag-and-drop file upload zone
- `src/components/layout/`: 🏗️ Sidebar, Headers, and common layout wrapper
- `src/context/`: 🧠 React Context for managing application state globally

## 🛠️ Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

> 💡 The Vite server automatically proxies `/api` requests to the backend on `localhost:8000`. Make sure the backend is running simultaneously!
