import nodemailer from "nodemailer";

/**
 * Single choke point for outbound email. Swap the transport here (e.g. to
 * Resend) without touching the route that calls sendMail — everything else
 * only depends on this function's signature.
 *
 * Needs GMAIL_USER + GMAIL_APP_PASSWORD (a Gmail "App Password", not your
 * account password — generate one at myaccount.google.com/apppasswords).
 */

type MailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variables");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return transporter;
}

export async function sendMail({ to, subject, html, text, replyTo }: MailInput) {
  const user = process.env.GMAIL_USER!;
  await getTransporter().sendMail({
    from: `"Saurabh Singh — Portfolio" <${user}>`,
    to,
    subject,
    html,
    text,
    replyTo,
  });
}
