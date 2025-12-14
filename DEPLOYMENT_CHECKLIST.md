# 🚀 Deployment Checklist - Paywall Update

## ⚠️ Important: You must redeploy to see the new changes

The error `No routes matched location "/success"` means you're testing on an old deployment without the new routes.

---

## 🔧 Before Deploying

### 1. Fix Applied:
- ✅ Stripe API version updated to `2025-11-17.clover`
- ✅ Price changed to £1.99
- ✅ All routes added (`/success`, `/cancel`)

### 2. Build Verified:
```bash
npm run build
# ✓ 51 modules transformed
# Build successful!
```

---

## 📋 Deployment Steps

### Option A: Deploy via Git (Recommended)

```bash
# 1. Add all changes
git add .

# 2. Commit
git commit -m "feat: add paywall with £1.99 pricing and Stripe integration"

# 3. Push to trigger Vercel deployment
git push
```

Vercel will automatically:
- Detect the changes
- Rebuild with new routes
- Deploy to production

### Option B: Deploy via Vercel CLI

```bash
# Deploy to production
vercel --prod
```

---

## 🔑 Environment Variables to Add in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these if not already set:

```
RESEND_API_KEY=re_xxx
PUBLIC_URL=https://your-domain.vercel.app
NEXT_PUBLIC_URL=https://your-domain.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
STRIPE_SECRET_KEY=sk_test_xxx (or sk_live_xxx for production)
```

**Important:** After adding environment variables, you must **redeploy** for them to take effect.

---

## ✅ Post-Deployment Testing

### 1. Test the Complete Flow:

```
1. Visit your deployed URL (e.g., https://your-app.vercel.app)
2. Fill out the card form
3. Click "Pay & Send Card (£1.99)"
4. Complete Stripe checkout with test card: 4242 4242 4242 4242
5. Should redirect to /success page ✅
6. Card should be sent via email ✅
7. Check Supabase for completed session ✅
```

### 2. Verify Routes Work:

- `https://your-app.vercel.app/` → Generator Page ✅
- `https://your-app.vercel.app/card?to=Test&from=You` → Card Page ✅
- `https://your-app.vercel.app/success?id=xxx` → Success Page ✅
- `https://your-app.vercel.app/cancel` → Cancel Page ✅

---

## 🐛 Troubleshooting

### Error: "No routes matched location /success"

**Cause:** Old deployment doesn't have new routes.

**Fix:**
1. Make sure you've pushed the latest code
2. Verify Vercel deployed the latest commit
3. Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
4. Check Vercel deployment logs for errors

### Error: "Session ID required"

**Cause:** Missing environment variables.

**Fix:**
1. Check all environment variables are set in Vercel
2. Redeploy after adding variables

### Error: Stripe API version mismatch

**Cause:** Old code with outdated API version.

**Fix:**
- ✅ Already fixed in `api/create-checkout.ts` line 6
- Make sure this change is deployed

### Email not sending

**Cause:** Missing RESEND_API_KEY or SUPABASE credentials.

**Fix:**
1. Verify `RESEND_API_KEY` is set
2. Verify Supabase credentials are correct
3. Check Vercel function logs for errors

---

## 📊 Monitoring After Deployment

### Check Vercel Logs:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click latest deployment
3. Check "Functions" tab for API errors

### Check Stripe Dashboard:
1. Go to Stripe Dashboard → Payments
2. Verify test payments appear
3. Check for any failed payments

### Check Supabase:
1. Go to Supabase Dashboard → Table Editor
2. Open `ecard_sessions` table
3. Verify sessions are created with status 'pending'
4. After payment, status should change to 'completed'

---

## 🎯 Quick Deploy Commands

```bash
# Full deployment sequence
git add .
git commit -m "feat: add paywall integration"
git push

# Or direct deploy
vercel --prod
```

---

## ✨ Success Criteria

After deployment, you should be able to:

- ✅ Fill form and click "Pay & Send Card (£1.99)"
- ✅ Redirect to Stripe checkout
- ✅ Complete payment with test card
- ✅ Redirect to `/success` page (not 404!)
- ✅ See success message
- ✅ Receive email with card link
- ✅ Preview card works
- ✅ Session marked as 'completed' in Supabase

---

## 🔄 Next Payment Test

For the next test:
1. Use the same test card: `4242 4242 4242 4242`
2. Fill a new form
3. Complete payment
4. Should work exactly the same ✅

---

## 📝 Notes

- Test mode Stripe charges don't create real charges
- You can test unlimited times with test cards
- Switch to live keys when ready for production
- Always test complete flow after any deployment

---

🎄 **Ready to deploy!** Push your code and the routes will work.
