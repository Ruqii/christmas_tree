import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recipientEmail, senderName, message } = req.body;

    // Basic validation
    if (!recipientEmail || !senderName || !message) {
      return res.status(400).json({
        error: 'Missing required fields: recipientEmail, senderName, and message are required',
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Sanitize inputs (basic)
    const sanitizedSenderName = senderName.trim().slice(0, 100);
    const sanitizedMessage = message.trim().slice(0, 500);

    // Get the base URL - use PUBLIC_URL env var if set, otherwise use request host
    const baseUrl = process.env.PUBLIC_URL || (() => {
      const host = req.headers.host || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      return `${protocol}://${host}`;
    })();

    // Build card URL with parameters
    const cardUrl = `${baseUrl}/card?${new URLSearchParams({
      to: recipientEmail.split('@')[0], // Use email username as recipient name
      from: sanitizedSenderName,
      msg: sanitizedMessage,
    })}`;

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

            <!-- Wrapper Table with Background -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0; padding: 0; background-color: #1a1a2e; background-image: url('${bgImageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;">

              <!-- Top Spacer -->
              <tr>
                <td height="60"></td>
              </tr>

              <!-- Title -->
              <tr>
                <td align="center" style="padding: 0 20px;">
                  <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 38px; line-height: 1.3; color: #4A3A2F; font-weight: normal; letter-spacing: -0.5px; text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);">
                    You've received something special ✨
                  </h1>
                </td>
              </tr>

              <!-- Spacer -->
              <tr>
                <td height="30"></td>
              </tr>

              <!-- Subtext -->
              <tr>
                <td align="center" style="padding: 0 20px;">
                  <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 19px; line-height: 1.6; color: #4A3A2F; text-shadow: 0 1px 1px rgba(255, 255, 255, 0.2);">
                    <strong style="color: #4A3A2F;">${sanitizedSenderName}</strong> has sent you a magical, interactive Christmas card.
                  </p>
                </td>
              </tr>

              <!-- Spacer -->
              <tr>
                <td height="45"></td>
              </tr>

              <!-- Personal Message (Pull Quote) -->
              <tr>
                <td align="center" style="padding: 0 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 500px;">
                    <tr>
                      <td style="border-left: 4px solid #d4af37; padding: 25px 30px;">
                        <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; line-height: 1.7; color: #4A3A2F; font-style: italic; text-align: center; text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);">
                          "${sanitizedMessage}"
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Spacer -->
              <tr>
                <td height="50"></td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td align="center" style="padding: 0 20px;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${cardUrl}" style="height:56px;v-text-anchor:middle;width:280px;" arcsize="50%" strokecolor="#d4af37" fillcolor="#d4af37">
                    <w:anchorlock/>
                    <center style="color:#1a1a2e;font-family:sans-serif;font-size:18px;font-weight:bold;">✨ Open Your Christmas Card</center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <a href="${cardUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%); color: #1a1a2e; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 18px; font-weight: bold; padding: 18px 45px; border-radius: 50px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.5); transition: all 0.3s ease; letter-spacing: 0.5px;">
                    ✨ Open Your Christmas Card
                  </a>
                  <!--<![endif]-->
                </td>
              </tr>

              <!-- Spacer -->
              <tr>
                <td height="35"></td>
              </tr>

              <!-- Small Note -->
              <tr>
                <td align="center" style="padding: 0 20px;">
                  <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #6A5A50; text-shadow: 0 1px 1px rgba(255, 255, 255, 0.2);">
                    Best experienced with your camera enabled.
                  </p>
                </td>
              </tr>

              <!-- Spacer -->
              <tr>
                <td height="50"></td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding: 0 20px;">
                  <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #4A3A2F; text-shadow: 0 1px 1px rgba(255, 255, 255, 0.2);">
                    Sent with ❤️ from <strong style="color: #4A3A2F;">${sanitizedSenderName}</strong>
                  </p>
                </td>
              </tr>

              <!-- Bottom Spacer -->
              <tr>
                <td height="60"></td>
              </tr>

            </table>
            <!-- End Wrapper Table -->

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
