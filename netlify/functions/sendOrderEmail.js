const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }

    const { email, orderId, total, status, customerName } =
      JSON.parse(event.body);

    if (!email || !orderId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Required fields missing" }),
      };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Glow Naturals" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Order Confirmation • Glow Naturals",
      html: `
        <div style="font-family: serif; max-width: 600px; margin: auto; padding: 40px; background: #ffffff;">
          <h1 style="font-weight: 400; letter-spacing: -1px;">Thank You, ${customerName || "Valued Ritualist"} 🌿</h1>
          
          <p style="color: #666; line-height: 1.6;">
            Your order has been successfully placed and is now being prepared.
          </p>

          <div style="margin: 30px 0; padding: 20px; background: #f9f9f9;">
            <p><strong>Order Reference:</strong> #${orderId.slice(0, 10).toUpperCase()}</p>
            <p><strong>Total:</strong> ₹${Number(total).toLocaleString("en-IN")}</p>
            <p><strong>Status:</strong> ${status}</p>
          </div>

          <p style="color: #666;">
            We will notify you as your ritual progresses through its journey.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />

          <p style="font-size: 12px; color: #999;">
            Glow Naturals • Crafted for You
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully" }),
    };
  } catch (error) {
    console.error("Email error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send email" }),
    };
  }
};