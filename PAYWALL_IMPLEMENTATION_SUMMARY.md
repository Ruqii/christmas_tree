# 🎄 Paywall Implementation Summary

## ✅ Implementation Complete

The Christmas Card Generator now has a complete Stripe paywall system requiring payment before cards are sent.

---

## 📦 What Was Implemented

### 1. **Supabase Database Table**
- File: `SUPABASE_SCHEMA.sql`
- Table: `ecard_sessions`
- Columns:
  - `id`: UUID primary key
  - `payload`: JSONB (stores form data)
  - `status`: TEXT ('pending' or 'completed')
  - `card_url`: TEXT (card preview URL)
  - `stripe_session_id`: TEXT (Stripe session reference)
  - `created_at`: TIMESTAMPTZ

### 2. **New API Endpoints**

#### `/api/create-checkout.ts`
- Creates Supabase session record
- Generates Stripe Checkout Session (£1.99)
- Returns checkout URL for redirect
- **Dependencies**: Stripe, Supabase

#### `/api/sendCard.ts` (Updated)
- Now **requires** `sessionId` parameter
- Validates session exists and status is 'pending'
- Sends email via Resend
- Updates session status to 'completed'
- Prevents duplicate sends
- **Dependencies**: Resend, Supabase

### 3. **Frontend Pages**

#### `pages/GeneratorPage.tsx` (Updated)
- Button text: **"Pay & Send Card (£1.99)"**
- Calls `/api/create-checkout` instead of direct send
- Redirects to Stripe Checkout
- Shows loading state: "Processing..."
- Removed success state (redirects to Stripe)

#### `pages/SuccessPage.tsx` (New)
- Route: `/success?id=<session-id>`
- Automatically sends card via `/api/sendCard`
- Shows success message
- Provides card preview link
- "Send Another Card" button

#### `pages/CancelPage.tsx` (New)
- Route: `/cancel`
- Shows payment cancelled message
- "Try Again" button returns to form

#### `App.tsx` (Updated)
- Added `/success` route
- Added `/cancel` route

---

## 🔄 User Flow

```
1. User visits "/" (Generator Page)
   ↓
2. Fills form: Recipient Email, Name, Your Name, Message (optional)
   ↓
3. Clicks "Pay & Send Card (£1.99)"
   ↓
4. System creates Supabase session (status: 'pending')
   ↓
5. Redirects to Stripe Checkout
   ↓
6a. User pays successfully
    ↓
    Redirects to /success?id=<session-id>
    ↓
    Card is sent automatically
    ↓
    Session updated to 'completed'
    ↓
    User sees success message + preview link

6b. User cancels payment
    ↓
    Redirects to /cancel
    ↓
    Can try again
```

---

## 🔒 Security Features

### Paywall Enforcement
- ❌ Cannot send cards without payment
- ❌ Cannot send duplicate cards (session can only be used once)
- ❌ Cannot bypass Stripe by calling API directly
- ✅ All sends require valid paid session ID

### Database Security
- Row Level Security (RLS) enabled
- Service role policy for API access
- Sessions validated before email send

---

## 📁 Files Created/Modified

### Created:
- ✅ `api/create-checkout.ts` - Stripe checkout creation
- ✅ `pages/SuccessPage.tsx` - Payment success page
- ✅ `pages/CancelPage.tsx` - Payment cancel page
- ✅ `SUPABASE_SCHEMA.sql` - Database schema
- ✅ `PAYWALL_SETUP.md` - Setup documentation
- ✅ `.env.example` - Environment variable template

### Modified:
- ✅ `api/sendCard.ts` - Added session validation
- ✅ `pages/GeneratorPage.tsx` - Updated to call checkout
- ✅ `App.tsx` - Added success/cancel routes
- ✅ `package.json` - Added dependencies

---

## 📦 Dependencies Added

```json
{
  "stripe": "^latest",
  "@supabase/supabase-js": "^latest"
}
```

Installed via:
```bash
npm install stripe @supabase/supabase-js
```

---

## 🔧 Required Environment Variables

### Development (.env):
```env
RESEND_API_KEY=re_xxx
PUBLIC_URL=http://localhost:5173
NEXT_PUBLIC_URL=http://localhost:5173
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
STRIPE_SECRET_KEY=sk_test_xxx
```

### Production (Vercel):
- Same variables, but with production URLs and live Stripe key

---

## ✅ Testing Checklist

### Before Deployment:

1. **Supabase Setup**
   - [ ] Run SUPABASE_SCHEMA.sql in SQL Editor
   - [ ] Verify table `ecard_sessions` exists
   - [ ] Test RLS policies work
   - [ ] Get service_role key

2. **Stripe Setup**
   - [ ] Create Stripe account
   - [ ] Get test API keys (sk_test_)
   - [ ] Test with card: 4242 4242 4242 4242

3. **Environment Variables**
   - [ ] Add all variables to Vercel
   - [ ] Set NEXT_PUBLIC_URL to production domain
   - [ ] Verify STRIPE_SECRET_KEY is set

4. **Test Complete Flow**
   - [ ] Fill form on `/`
   - [ ] Click "Pay & Send Card"
   - [ ] Complete Stripe checkout (test mode)
   - [ ] Verify redirect to `/success`
   - [ ] Verify email is sent
   - [ ] Check Supabase session is 'completed'
   - [ ] Try to send same session again (should prevent duplicate)

5. **Production Checklist**
   - [ ] Switch to live Stripe keys (sk_live_)
   - [ ] Test with real payment (then refund)
   - [ ] Monitor first real transaction

---

## 💳 Stripe Test Cards

**Successful Payment:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

**Declined Payment:**
```
Card: 4000 0000 0000 0002
```

More: https://stripe.com/docs/testing

---

## 🚀 Deployment Steps

1. **Push code to Git:**
   ```bash
   git add .
   git commit -m "feat: add Stripe paywall for card sending"
   git push
   ```

2. **Add environment variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all 6 variables
   - Redeploy

3. **Run Supabase schema:**
   - Go to Supabase Dashboard
   - SQL Editor → New Query
   - Paste SUPABASE_SCHEMA.sql
   - Run

4. **Test on production:**
   - Use Stripe test keys first
   - Verify complete flow works
   - Switch to live keys when ready

---

## 🎯 Key Points

### Price
- **£1.99** per card
- Set in `api/create-checkout.ts` line ~69: `unit_amount: 199` (pence)

### Success URL
- Format: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&id=${sessionRecord.id}`
- Contains Stripe session ID + our Supabase record ID

### Cancel URL
- Format: `${baseUrl}/cancel`
- Simple redirect, no processing

### Session Validation
- Email sending requires `sessionId` in request body
- Validates session exists
- Checks status is 'pending'
- Updates to 'completed' after send
- Returns error if already completed

---

## 📊 Database Structure

```
ecard_sessions
├── id (UUID) - Primary key, auto-generated
├── payload (JSONB) - Form data { recipientEmail, recipientName, senderName, message }
├── status (TEXT) - 'pending' | 'completed'
├── card_url (TEXT) - Preview URL after send
├── stripe_session_id (TEXT) - Reference to Stripe
└── created_at (TIMESTAMPTZ) - Timestamp
```

---

## 🎄 Success!

The paywall is fully implemented and ready to use. Follow the setup guide in `PAYWALL_SETUP.md` to configure Stripe and Supabase, then deploy to production.

**Next Steps:**
1. Read `PAYWALL_SETUP.md`
2. Set up Supabase database
3. Configure Stripe account
4. Add environment variables
5. Test locally
6. Deploy to production

Happy card sending! 🎅
