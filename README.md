# 🎄 Gesture-Controlled Particle Christmas Tree

An interactive digital Christmas card where a Christmas tree is **created and animated using hand gestures**.
Your hands don't click buttons — they *bring the tree to life*.

Now you can **send personalized cards** to anyone via email!

---

## What it is

This project is a **gesture-controlled particle system** that transforms into a Christmas tree, packaged as a **sendable digital card**.

- Open palm → particles float freely
- Closed fist → particles converge into a Christmas tree
- Subtle hand movement → organic, living motion
- **Personalized messages** → sent via email with custom greetings

No controllers. No clicks.
Just your hands (or auto-play if camera isn't available).

---

## Features

### For Senders (/)
- Simple form to create and send personalized cards
- Recipients get a beautiful email with a link to their card
- Add custom messages and your name

### For Recipients (/card)
- Interactive gesture-controlled experience
- Personalized greeting with sender's message
- **Automatic fallback mode** if camera is unavailable
- Works on all devices (desktop & mobile)

### Technical Highlights
- Real-time **hand gesture detection via webcam** (MediaPipe)
- **3D particle system** with 1800+ particles (5 types: leaves, gifts, canes, rings, star)
- Smooth transitions between chaos ↔ structure
- **Camera fallback**: Auto-play animation if camera fails
- **Email delivery** via Resend API
- Vercel-ready serverless architecture

---

## Quick Start

### Local Development

**Prerequisites:** Node.js 20.x or later

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables** in `.env`:
   ```env
   RESEND_API_KEY=your_resend_api_key_here
   PUBLIC_URL=https://christmas-tree-jade.vercel.app
   ```
   - Get your free API key at [resend.com](https://resend.com)
   - Set `PUBLIC_URL` to your deployment URL (even for local dev, so email links work correctly)

3. **Run the development server:**
   ```bash
   npm run dev:full
   ```
   This starts both:
   - Frontend (Vite): http://localhost:5173 with hot reload
   - Backend (Vercel): http://localhost:3000 for API

4. **Test the app:**
   - Open: http://localhost:5173
   - Generator page: http://localhost:5173/
   - Card viewer: http://localhost:5173/card?to=Friend&from=You&msg=Hello

   **First time:** Vercel CLI will prompt you to login (free, takes 30 seconds)

   **See [LOCAL_DEV_GUIDE.md](LOCAL_DEV_GUIDE.md) for detailed development setup**

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

---

## How It Works

### Gesture Detection
- **TREE** - Closed fist → forms Christmas tree
- **SCATTER** - Open hand → particles scatter
- **POINTING** - Index finger → swipe to close card
- **Fallback** - Auto-cycles if camera unavailable

### Routes
- `/` - Card generator (send form)
- `/card?to=Name&from=Sender&msg=Message` - Card viewer

### API
- `POST /api/sendCard` - Send card via email

---

## Deployment to Vercel

**Quick Deploy:**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Import to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will auto-detect the configuration

3. **Add environment variables** in Vercel Dashboard:
   - `RESEND_API_KEY` = `your_resend_api_key`
   - `PUBLIC_URL` = `https://your-project.vercel.app`

4. **Deploy!**

**Email Configuration:**
- The sender email is set to `Magic Tree <xmas@ruqilabs.com>` in `api/sendCard.ts`
- For production, verify your domain at [resend.com](https://resend.com)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions and troubleshooting.

---

## Why This Exists

Most digital cards are static.
This one feels *alive*.

It's designed to:
- Turn a greeting into an interactive moment
- Feel magical without complex instructions
- Work reliably (even without camera)
- Be easily shareable

Perfect for:
- Digital Christmas cards
- Interactive greetings
- Gesture-based creative experiments
- Personal holiday messages

---

## Browser Compatibility

- ✅ Chrome/Edge (desktop & mobile)
- ✅ Safari (desktop & mobile)
- ✅ Firefox (desktop)
- ⚠️ Camera requires HTTPS (automatic on Vercel)
- ✅ Fallback mode ensures compatibility everywhere

---

Made with curiosity, patience, and too many late-night particle tweaks ❄️

*Now with the ability to spread holiday cheer at scale* 🎁


