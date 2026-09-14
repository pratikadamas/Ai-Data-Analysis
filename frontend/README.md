<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=28&pause=1000&color=EC4899&center=true&vCenter=true&width=800&lines=Frontend+Interface;React+%2B+Vite+%2B+Tailwind" alt="Typing SVG" />
</div>

# 🎨 AI Data Analysis - Frontend

This is the React (Vite) frontend for the AI Data Analysis application. It provides a beautiful, modern, glassmorphism-inspired UI to upload datasets, explore them manually, and chat with your data using an AI assistant.

## 🗂️ Directory Structure

- `src/pages/`: 🏠 Main pages (`LandingPage.jsx`, `Dashboard.jsx`, `Auth.jsx`, `Admin.jsx`, `AdminAuth.jsx`, `Docs.jsx`, `FaqPage.jsx`, `Terms.jsx`, `PrivacyPolicy.jsx`)
- `src/components/chat/`: 💬 AI Chat Interface, message bubbles, and typing indicators
- `src/components/charts/`: 📈 Plotly charting components and SQL viewers
- `src/components/explore/`: 🔍 Manual data exploration panels
- `src/components/sql-editor/`: 💻 Multi-table SQL code editor with syntax execution
- `src/components/profile/`: 👤 User account and avatar management
- `src/components/upload/`: ☁️ Multi-format drag-and-drop file upload zone
- `src/components/layout/`: 🏗️ Sidebar, Header, UserNavProfile dropdown, and Dynamic Scroll-Squeezing Navbars
- `src/components/shared/`: ⏳ MainAppLoader (Tri-orbital quantum reactor, frequency equalizer bars, and laser progress beam), Responsive CardSkeleton & shimmers, NetworkStatusBadge, and AppLoadingBar
- `src/components/AnimatedThemeToggler.tsx`: 🌓 Native View Transitions API theme toggle (7 geometric shapes)
- `src/components/ThemeToggle.jsx`: 🌓 Styled dark/light mode toggle wrapper
- `src/context/`: 🧠 React Context (`DatasetContext`, `UserContext`)
- `src/hooks/`: 🪝 `useDarkMode.js`, `useNetworkStatus.js` (live ping & latency), `useOtpCountdown.js`
- `src/lib/`: 🛠️ `utils.ts` / `utils.js` (Type-safe iterative class combiner function)
- `src/services/`: 🔌 Axios API communication layer

## 🌟 Key UI Architecture

- 🌀 **Futuristic Splash Loader (`MainAppLoader.jsx`)**: Tri-orbital quantum reactor with alternating rotational arcs, satellite node, neural data frequency bars, unboxed floating favicon with ambient drop-shadow, and a minimum 3-second brand intro.
- 🧭 **Dynamic Scroll-Squeezing Navigation**: Starts full-screen width at the top (`scrollY === 0`) and smoothly squeezes into a floating frosted glass pill on scroll across the Home page and all legal/documentation pages (`/terms`, `/privacy`, `/docs`, `/faq`).
- 🎯 **Centered Hero Headers**: Clean, unified centered hero banners on all footer redirect pages with unclipped cursive typography (`font-kaushan`).
- 🔐 **Admin Access**: Dedicated Admin Portal at [http://localhost:5173/admin](http://localhost:5173/admin) with quick login credentials `admin@demo.com` / `admin123`.

## 🛠️ Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build
```

> 💡 The Vite server automatically proxies `/api` requests to the FastAPI backend on `http://127.0.0.1:8000`. Make sure the backend server is running simultaneously!

<br/>

<div align="center">
  <i>Delivering a beautiful, glassmorphism-inspired analytical experience! 🎨✨</i>
</div>
