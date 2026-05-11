export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { requireAuthenticatedRequest } from '@/lib/serverAuth';

// Notice: We removed the `const resend = new Resend(...)` from up here!

export async function POST(request: Request) {
  console.log("LOG: API Route reached. Checking payload size..");
  try {
    const auth = await requireAuthenticatedRequest(request);
    if (auth.response) return auth.response;

    // --- 1. INITIALIZE RESEND SAFELY INSIDE THE FUNCTION ---
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY environment variable");
      return NextResponse.json({ error: "Email configuration error on server" }, { status: 500 });
    }
    const resend = new Resend(apiKey);
    // ------------------------------------------------------

    // 2. Read the request body ONLY ONCE
    const { email, clientName, estimateName, pdfBase64 } = await request.json();

    if (!email || !clientName || !pdfBase64) {
      return NextResponse.json({ error: 'Email, client name, and PDF are required' }, { status: 400 });
    }

    // 3. Generate the mmddyyyy date
    const rightNow = new Date();
    const mm = String(rightNow.getMonth() + 1).padStart(2, "0");
    const dd = String(rightNow.getDate()).padStart(2, "0");
    const yyyy = rightNow.getFullYear();
    const dateString = `${mm}${dd}${yyyy}`;

    // 4. Clean up the estimate name
    const safeEstimateName = (estimateName || "Estimate").replace(/[^a-z0-9]/gi, "_");

    // 5. Send the email 
    const { data, error } = await resend.emails.send({
      from: 'Carlos Quintero <estimates@happyoakpainting.com>', // The default testing address
      to: email, // During testing, this MUST be your own Resend account email!
      subject: `Your Proposal from Happy Oak Painting: ${estimateName}`,
      html: `
        <div style="font-family: sans-serif; color: #51321F;">
          <h2>Hi ${clientName},</h2>
          <p>Thank you for giving us the opportunity to quote your project!</p>
          <p>Please find your detailed proposal attached to this email.</p>
          <p>Let me know if you have any questions or concerns.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>Carlos Quintero</strong><br/>Happy Oak Painting</p>
        </div>
      `,
      attachments: [
        {
          filename: `Proposal-${dateString}-${safeEstimateName}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    // 6. Check if Resend returned an error silently
    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Server Code Error:", error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}