import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // 1. Read the request body ONLY ONCE
    const { email, clientName, estimateName, pdfBase64 } = await request.json();

    // 2. Generate the mmddyyyy date
    const rightNow = new Date();
    const mm = String(rightNow.getMonth() + 1).padStart(2, "0");
    const dd = String(rightNow.getDate()).padStart(2, "0");
    const yyyy = rightNow.getFullYear();
    const dateString = `${mm}${dd}${yyyy}`;

    // 3. Clean up the estimate name
    const safeEstimateName = (estimateName || "Estimate").replace(/[^a-z0-9]/gi, "_");

    // 4. Send the email (NEW: Extracting data AND error)
    const { data, error } = await resend.emails.send({
      from: 'Happy Oak Painting <onboarding@resend.dev>', // The default testing address
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
          // 5. USE the new variables here to name the file!
          filename: `Proposal-${dateString}-${safeEstimateName}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    // NEW: Check if Resend returned an error silently
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