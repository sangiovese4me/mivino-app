# MiVino - Personal Wine Cellar App

A beautiful Next.js wine cellar management app with AI-powered wine information.

## Files in this project

```
mivino-app/
├── package.json # Dependencies & scripts
├── next.config.js # Next.js configuration
├── MiVinoApp.jsx # Main wine cellar component
├── pages/
│ ├── _app.js # Next.js app wrapper
│ ├── _document.js # HTML setup
│ └── index.js # Entry point
├── api/
│ ├── scan-label.js # Wine label scanning endpoint
│ └── wine-info.js # AI wine information endpoint
└── .gitignore
```

## Setup Instructions

### 1. Create your project folder
```bash
mkdir mivino-app
cd mivino-app
```

### 2. Add all the files from this download

Place each file in the correct location as shown above.

### 3. Install dependencies
```bash
npm install
```

### 4. Create the API routes

You need to create the API endpoints. Create these files:

**pages/api/scan-label.js** (for wine label OCR)
**pages/api/wine-info.js** (for AI wine information)

These should connect to your backend services (Claude API, vision APIs, etc.)

### 5. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## Features

- 🍷 Add wines manually or scan labels with your camera
- 🤖 AI-powered wine information (tasting notes, food pairings, peak drinking window)
- 📊 Track your wine collection with prices and inventory
- 🎨 Beautiful, responsive UI
- 💾 Data persists in localStorage

## Notes

- Authentication is client-side only (demo mode - not production-ready)
- You'll need to implement the API routes to fetch wine data
- Requires a camera for label scanning feature
