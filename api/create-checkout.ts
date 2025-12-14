import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recipientEmail, recipientName, senderName, message } = req.body;

    // Validation
    if (!recipientEmail || !recipientName || !senderName) {
      return res.status(400).json({
        error: 'Missing required fields: recipientEmail, recipientName, and senderName',
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Create session record in Supabase
    const { data: sessionRecord, error: dbError } = await supabase
      .from('ecard_sessions')
      .insert({
        payload: {
          recipientEmail,
          recipientName,
          senderName,
          message: message || '',
        },
        status: 'pending',
      })
      .select()
      .single();

    if (dbError || !sessionRecord) {
      console.error('Supabase error:', dbError);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.PUBLIC_URL || 'http://localhost:5173';

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Gesture Christmas Card',
              description: 'A magical, interactive Christmas e-card with hand gesture controls',
            },
            unit_amount: 199, // £1.99 in pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/?session_id={CHECKOUT_SESSION_ID}&id=${sessionRecord.id}`,
      cancel_url: `${baseUrl}/?cancelled=true`,
      metadata: {
        ecard_session_id: sessionRecord.id,
      },
    });

    // Update record with Stripe session ID
    await supabase
      .from('ecard_sessions')
      .update({ stripe_session_id: checkoutSession.id })
      .eq('id', sessionRecord.id);

    return res.status(200).json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
