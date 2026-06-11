import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    const emailHtml = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #0f172a; text-align: center;">Thank You For Your Order!</h1>
        <p style="color: #475569; font-size: 16px;">Hi ${orderData.customerName},</p>
        <p style="color: #475569; font-size: 16px;">We've received your Cash on Delivery order. We are processing it and will dispatch it soon!</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a;">Order Summary</h3>
          <p><strong>Total Amount:</strong> LKR ${orderData.totalAmount}</p>
          <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
          <p><strong>Delivery Address:</strong> ${orderData.shippingAddress}</p>
        </div>

        <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
          Accessories by DN • Sri Lanka
        </p>
      </div>
    `;

    const data = await resend.emails.send({
      from: 'Accessories by DN <onboarding@resend.dev>', 
      to: [orderData.customerEmail], 
      subject: 'Order Confirmation - Accessories by DN',
      html: emailHtml,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Email sending failed:", error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}