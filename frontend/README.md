<div align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=28&pause=1000&color=0071E3&center=true&vCenter=true&width=800&lines=Frontend+Interface;React+%2B+Vite+%2B+Tailwind+CSS" alt="Typing SVG" />
</div>

# 🎨 AI Data Analysis — Frontend

The React (Vite) frontend for the AI Data Analysis application. A macOS-inspired glassmorphism Studio workspace for uploading datasets, exploring them visually, and chatting with an AI assistant powered by Groq Llama 3.3 70B.

## 🗂️ Directory Structure

- `src/pages/` — 🏠 Main pages (`LandingPage.jsx`, `Dashboard.jsx`, `Auth.jsx`, `Admin.jsx`, `AdminAuth.jsx`, `Docs.jsx`, `FaqPage.jsx`, `Terms.jsx`, `PrivacyPolicy.jsx`)
- `src/components/chat/` — 💬 AI Chat Interface, message bubbles, and typing indicators
- `src/components/charts/` — 📈 Plotly charting components and SQL viewers
- `src/components/explore/` — 🔍 Manual data exploration panels
- `src/components/sql-editor/` — 💻 Multi-table SQL code editor with syntax execution
- `src/components/profile/` — 👤 User account and avatar management
- `src/components/upload/` — ☁️ Multi-format drag-and-drop file upload zone
- `src/components/layout/` — 🏗️ Sidebar, Header, UserNavProfile dropdown, and Dynamic Scroll-Squeezing Navbars
- `src/components/shared/` — ⏳ `MainAppLoader` (tri-orbital quantum reactor, frequency bars, laser progress beam), `CardSkeleton` & shimmer states, `NetworkStatusBadge`, `AppLoadingBar`
- `src/components/AnimatedThemeToggler.jsx` — 🌓 Native View Transitions API theme toggle (7 geometric shapes)
- `src/components/ThemeToggle.jsx` — 🌓 Styled dark/light mode toggle wrapper
- `src/context/` — 🧠 React Context (`DatasetContext`, `UserContext`)
- `src/hooks/` — 🪝 `useDarkMode.js`, `useNetworkStatus.js` (live ping & latency), `useOtpCountdown.js`
- `src/services/` — 🔌 Axios API communication layer

## 🖼️ Static Assets (`public/assets/`)

| File | Usage |
| --- | --- |
| `Assistant-Bot.svg` | Hero section AI bot illustration — brand-styled with `#0071e3` (Apple blue LEDs), `#005bb5` (arm depth), `#1a2332` (deep navy body), `#eef5ff` (icy panel backgrounds) |
| `img1.webp` | Workflow step 1 — Data Ingestion screenshot |
| `img2.webp` | Workflow step 2 — Ask, Explore & Visualize screenshot |
| `img3.webp` | Workflow step 3 — Decide, Export & Share screenshot |
| `cta_data_topography.webp` | CTA section topographic data background (dark mode) |
| `cta_data_topography_light.webp` | CTA section topographic data background (light mode) |

## 🌟 Key UI Architecture

- 🤖 **Hero Assistant-Bot Illustration**: Pure SVG vector bot (`Assistant-Bot.svg`) fully styled with the platform's brand color palette — deep navy body (`#1a2332`), Apple blue LED screen (`#0071e3`), deep blue arm/hand accents (`#005bb5`), icy blue-white data panels (`#eef5ff`, `#bfdbfe`). Suspended perfectly still in the hero section with ambient radial backglow and elevated drop-shadows.
- 🌀 **Futuristic Splash Loader (`MainAppLoader.jsx`)**: Tri-orbital quantum reactor with alternating rotational arcs, satellite node, neural data frequency bars, unboxed floating favicon with ambient drop-shadow, and a minimum 3-second brand intro.
- 🧭 **Dynamic Scroll-Squeezing Navigation**: Starts full-screen width at the top (`scrollY === 0`) and smoothly squeezes into a floating frosted glass pill on scroll across the Home page and all legal/documentation pages (`/terms`, `/privacy`, `/docs`, `/faq`).
- 🎯 **Centered Hero Headers**: Clean, unified centered hero banners on all footer redirect pages with unclipped cursive typography (`font-kaushan`).
- 🔐 **Admin Access**: Dedicated Admin Portal at [http://localhost:5173/admin](http://localhost:5173/admin) — Demo login: `admin@demo.com` / `admin123`.

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
