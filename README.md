# ⚡ Snip — URL Shortener

A production-ready URL shortener built with React + Vite, Firebase, and Tailwind CSS.

## Stack

| Layer       | Tech                              |
|-------------|-----------------------------------|
| Frontend    | React 18 + Vite + TypeScript      |
| Styling     | Tailwind CSS + Framer Motion      |
| Auth        | Firebase Authentication           |
| Database    | Firestore (with offline cache)    |
| State       | Zustand                           |
| Charts      | Recharts                          |
| QR Codes    | qrcode.react                      |
| Slug Gen    | NanoID                            |
| Deployment  | Vercel (primary) / Firebase Hosting|

---

## Features

- ✅ Google + Email/Password authentication
- ✅ Shorten any URL instantly
- ✅ Custom slugs with validation
- ✅ QR code generation per link
- ✅ Click analytics with charts
- ✅ Device / browser / OS tracking
- ✅ Link expiration dates
- ✅ Password-protected links
- ✅ Real-time dashboard updates
- ✅ Search & filter links
- ✅ Dark / light mode
- ✅ PWA installable
- ✅ Mobile-first responsive UI
- ✅ Firestore offline persistence (reduces reads = lower cost)

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd url-shortener
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Sign-in methods → Google + Email/Password
4. Enable **Firestore Database** → Start in production mode
5. Go to Project Settings → Your apps → Add Web app
6. Copy the config values

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your Firebase config values in `.env.local`.

### 4. Deploy Firestore Rules & Indexes

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # select your project
firebase deploy --only firestore
```

### 5. Run Locally

```bash
npm run dev
```

---

## Vercel Deployment

See **DEPLOY.md** for the complete step-by-step guide.

---

## Folder Structure

```
src/
├── components/
│   ├── ui/              # Reusable primitives (Spinner, etc.)
│   ├── layout/          # Navbar, Footer
│   ├── dashboard/       # LinkCard, UrlShortenerForm, StatsCard, etc.
│   └── analytics/       # Chart wrappers
├── pages/               # Route-level components (lazy loaded)
├── store/               # Zustand stores (auth, links, theme)
├── lib/
│   ├── firebase.ts      # Firebase init
│   ├── firestore.ts     # All DB operations
│   └── utils.ts         # URL validation, slug gen, helpers
├── types/               # TypeScript interfaces
└── styles/              # Global CSS + CSS variables
```

---

## Cost Optimization

| Strategy | Saving |
|----------|--------|
| Firestore offline persistence | Avoids repeat reads on re-render |
| Denormalized `totalClicks` counter | Dashboard needs 0 analytics reads |
| `limit(500)` on analytics queries | Caps unbounded reads |
| Real-time listener on links | 1 open listener vs polling |
| NanoID slugs (no server roundtrip) | 0 Cloud Function calls |
| Client-side redirect resolution | 0 serverless executions |

**Estimated Firebase cost for 1,000 DAU: ~$0/month** (well within free Spark tier)

---

## Security

- Firestore rules: users can only read/write their own links
- URL validation blocks localhost, private IPs, and non-HTTP protocols
- Client-side rate limiter: 10 links/minute per session
- Reserved slug list prevents route conflicts
- Password-protected links with client-side comparison
- Environment variables never committed to git

---

## License

MIT
