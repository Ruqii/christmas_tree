# 🛠️ Local Development Guide

## Problem Fixed: Vite + Vercel Dev Conflict

The `rewrites` rule needed for production SPA routing was breaking local development with `vercel dev`.

**Solution:** Separate frontend and backend development servers.

---

## 🚀 Quick Start (Recommended)

### Option 1: Full Stack Development (Both Frontend + API)

```bash
npm run dev:full
```

This starts:
- ✅ **Frontend**: Vite dev server on port 5173 (with hot reload)
- ✅ **Backend**: Vercel dev on port 3000 (API functions)
- ✅ **Proxy**: Vite automatically forwards `/api` requests to port 3000

**Access:**
- Frontend: http://localhost:5173
- API: http://localhost:3000/api/sendCard (proxied via frontend)

**Use this when:** You need to test both the UI and email sending功能.

---

### Option 2: Frontend Only

```bash
npm run dev
```

- ✅ Frontend on port 5173
- ❌ API won't work (email sending will fail)

**Use this when:** You're only working on UI/styling and don't need the API.

---

### Option 3: Backend Only (API Testing)

```bash
npm run dev:api
```

- ✅ API on port 3000
- ❌ No frontend

**Use this when:** You're testing the API directly with curl/Postman.

**Test API:**
```bash
curl -X POST http://localhost:3000/api/sendCard \
  -H "Content-Type: application/json" \
  -d '{"recipientEmail":"test@example.com","senderName":"Test","message":"Hello"}'
```

---

## 📋 Scripts Reference

| Command | What It Does | Ports | Use Case |
|---------|-------------|-------|----------|
| `npm run dev` | Frontend only (Vite) | 5173 | UI development |
| `npm run dev:api` | Backend only (Vercel) | 3000 | API testing |
| `npm run dev:full` | Both together | 5173 + 3000 | Full stack dev |
| `npm start` | ⚠️ Old command (broken) | 3000 | Don't use |
| `npm run build` | Build for production | - | Before deploy |

---

## 🔧 How It Works

### Development Setup

```
┌─────────────────────────────────────┐
│  Browser: http://localhost:5173    │
└──────────────┬──────────────────────┘
               │
               ├─ /             ─────> Vite Dev Server (React app)
               ├─ /card        ─────> Vite Dev Server (React Router)
               └─ /api/sendCard ────> Proxied to localhost:3000
                                          │
                                          ▼
                                   Vercel Dev Server
                                   (Serverless Functions)
```

### Production Setup

```
┌─────────────────────────────────────┐
│  Browser: https://your-app.vercel.app │
└──────────────┬──────────────────────┘
               │
               ├─ /             ─────> Static Files (Vite build)
               ├─ /card        ─────> index.html (rewrites)
               └─ /api/sendCard ────> Serverless Function
```

---

## 🛑 What Changed?

### Before (Broken)

```bash
npm start
# Started vercel dev on port 3000
# Applied rewrites rule
# Confused Vite's HTML parsing
# ❌ Error: Failed to parse source for import analysis
```

### After (Fixed)

```bash
npm run dev:full
# Frontend: Vite on port 5173 (handles SPA routing)
# Backend: Vercel on port 3000 (handles API)
# Proxy: Connects them together
# ✅ Everything works
```

---

## 🔍 Why The Split?

### The Problem

`vercel dev` applies the `rewrites` rule from `vercel.json` during local development. This rewrites all non-API requests to `/index.html`, which confuses Vite when it tries to serve the actual `index.html` file.

### The Solution

- **Vite** handles the frontend (port 5173)
  - Already supports SPA routing out of the box
  - Hot module reload works
  - No rewrites needed

- **Vercel Dev** handles the API (port 3000)
  - Emulates serverless functions
  - Loads environment variables
  - No frontend serving

- **Vite Proxy** connects them
  - Forwards `/api/*` requests to port 3000
  - Seamless integration

---

## ⚙️ Configuration Files

### `vite.config.ts`

```typescript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // Forward to Vercel dev
        changeOrigin: true,
      },
    },
  },
});
```

### `vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

**Note:** Rewrites ONLY apply in production, not during `npm run dev`.

---

## 🧪 Testing Workflow

### 1. Start Development Server

```bash
npm run dev:full
```

Wait for both servers to start:
```
✓ Vite ready at http://localhost:5173
✓ Vercel dev running on http://localhost:3000
```

### 2. Test Frontend

Visit: http://localhost:5173

- ✅ Form page should load
- ✅ Can navigate to /card
- ✅ React hot reload works

### 3. Test API Integration

1. Fill out the form on http://localhost:5173
2. Click "Send Card"
3. Check console for success/errors
4. Check your email

### 4. Test API Directly

```bash
curl -X POST http://localhost:5173/api/sendCard \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "your@email.com",
    "senderName": "Test Sender",
    "message": "Test message"
  }'
```

**Note:** Use port 5173 (not 3000) - the proxy will forward it.

---

## 🐛 Troubleshooting

### Port Already in Use

**Error:** `Port 5173 is already in use`

**Solution:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill

# Or use different port
npm run dev -- --port 5174
```

### API Not Working

**Check:**
1. Is Vercel dev running? (port 3000)
   ```bash
   lsof -i:3000
   ```

2. Are environment variables loaded?
   ```bash
   cat .env
   # Should show RESEND_API_KEY
   ```

3. Is the proxy configured?
   ```bash
   cat vite.config.ts | grep -A5 proxy
   ```

### Vite Parse Error (Old Problem)

**Error:** `Failed to parse source for import analysis`

**Cause:** Running `npm start` instead of `npm run dev:full`

**Solution:** Use `npm run dev:full` instead

---

## 📦 Production Build

### Build Locally

```bash
npm run build
```

Output: `dist/` folder with optimized files

### Test Production Build Locally

```bash
npm run preview
```

Visit: http://localhost:4173

**Note:** API won't work in preview mode (use `vercel dev` for API testing)

---

## 🚀 Deploy to Production

### Automatic Deploy (Recommended)

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will automatically:
1. Build the project (`npm run build`)
2. Deploy to production
3. Apply rewrites for SPA routing

### Manual Deploy

```bash
vercel --prod
```

---

## 📝 Summary

**For Local Development:**
- Use `npm run dev:full` for full stack
- Frontend on 5173, API on 3000
- Vite proxy connects them

**For Production:**
- `vercel.json` rewrites handle SPA routing
- All routes work correctly
- No Vite parse errors

**Don't Use:**
- ❌ `npm start` - broken by rewrites
- ❌ `vercel dev` alone - same issue

✅ **Use `npm run dev:full` instead!**
