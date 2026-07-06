import { Resend } from "resend";

/**
 * Single choke point for outbound email, backed by Resend.
 *
 * Requires two env vars:
 *   RESEND_API_KEY   — API key from https://resend.com/api-keys
 *   MAIL_FROM        — verified sender, e.g. "Saurabh Singh <hello@iamsaurabh.in>"
 *                      (the iamsaurabh.in domain must be verified in Resend:
 *                       add the DKIM/SPF/DMARC records it gives you in Cloudflare)
 *
 * Everything else in the app depends only on this function's signature, so the
 * transport can be swapped again without touching the route that calls it.
 */

type MailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

let client: Resend | null = null;

function getClient() {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }
  client = new Resend(apiKey);
  return client;
}

export async function sendMail({ to, subject, html, text, replyTo }: MailInput) {
  const from = process.env.MAIL_FROM;
  if (!from) {
    throw new Error("Missing MAIL_FROM environment variable");
  }

  const { error } = await getClient().emails.send({
    from,
    to,
    subject,
    html,
    text,
    replyTo,
  });

  // Resend returns errors in the payload rather than throwing — surface them so
  // the caller's try/catch treats a rejected send as a failure.
  if (error) {
    throw new Error(`Resend send failed: ${error.name} — ${error.message}`);
  }
}
