import nodemailer from "nodemailer";

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export async function handler(event) {
  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 200, headers, body: "OK" };
    }

    if (event.httpMethod !== "POST") {
      return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
    }

    const { email, otp, customerName } = JSON.parse(event.body);

    if (!email || !otp) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Email and OTP are required" }) };
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER.trim(),
        pass: process.env.EMAIL_PASS.replace(/\s+/g, ''),
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"Glow Naturals" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Verify Your Account • Glow Naturals`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #111111; padding: 40px; border: 1px solid #e5e5e5;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 400; text-align: center; margin-bottom: 30px;">Glow Naturals</h1>
          <p style="font-size: 15px; line-height: 1.6;">Hello ${customerName || "Customer"},</p>
          <p style="font-size: 15px; line-height: 1.6;">Thank you for joining our community. To complete your signup, please enter the following verification code:</p>
          <div style="background-color: #fafafa; padding: 20px; text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 15px; color: #111111;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #666666; text-align: center;">This code will expire in 10 minutes.</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; color: #999999; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
            Pure • Organic • Glow
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Verification code sent" }),
    };
  } catch (error) {
    console.error("Verification email error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to send verification code", details: error.message }),
    };
  }
}
