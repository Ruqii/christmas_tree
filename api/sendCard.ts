import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.body;

    // Require sessionId for paywall
    if (!sessionId) {
      return res.status(403).json({ error: 'Session ID required' });
    }

    // Validate session from Supabase
    const { data: session, error: dbError } = await supabase
      .from('ecard_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (dbError || !session) {
      return res.status(404).json({ error: 'Invalid session' });
    }

    if (session.status === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Card already sent',
        alreadySent: true,
      });
    }

    // Extract payload
    const { recipientEmail, recipientName, senderName, message, photoUrls } = session.payload;

    // Basic validation
    if (!recipientEmail || !recipientName || !senderName) {
      return res.status(400).json({
        error: 'Missing required fields: recipientEmail, recipientName, and senderName are required',
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Sanitize inputs (basic)
    const sanitizedRecipientName = recipientName.trim().slice(0, 100);
    const sanitizedSenderName = senderName.trim().slice(0, 100);
    const sanitizedMessage = message ? message.trim().slice(0, 500) : '';

    // Get the base URL - use PUBLIC_URL env var if set, otherwise use request host
    const baseUrl = process.env.PUBLIC_URL || (() => {
      const host = req.headers.host || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      return `${protocol}://${host}`;
    })();

    // Build card URL with parameters
    const urlParams = new URLSearchParams({
      to: sanitizedRecipientName,
      from: sanitizedSenderName,
    });

    // Only add message if it exists
    if (sanitizedMessage) {
      urlParams.append('msg', sanitizedMessage);
    }

    // Add photos if exist (as URL hash to avoid length limits)
    let cardUrl = `${baseUrl}/card?${urlParams}`;
    if (Array.isArray(photoUrls) && photoUrls.length > 0) {
      cardUrl += `#photos=${encodeURIComponent(photoUrls.join(','))}`;
    }

    // Background image URL - use base URL
    const bgImageUrl = `${baseUrl}/email-assets/email-bg.jpg`;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Magic Tree <xmas@ruqilabs.com>',
      to: recipientEmail,
      subject: "You've received a Christmas card 🎄",
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <!--[if mso]>
            <style type="text/css">
              body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
            </style>
            <![endif]-->
          </head>
          <body style="margin: 0; padding: 0; background-color: #1a1a2e; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">

            <!-- Full-Page Background Wrapper -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0; padding: 0; background-color: #1a1a2e; background-image: url('${bgImageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat; min-height: 100vh;">
              <tr>
                <td align="center" style="padding: 60px 20px;">

                  <!-- White Content Container -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; background-color: rgba(255, 255, 255, 0.82); border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);">
                    <tr>
                      <td style="padding: 50px 40px;">

                        <!-- Title -->
                        <h1 style="margin: 0 0 20px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 32px; line-height: 1.3; color: #2E2E2E; font-weight: normal; text-align: center; letter-spacing: -0.5px;">
                          You've received something special ✨
                        </h1>

                        <!-- Subtext -->
                        <p style="margin: 0 0 ${sanitizedMessage ? '35px' : '40px'} 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #4A4A4A; text-align: center;">
                          <strong style="color: #2E2E2E;">${sanitizedSenderName}</strong> has sent you a magical, interactive Christmas card.
                        </p>

                        ${sanitizedMessage ? `
                        <!-- Personal Message (Quote) -->
                        <div style="margin: 0 0 40px 0; padding: 20px 0 20px 24px; border-left: 2px solid #d4af37;">
                          <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; line-height: 1.7; color: #2E2E2E; font-style: italic; text-align: left;">
                            "${sanitizedMessage}"
                          </p>
                        </div>
                        ` : ''}

                        <!-- CTA Button -->
                        <div style="text-align: center; margin-bottom: 30px;">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${cardUrl}" style="height:52px;v-text-anchor:middle;width:260px;" arcsize="50%" strokecolor="#f6d878" fillcolor="#f6d878">
                            <w:anchorlock/>
                            <center style="color:#2E2E2E;font-family:sans-serif;font-size:16px;font-weight:600;">✨ Open Your Christmas Card</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="${cardUrl}" target="_blank" style="display: inline-block; background: #f6d878; color: #2E2E2E; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 16px; font-weight: 600; padding: 16px 40px; border-radius: 50px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; letter-spacing: 0.3px;">
                            ✨ Open Your Christmas Card
                          </a>
                          <!--<![endif]-->
                        </div>

                        <!-- Small Note -->
                        <p style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 13px; line-height: 1.5; color: #6B6B6B; text-align: center;">
                          Best experienced with your camera enabled.
                        </p>

                        <!-- Footer -->
                        <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 13px; line-height: 1.5; color: #4A4A4A; text-align: center;">
                          Sent with ❤️ from <strong style="color: #2E2E2E;">${sanitizedSenderName}</strong>
                        </p>

                        <!-- Divider -->
                        <div style="margin: 30px auto; width: 60px; height: 1px; background: linear-gradient(to right, transparent, #d4af37, transparent);"></div>

                        <!-- Promotional Section -->
                        <div style="text-align: center; margin-top: 25px;">
                          <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #5A5A5A; font-weight: 500;">
                            Spread the holiday magic ✨
                          </p>
                          <p style="margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 13px; line-height: 1.5; color: #6B6B6B;">
                            Create and send your own card 🎄
                          </p>
                          <a href="https://christmas-tree-jade.vercel.app" target="_blank" style="display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #d4af37; text-decoration: none; font-weight: 500; padding: 8px 16px; border: 1px solid #d4af37; border-radius: 20px; transition: all 0.3s ease;">
                            christmas-tree-jade.vercel.app
                          </a>
                        </div>

                      </td>
                    </tr>
                  </table>
                  <!-- End White Content Container -->

                </td>
              </tr>
            </table>
            <!-- End Full-Page Background Wrapper -->

          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(500).json({
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }

    // Mark session as completed
    await supabase
      .from('ecard_sessions')
      .update({
        status: 'completed',
        card_url: cardUrl,
      })
      .eq('id', sessionId);

    return res.status(200).json({
      success: true,
      messageId: data?.id || 'unknown',
      cardUrl,
    });
  } catch (error: any) {
    console.error('Error sending card:', error);
    return res.status(500).json({
      error: 'Failed to send card',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
