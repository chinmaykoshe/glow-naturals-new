import nodemailer from "nodemailer";

export async function handler(event) {
  try {
    console.log("Function sendOrderEmail triggered");
    
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

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      console.error("JSON parse error:", e);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON body" }),
      };
    }

    const { email, orderId, total, status, customerName, items, shippingAddress, trackingId, deliveryPartner } = body;

    if (!email || !orderId) {
      console.error("Missing fields:", { email, orderId });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Required fields missing (email or orderId)" }),
      };
    }

    console.log(`Sending email to: ${email} for order: ${orderId}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Environment variables EMAIL_USER or EMAIL_PASS are missing!");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Email configuration missing on server" }),
      };
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // Helps with some hosting environments
      }
    });

    const getStatusMessage = (status) => {
      switch (status?.toLowerCase()) {
        case 'pending':
          return "We've received your order and it's being prepared.";
        case 'shipped':
          return "Your package has been handed over to our delivery partner and is now on its way.";
        case 'delivered':
          return "Your order has been delivered. We hope you love your new natural products.";
        default:
          return "Your order status has been updated.";
      }
    };

    const trackingHtml = (status === 'shipped' || status === 'delivered') && trackingId ? `
      <div style="margin-top: 20px; padding: 15px; border-left: 4px solid #c5a059; background: #fafafa;">
        <p style="margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #1a1a1a;">Delivery Tracking</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #444;">Partner: <strong>${deliveryPartner}</strong></p>
        <p style="margin: 2px 0 0 0; font-size: 14px; color: #444;">Tracking ID: <strong>${trackingId}</strong></p>
      </div>
    ` : '';


    const itemsHtml = items?.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
        <div style="flex: 1;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">${item.name}</p>
          <p style="margin: 0; font-size: 12px; color: #666;">${item.quantity} x ₹${Number(item.price).toLocaleString('en-IN')}</p>
        </div>
        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">₹${Number(item.quantity * item.price).toLocaleString('en-IN')}</p>
      </div>
    `).join('') || '';

    const shippingHtml = shippingAddress ? `
      <div style="margin-top: 30px; padding: 20px; background: #fafafa; border: 1px solid #f0f0f0;">
        <h3 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999;">Shipping Address</h3>
        <p style="margin: 0; font-size: 14px; color: #333;">${shippingAddress.address || ''}</p>
        <p style="margin: 0; font-size: 14px; color: #333;">${shippingAddress.city || ''}, ${shippingAddress.pincode || ''}</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">Phone: ${shippingAddress.phone || ''}</p>
      </div>
    ` : '';

    const mailOptions = {
      from: `"Glow Naturals" <${process.env.EMAIL_USER}>`,
      to: [email, "glownaturalsnew02@gmail.com"],
      subject: `Order Update: ${status?.toUpperCase()} • #${orderId.slice(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Inter', sans-serif;">
          <div style="max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #f0f0f0;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 400; margin: 0; color: #1a1a1a; letter-spacing: -0.5px;">Glow Naturals</h1>
              <div style="width: 40px; height: 1px; background: #c5a059; margin: 15px auto;"></div>
            </div>

            <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 400; margin: 0 0 20px 0; color: #1a1a1a;">
              Hello ${customerName?.split(' ')[0] || "Customer"} 👋
            </h2>
            
            <p style="font-size: 16px; color: #444; line-height: 1.6; margin-bottom: 30px;">
              ${getStatusMessage(status)}
            </p>

            ${trackingHtml}

            <div style="margin-bottom: 40px;">

              <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; margin-bottom: 15px;">
                <span style="margin-top: 10px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a;">Order Summary</span>
                <span style="font-size: 12px; font-weight: 600; color: #1a1a1a;">#${orderId.slice(0, 10).toUpperCase()}</span>
              </div>
              
              ${itemsHtml}

              <div style="margin-top: 20px; text-align: right;">
                <p style="margin: 0; font-size: 14px; color: #666;">Total Amount</p>
                <p style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a; font-family: 'Playfair Display', serif;">
                  ₹${Number(total).toLocaleString("en-IN")}
                </p>
                <p style="margin: 0; font-size: 10px; color: #999;">(Inclusive of all taxes)</p>
              </div>
            </div>

            ${shippingHtml}

            <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid #f0f0f0; text-align: center;">
              <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                If you have any questions, simply reply to this email.
              </p>
              <p style="font-family: 'Playfair Display', serif; font-style: italic; font-size: 16px; color: #1a1a1a; margin: 0;">
                Warm Regards,
              </p>
              <p style="font-size: 14px; font-weight: 600; color: #1a1a1a; margin: 5px 0 0 0;">
                The Glow Naturals Team
              </p>
            </div>
            
            <div style="margin-top: 40px; text-align: center;">
              <p style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 2px;">
                Pure • Organic • Glow
              </p>
            </div>
          </div>
        </body>
        </html>

      `,
    };

    console.log("Transporter created, sending mail...");
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully" }),
    };
  } catch (error) {
    console.error("Email error detail:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Failed to send email", 
        details: error.message,
        code: error.code 
      }),
    };
  }
}