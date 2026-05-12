import nodemailer from "nodemailer";

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function getEmailConfig() {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  return { user, pass };
}

export async function handler(event) {
  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 200, headers, body: "OK" };
    }

    if (event.httpMethod !== "POST") {
      return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
    }

    const body = JSON.parse(event.body);
    const { email, orderId, customerName } = body;

    if (!email || !orderId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const emailConfig = getEmailConfig();

    if (!emailConfig) {
      console.error("Environment variables EMAIL_USER or EMAIL_PASS are missing.");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Email configuration missing on server" }),
      };
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
    });

    const mailOptions = {
        from: `"Glow Naturals" <${emailConfig.user}>`,
        to: [email, "glownaturalsnew02@gmail.com"],
        subject: `Cancellation Request Received • Glow Naturals #${orderId.slice(0, 8).toUpperCase()}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Helvetica', sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e5e5e5;">
              <h1 style="font-size: 24px; color: #111111; margin-bottom: 24px;">Cancellation Request</h1>
              <p style="font-size: 16px; color: #444444; line-height: 1.6;">
                Hello ${customerName || 'Customer'},
              </p>
              <p style="font-size: 16px; color: #444444; line-height: 1.6;">
                We have received your requested to cancel order <strong>#${orderId.slice(0, 10).toUpperCase()}</strong>.
              </p>
              <p style="font-size: 16px; color: #444444; line-height: 1.6;">
                Our team is reviewing your request. Please note that if the order has already been processed or shipped, cancellation might not be possible. We will update you shortly.
              </p>
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                <p style="font-size: 14px; color: #999999;">
                  Pure • Organic • Glow<br>
                  The Glow Naturals Team
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Cancellation request email sent" }),
    };
  } catch (error) {
    console.error("Cancellation email error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to send email" }),
    };
  }
}
