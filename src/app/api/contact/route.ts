import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { autoReplyEmail, ownerNotificationEmail } from "@/lib/email-templates";
import { site } from "@/content/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Where owner notifications land. Defaults to the public address (which routes
// to the personal inbox via Cloudflare Email Routing); override with CONTACT_TO.
const OWNER_TO = process.env.CONTACT_TO || site.email;

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

  try {
    // 1) Notify the owner. Reply-To is the sender so a direct reply just works.
    const owner = ownerNotificationEmail({ name, email, subject, message });
    await sendMail({
      to: OWNER_TO,
      replyTo: email,
      subject: owner.subject,
      text: owner.text,
      html: owner.html,
    });

    // 2) Auto-reply to the sender. Reply-To is the owner's public address.
    const reply = autoReplyEmail({ name, subject, message });
    await sendMail({
      to: email,
      replyTo: site.email,
      subject: reply.subject,
      text: reply.text,
      html: reply.html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form send failed:", err);
    return NextResponse.json({ error: "Couldn't send your message. Please email me directly instead." }, { status: 502 });
  }
}
