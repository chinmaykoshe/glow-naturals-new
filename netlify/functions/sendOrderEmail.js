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
    console.log("Function sendOrderEmail triggered");
    
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers,
        body: "OK"
      };
    }

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }

    let body;
    try {
      const bodyText = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
      body = JSON.parse(bodyText);
    } catch (e) {
      console.error("JSON parse error:", e);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid JSON body" }),
      };
    }

    const { email, orderId, total, status, customerName, items, shippingAddress, trackingId, deliveryPartner } = body;

    if (!email || !orderId) {
      console.error("Missing fields:", { email, orderId });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Required fields missing (email or orderId)" }),
      };
    }

    console.log(`Sending email to: ${email} for order: ${orderId}`);

    const emailConfig = getEmailConfig();

    if (!emailConfig) {
      console.error("Environment variables EMAIL_USER or EMAIL_PASS are missing!");
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
      tls: {
        rejectUnauthorized: false
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

    const statusColor = status === 'delivered' ? '#10b981' : (status === 'shipped' ? '#3b82f6' : '#f59e0b');

    const trackingHtml = (status === 'shipped' || status === 'delivered') && trackingId ? `
      <div style="background-color: #fafafa; border: 1px solid #e5e5e5; padding: 30px; margin: 40px 0; text-align: left;">
        <div style="display: inline-block; background-color: #111111; color: #ffffff; text-transform: uppercase; font-size: 10px; font-weight: 700; letter-spacing: 2px; padding: 6px 14px; margin-bottom: 20px;">Shipment Details</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 10px;">
          <tr>
            <td width="50%" style="padding-right: 20px;">
              <p style="margin: 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #888888;">Delivery Partner</p>
              <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; color: #111111;">${deliveryPartner}</p>
            </td>
            <td width="50%" style="border-left: 1px solid #e5e5e5; padding-left: 30px;">
              <p style="margin: 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #888888;">Tracking Number</p>
              <p style="margin: 8px 0 0 0; font-size: 16px; font-family: monospace; font-weight: 600; color: #111111; word-break: break-all;">${trackingId}</p>
            </td>
          </tr>
        </table>
      </div>
    ` : '';


    const itemsHtml = items?.map(item => `
      <tr>
        <td style="padding: 24px 0; border-bottom: 1px solid #e5e5e5;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111111;">${item.name}</p>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #666666; font-weight: 500;">Qty: ${item.quantity} <span style="color: #dddddd; margin: 0 8px;">|</span> ₹${Number(item.price).toLocaleString('en-IN')}</p>
        </td>
        <td style="padding: 24px 0; border-bottom: 1px solid #e5e5e5; text-align: right; vertical-align: middle;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111111;">₹${Number(item.quantity * item.price).toLocaleString('en-IN')}</p>
        </td>
      </tr>
    `).join('') || '';

    const shippingHtml = shippingAddress ? `
      <div style="margin-top: 40px; padding: 30px; background-color: #fafafa; border: 1px solid #e5e5e5;">
        <h3 style="margin: 0 0 20px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #111111; display: flex; align-items: center;">
          <span style="display: inline-block; width: 6px; height: 6px; background-color: #111111; border-radius: 50%; margin-right: 12px;"></span>
          Shipping Address
        </h3>
        <p style="margin: 0; font-size: 14px; color: #444444; line-height: 1.6;">${shippingAddress.address || ''}</p>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #444444;">${shippingAddress.city || ''}, ${shippingAddress.pincode || ''}</p>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
          <p style="margin: 0; font-size: 13px; font-weight: 600; color: #111111;">Phone: <span style="font-weight: 400; color: #444444;">${shippingAddress.phone || ''}</span></p>
        </div>
      </div>
    ` : '';

    const upiLink = `upi://pay?pa=archanakoshe05@okicici&pn=Glow%20Naturals&am=${Number(total).toFixed(2)}&cu=INR&tn=Order%20${orderId.slice(0, 10).toUpperCase()}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`;

    const paymentHtml = status?.toLowerCase() === 'pending' ? `
      <div style="margin-top: 40px; padding: 30px; border: 2px solid #111111; text-align: center; background-color: #ffffff;">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 3px; color: #111111; font-weight: 700;">Complete Your Payment</h3>
        <p style="margin: 0 0 25px 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 1px;">Scan with GPay or any UPI app to pay <strong>₹${Number(total).toLocaleString('en-IN')}</strong></p>
        
        <div style="margin: 0 auto 25px; border: 1px solid #eeeeee; padding: 15px; display: inline-block;">
          <img src="${qrCodeUrl}" width="180" height="180" style="display: block; border: none;" alt="Payment QR Code" />
        </div>

        <div style="margin-bottom: 25px;">
          <a href="${upiLink}" style="display: inline-block; background-color: #111111; color: #ffffff; text-decoration: none; padding: 14px 30px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; border: 1px solid #111111;">Pay via UPI App (Mobile Only)</a>
        </div>

        <div style="margin-bottom: 25px;">
          <p style="margin: 0 0 10px 0; font-size: 11px; color: #666666; text-transform: uppercase; letter-spacing: 1px;">Alternatively, pay on our website:</p>
          <a href="https://glownaturals.netlify.app/profile" style="display: inline-block; background-color: #ffffff; color: #111111; text-decoration: underline; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">Go to Order History</a>
        </div>

        <p style="margin: 0; font-size: 11px; color: #999999; line-height: 1.5;">
          UPI ID: <strong>archanakoshe05@okicici</strong><br />
          Reference Note: <strong>#${orderId.slice(0, 10).toUpperCase()}</strong>
        </p>
        <p style="margin: 15px 0 0 0; font-size: 10px; color: #f59e0b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
          If you have already paid, please ignore this request.
        </p>
      </div>
    ` : '';

    const mailOptions = {
      from: `"Glow Naturals" <${emailConfig.user}>`,
      to: [email, "glownaturalsnew02@gmail.com"],
      subject: `Order ${status?.toUpperCase()} • Glow Naturals #${orderId.slice(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e5e5;">
            
            <!-- Header -->
            <div style="text-align: center; padding: 60px 40px 40px; background-color: #ffffff; border-bottom: 1px solid #e5e5e5;">
              <h1 style="font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 400; margin: 0; color: #111111; letter-spacing: -0.5px;">Glow Naturals</h1>
            </div>

            <!-- Content -->
            <div style="padding: 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #111111; color: #ffffff; padding: 8px 16px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
                      Order ${status}
                    </div>
                  </td>
                </tr>
              </table>

              <h2 style="font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 400; margin: 0 0 16px 0; color: #111111;">
                Hello ${customerName?.split(' ')[0] || "Customer"},
              </h2>
              
              <p style="font-size: 15px; color: #444444; line-height: 1.6; margin: 0 0 40px 0;">
                ${getStatusMessage(status)}
              </p>

              ${trackingHtml}
              ${paymentHtml}

              <!-- Order Summary Block -->
              <div style="margin-top: 40px; border: 1px solid #e5e5e5; background-color: #ffffff;">
                <div style="padding: 20px 24px; border-bottom: 1px solid #e5e5e5; background-color: #fafafa;">
                   <table width="100%" cellpadding="0" cellspacing="0">
                     <tr>
                       <td><span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #111111;">Order Summary</span></td>
                       <td align="right"><span style="font-size: 11px; font-weight: 600; color: #666666; font-family: monospace;">#${orderId.slice(0, 10).toUpperCase()}</span></td>
                     </tr>
                   </table>
                </div>
                
                <div style="padding: 10px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${itemsHtml}
                  </table>
                </div>

                <div style="padding: 24px; border-top: 1px solid #e5e5e5; text-align: right; background-color: #fafafa;">
                  <p style="margin: 0 0 8px 0; font-size: 10px; color: #666666; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Total Amount</p>
                  <p style="margin: 0; font-size: 28px; font-weight: 400; color: #111111; font-family: 'Playfair Display', serif;">
                    ₹${Number(total).toLocaleString("en-IN")}
                  </p>
                  <p style="margin: 4px 0 0 0; font-size: 10px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">(Inclusive of all taxes)</p>
                </div>
              </div>

              ${shippingHtml}

            </div>

            <!-- Footer -->
            <div style="background-color: #111111; padding: 60px 40px; text-align: center;">
              <p style="font-size: 13px; color: #a3a3a3; margin: 0 0 30px 0; line-height: 1.5;">
                Need help? Reply to this email and our team will get back to you.
              </p>
              <div style="margin: 0 auto 30px; width: 40px; height: 1px; background-color: #333333;"></div>
              <p style="font-family: 'Playfair Display', serif; font-style: italic; font-size: 18px; color: #ffffff; margin: 0 0 10px 0;">
                Warm Regards,
              </p>
              <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #ffffff; margin: 0 0 40px 0;">
                The Glow Naturals Team
              </p>
              
              <p style="font-size: 10px; color: #666666; text-transform: uppercase; letter-spacing: 4px; margin: 0;">
                Pure • Organic • Glow
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-bottom: 40px;">
            <p style="font-size: 11px; color: #999999; text-transform: uppercase; letter-spacing: 1.5px;">© ${new Date().getFullYear()} Glow Naturals. All rights reserved.</p>
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
      headers,
      body: JSON.stringify({ message: "Email sent successfully" }),
    };
  } catch (error) {
    console.error("Email error detail:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Failed to send email", 
        details: error.message,
        code: error.code 
      }),
    };
  }
}
