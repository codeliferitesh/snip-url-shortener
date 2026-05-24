# 🚀 Deployment Guide — Snip on Vercel

---

## Prerequisites

- Node.js 18+
- A [Firebase](https://console.firebase.google.com) account (free Spark tier is enough)
- A [Vercel](https://vercel.com) account (free Hobby tier works)
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm i -g firebase-tools`

---

## Step 1 — Firebase Project Setup

### 1.1 Create the Project

1. Go to https://console.firebase.google.com
2. Click **Add project** → give it a name (e.g. `snip-prod`)
3. Disable Google Analytics (not needed, saves cost)
4. Click **Create project**

### 1.2 Enable Authentication

1. In your project → **Build → Authentication**
2. Click **Get started**
3. **Sign-in method** tab:
   - Enable **Google** (add your support email)
   - Enable **Email/Password**

### 1.3 Enable Firestore

1. **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Pick the region closest to your users (e.g. `us-central`, `europe-west`)
5. Click **Enable**

### 1.4 Get Web App Config

1. **Project Settings** (gear icon) → **Your apps** → click **</>** (Web)
2. Register app with a nickname (e.g. `snip-web`)
3. Copy the `firebaseConfig` object — you'll need these values

---

## Step 2 — Deploy Firestore Rules & Indexes

```bash
# Login to Firebase CLI
firebase login

# Initialize in your project folder (select your project)
firebase use --add

# Deploy security rules and indexes
firebase deploy --only firestore
```

This sets up:
- **firestore.rules** — prevents unauthorized reads/writes
- **firestore.indexes.json** — optimizes query performance

---

## Step 3 — Deploy to Vercel

### Option A: Vercel CLI (fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# In your project root
vercel

# Follow prompts:
# - Link to existing project or create new
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist
```

### Option B: Vercel Dashboard (recommended for teams)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to https://vercel.com/new
3. Import your repository
4. Vercel auto-detects Vite — no build config needed
5. **Before deploying**, add environment variables (see Step 4)
6. Click **Deploy**

---

## Step 4 — Set Environment Variables in Vercel

In your Vercel project dashboard:

**Settings → Environment Variables**

Add each of these (use values from Step 1.4):

| Variable | Value |
|----------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `VITE_FIREBASE_APP_ID` | `1:123...` |
| `VITE_APP_URL` | `https://your-domain.vercel.app` |
| `VITE_APP_NAME` | `Snip` |

> ⚠️ Set these for **Production**, **Preview**, and **Development** environments.

After adding variables, trigger a **Redeploy** from the Vercel dashboard.

---

## Step 5 — Add Your Vercel Domain to Firebase Auth

Firebase blocks sign-in from unauthorized domains.

1. Firebase Console → **Authentication → Settings → Authorized domains**
2. Click **Add domain**
3. Add: `your-project.vercel.app`
4. Also add any custom domain you'll use

---

## Step 6 — Custom Domain (Optional)

### On Vercel:
1. **Project → Settings → Domains**
2. Add your domain (e.g. `snip.yourdomain.com`)
3. Copy the DNS records shown

### On your DNS provider:
Add the CNAME or A record that Vercel gives you.

### Back on Firebase Auth:
Add your custom domain to **Authorized domains**.

### Update env var:
Change `VITE_APP_URL` to `https://snip.yourdomain.com` and redeploy.

---

## Step 7 — Verify Everything Works

Test this checklist after deployment:

```
□ Landing page loads
□ Google Sign-in works
□ Email registration works
□ Dashboard loads after login
□ Create a short link
□ Copy the short URL and open it in a new tab
  → Should redirect to the original URL
□ Check analytics page shows the click
□ Dark/light mode toggle works
□ Mobile layout looks correct
```

---

## How Redirects Work

The app uses **client-side routing** for redirects (zero serverless cost):

```
User visits snip.app/abc123
        ↓
Vercel serves index.html (via vercel.json rewrite)
        ↓
React Router matches /:slug → RedirectPage component
        ↓
RedirectPage queries Firestore for slug "abc123"
        ↓
If found → window.location.href = originalUrl
         + writes analytics event (non-blocking)
```

**Why this is better than serverless functions:**
- 0 cold starts
- 0 function invocation cost
- Works entirely on Firebase free tier
- ~400ms redirect (fast enough for real use)

---

## Firestore Cost Estimates

| Traffic | Monthly Reads | Monthly Writes | Est. Cost |
|---------|--------------|----------------|-----------|
| 100 links, 1K clicks/day | ~3K (cached) | ~1K | **$0** |
| 1K links, 10K clicks/day | ~30K (cached) | ~10K | **$0** |
| 10K links, 100K clicks/day | ~300K | ~100K | **~$0.18** |

Firebase Spark (free) includes: 50K reads/day, 20K writes/day, 20K deletes/day.

The offline Firestore cache means dashboard reloads read from IndexedDB, not Firestore — dramatically cutting your read count.

---

## Production Checklist

```
□ Environment variables set in Vercel (not hardcoded)
□ Firestore rules deployed (firebase deploy --only firestore)
□ Authorized domain added to Firebase Auth
□ VITE_APP_URL set to production URL
□ Custom domain configured (if applicable)
□ Test redirect flow end-to-end
□ Test auth on production domain (not just localhost)
```

---

## Updating the App

Every push to your `main` branch auto-deploys on Vercel.

To update Firestore rules after changes:
```bash
firebase deploy --only firestore:rules
```

To update indexes:
```bash
firebase deploy --only firestore:indexes
```
