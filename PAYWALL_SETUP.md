# 🔐 Paywall Setup Guide

This guide explains how to set up the Stripe paywall for the Christmas Card application.

## Overview

The application now requires payment (£1.99) before sending cards. The flow is:

1. User fills form → clicks "Pay & Send Card (£1.99)"
2. Redirects to Stripe Checkout
3. After successful payment → card is sent via email
4. Session is marked as "completed" to prevent duplicate sends

---

## 🗄️ Supabase Setup

### 1. Create the Database Table

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE ecard_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  card_url TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_ecard_sessions_status ON ecard_sessions(status);
CREATE INDEX idx_ecard_sessions_stripe_session ON ecard_sessions(stripe_session_id);

-- Enable RLS
ALTER TABLE ecard_sessions ENABLE ROW LEVEL SECURITY;

-- Service role policy
CREATE POLICY "Service role can manage all sessions"
  ON ecard_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### 2. Get Supabase Credentials

From your Supabase project settings:
- **SUPABASE_URL**: Found in Settings → API → Project URL
- **SUPABASE_SERVICE_ROLE_KEY**: Found in Settings → API → service_role key (keep this secret!)

---

## 💳 Stripe Setup

### 1. Create Stripe Account

Go to [stripe.com](https://stripe.com) and create an account (or use existing).

### 2. Get API Keys

From Stripe Dashboard → Developers → API keys:
- **Test mode**: Use these for development
- **Live mode**: Use these for production (switch after testing)

You need:
- **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 3. Test the Integration

Use Stripe test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry date and any 3-digit CVC

---

## 🔧 Environment Variables

Create/update your `.env` file with:

```env
# Existing variables
RESEND_API_KEY=your_resend_api_key_here
PUBLIC_URL=https://your-domain.vercel.app

# New Supabase variables
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# New Stripe variable
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Public URL (used for Stripe redirect URLs)
NEXT_PUBLIC_URL=https://your-domain.vercel.app
```

### Vercel Deployment

Add these environment variables in Vercel Dashboard:

1. Go to your project → Settings → Environment Variables
2. Add each variable:
   - `RESEND_API_KEY`
   - `PUBLIC_URL`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_URL`
3. Make sure to select the right environment (Production, Preview, Development)
4. Redeploy your application

---

## 🧪 Testing Locally

### 1. Start Development Servers

```bash
npm run dev:full
```

This starts:
- Frontend: http://localhost:5173
- API: http://localhost:3000

### 2. Set Local Environment Variables

For local testing, use:
```env
NEXT_PUBLIC_URL=http://localhost:5173
PUBLIC_URL=http://localhost:5173
```

### 3. Test Flow

1. Go to http://localhost:5173
2. Fill out the form
3. Click "Pay & Send Card (£1.99)"
4. You'll be redirected to Stripe Checkout (test mode)
5. Use test card: `4242 4242 4242 4242`
6. After payment, you'll be redirected to `/success`
7. Card will be sent via email
8. Check Supabase to see the session marked as "completed"

---

## 🔒 Security Features

### Session Validation

The `/api/sendCard` endpoint now requires:
- A valid `sessionId` from Supabase
- Session status must be "pending"
- After sending, status is updated to "completed"

This prevents:
- ❌ Sending cards without payment
- ❌ Duplicate sends for the same payment
- ❌ Direct API calls bypassing Stripe

### Database Security

- Row Level Security (RLS) is enabled
- Only service role can access sessions
- API uses service_role key (never exposed to client)

---

## 🚀 Production Checklist

Before going live:

- [ ] Switch Stripe to **Live mode** keys
- [ ] Update `STRIPE_SECRET_KEY` to live key (`sk_live_...`)
- [ ] Update `NEXT_PUBLIC_URL` to production domain
- [ ] Update `PUBLIC_URL` to production domain
- [ ] Test complete flow with real payment (refund after testing)
- [ ] Verify emails are sent correctly
- [ ] Check Supabase sessions are created and updated
- [ ] Monitor Stripe Dashboard for payments

---

## 📊 Monitoring

### Stripe Dashboard

Monitor:
- Successful payments
- Failed payments
- Customer emails
- Payment amounts

### Supabase Dashboard

Check:
- `ecard_sessions` table for all sessions
- Filter by status: `pending` (unpaid) vs `completed` (paid & sent)
- Look for any stuck sessions

### Logs

Check Vercel logs for:
- API errors
- Email sending failures
- Stripe webhook issues (if you add them later)

---

## 🆘 Troubleshooting

### "Session ID required" error
- Payment wasn't completed
- Check Stripe Dashboard for payment status

### "Invalid session" error
- Session ID is incorrect or doesn't exist in database
- Check Supabase for the session record

### Card already sent
- Session status is already "completed"
- This is expected - prevents duplicate sends

### Stripe redirect fails
- Check `NEXT_PUBLIC_URL` is set correctly
- Verify URL matches your deployment domain

---

## 💡 Future Enhancements

Consider adding:
- **Stripe Webhooks** for real-time payment confirmation
- **Receipt emails** via Stripe
- **Refund handling** for failed email sends
- **Payment history** page for users
- **Promo codes** / discounts
- **Multiple pricing tiers** (e.g., animated cards, bulk sends)

---

## 📚 API Endpoints

### POST `/api/create-checkout`
Creates Stripe checkout session and Supabase record.

**Body:**
```json
{
  "recipientEmail": "friend@example.com",
  "recipientName": "John",
  "senderName": "You",
  "message": "Merry Christmas!" // optional
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### POST `/api/sendCard`
Sends email (requires valid paid session).

**Body:**
```json
{
  "sessionId": "uuid-from-supabase"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "resend-message-id",
  "cardUrl": "https://domain.com/card?..."
}
```

---

## 🎄 Done!

Your Christmas Card app now has a working paywall. Users must pay £0.99 before their card is sent.

For support, check:
- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
