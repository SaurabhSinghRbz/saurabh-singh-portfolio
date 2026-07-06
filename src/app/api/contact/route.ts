import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { site } from "@/content/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 100);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const subject = String(body.subject ?? "").trim().slice(0, 150);
  const message = String(body.message ?? "").trim().slice(0, 5000);
  // Honeypot: real visitors never fill this hidden field; bots usually do.
  const company = String(body.company ?? "").trim();

  if (company) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !email || !subject || !message || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please fill in every field with a valid email." }, { status: 400 });
  }

  const safeName = escapeHtml(name);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  try {
    await sendMail({
      to: site.email,
      replyTo: email,
      subject: `Portfolio enquiry: ${subject}`,
      text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
      html: `
        <p><strong>${safeName}</strong> (${escapeHtml(email)}) sent a message via the portfolio contact form:</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p>${safeMessage}</p>
      `,
    });

    await sendMail({
      to: email,
      replyTo: site.email,
      subject: `Got your message — ${site.name}`,
      text: `Hi ${name},\n\nThanks for reaching out — I've received your message about "${subject}" and will reply within a day.\n\nFor reference, here's what you sent:\n${message}\n\n— ${site.name}`,
      html: `
        <p>Hi ${safeName},</p>
        <p>Thanks for reaching out — I've received your message about <strong>${safeSubject}</strong> and will reply within a day.</p>
        <p style="color:#666">For reference, here's what you sent:</p>
        <p style="color:#666">${safeMessage}</p>
        <p>— ${escapeHtml(site.name)}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form send failed:", err);
    return NextResponse.json({ error: "Couldn't send your message. Please email me directly instead." }, { status: 502 });
  }
}
