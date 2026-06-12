import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    // Destructure new fields from orderData
    const { customerName, customerEmail, shippingAddress, items, subtotalAmount, deliveryCharge, totalAmount } = orderData;

    // Create a detailed HTML email template
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #0f172a; text-align: center;">Thank You For Your Order!</h1>
        <p style="color: #475569; font-size: 16px;">Hi ${customerName},</p>
        <p style="color: #475569; font-size: 16px;">We've received your Cash on Delivery order. We are processing it and will dispatch it soon!</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a;">Order Summary</h3>
          <ul style="list-style: none; padding: 0;">
            ${items.map((item: any) => `
              <li style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>${item.quantity}x ${item.name}</span>
                <span>LKR ${item.price * item.quantity}</span>
              </li>
            `).join('')}
          </ul>
          <div style="border-top: 1px solid #e2e8f0; margin-top: 10px; padding-top: 10px;">
            <p style="display: flex; justify-content: space-between; font-weight: 600;">
              <span>Subtotal:</span>
              <span>LKR ${subtotalAmount}</span>
            </p>
            <p style="display: flex; justify-content: space-between; font-weight: 600; color: ${deliveryCharge === 0 ? '#16a34a' : '#475569'};">
              <span>Delivery:</span>
              <span>${deliveryCharge === 0 ? 'FREE' : `LKR ${deliveryCharge}`}</span>
            </p>
            <p style="display: flex; justify-content: space-between; font-weight: 700; font-size: 18px; margin-top: 10px; border-top: 1px dashed #e2e8f0; padding-top: 10px;">
              <span>Total:</span>
              <span>LKR ${totalAmount}</span>
            </p>
          </div>
        </div>

        <p style="color: #475569; font-size: 16px;"><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
        <p style="color: #475569; font-size: 16px;"><strong>Delivery Address:</strong> ${shippingAddress}</p>

        <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
          Accessories by DN • Sri Lanka
        </p>
      </div>
    `;

    // Send the email
    const data = await resend.emails.send({
      from: 'Accessories by DN <onboarding@resend.dev>',
      to: [customerEmail],
      subject: 'Order Confirmation - Accessories by DN',
      html: emailHtml,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Email sending failed:", error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}