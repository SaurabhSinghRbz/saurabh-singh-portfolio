import { site } from "@/content/site";

/**
 * Hand-built, bulletproof HTML email templates for the contact form.
 *
 * Rules that keep these rendering everywhere (Gmail, Outlook, Apple Mail,
 * mobile, dark mode):
 *   - Table-based layout, never flex/grid.
 *   - Every style inline; no <style> blocks, no external CSS, no web fonts.
 *   - No remote images (they get blocked) — brand comes from type + colour.
 *   - A hidden preheader controls the inbox preview line.
 *
 * Each builder returns { subject, html, text } so the route stays dumb.
 */

// ── Brand tokens (mirrors globals.css, hard-coded because email has no vars) ──
const C = {
  page: "#0a0f0d",
  card: "#111917",
  cardSoft: "#16211e",
  border: "#20302b",
  ink: "#e8efea",
  muted: "#8fa39a",
  faint: "#5f7168",
  accent: "#ff8a66",
  accentInk: "#21130d",
} as const;

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(s: string) {
  return escapeHtml(s).replace(/\r?\n/g, "<br />");
}

/** Hidden inbox-preview text + zero-width padding so nothing else leaks in. */
function preheader(text: string) {
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${C.page};">${escapeHtml(
    text,
  )}${"&nbsp;&zwnj;".repeat(60)}</div>`;
}

/** Outer shell: dark page, centred 600px card, brand header + footer. */
function shell(inner: string, opts: { preview: string }) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xmlns="https://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<meta name="supported-color-schemes" content="dark light" />
<title>${escapeHtml(site.name)}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.page};-webkit-font-smoothing:antialiased;">
${preheader(opts.preview)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.page};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:${C.card};border:1px solid ${C.border};border-radius:16px;overflow:hidden;">

        <!-- Brand header -->
        <tr>
          <td style="padding:28px 36px 22px;border-bottom:1px solid ${C.border};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle;">
                  <div style="font-family:${FONT};font-size:19px;font-weight:700;letter-spacing:-0.2px;color:${C.ink};">Saurabh<span style="color:${C.accent};">.</span></div>
                  <div style="font-family:${MONO};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.muted};padding-top:5px;">Senior Software Engineer</div>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <a href="${site.domain}" style="font-family:${MONO};font-size:12px;color:${C.accent};text-decoration:none;">iamsaurabh.in&nbsp;&rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${inner}

        <!-- Footer -->
        <tr>
          <td style="padding:22px 36px 30px;border-top:1px solid ${C.border};">
            <div style="font-family:${FONT};font-size:12px;line-height:1.6;color:${C.faint};">
              ${escapeHtml(site.location)}<br />
              You're receiving this because you reached out through
              <a href="${site.domain}" style="color:${C.muted};text-decoration:none;">iamsaurabh.in</a>.
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Coral "pill" chip used to show expertise at a glance. */
function chip(label: string) {
  return `<span style="display:inline-block;font-family:${MONO};font-size:11px;line-height:1;color:${C.accent};background-color:rgba(255,138,102,0.08);border:1px solid rgba(255,138,102,0.28);border-radius:999px;padding:7px 11px;margin:0 6px 8px 0;white-space:nowrap;">${escapeHtml(
    label,
  )}</span>`;
}

const EXPERTISE = [
  "Payments infrastructure",
  "Distributed systems",
  "Go · Node.js · TypeScript",
  "Message queues @ 500+ TPS",
  "NestJS · Stripe",
  "Gift-card & notification platforms",
];

/** Quoted echo of what the sender submitted (accent left-rule). */
function quotedMessage(subject: string, message: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 4px;">
    <tr>
      <td style="background-color:${C.cardSoft};border-left:3px solid ${C.accent};border-radius:0 10px 10px 0;padding:16px 20px;">
        <div style="font-family:${MONO};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${C.muted};padding-bottom:8px;">Your message</div>
        <div style="font-family:${FONT};font-size:14px;font-weight:600;color:${C.ink};padding-bottom:8px;">${escapeHtml(
          subject,
        )}</div>
        <div style="font-family:${FONT};font-size:14px;line-height:1.65;color:${C.muted};">${nl2br(
          message,
        )}</div>
      </td>
    </tr>
  </table>`;
}

/** Signature with Portfolio / GitHub / LinkedIn links. */
function signature() {
  const link = (href: string, label: string) =>
    `<a href="${href}" style="font-family:${FONT};font-size:13px;color:${C.accent};text-decoration:none;">${label}</a>`;
  const sep = `<span style="color:${C.border};padding:0 8px;">|</span>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;border-top:1px solid ${C.border};">
    <tr>
      <td style="padding-top:20px;">
        <div style="font-family:${FONT};font-size:15px;font-weight:700;color:${C.ink};">Saurabh Singh</div>
        <div style="font-family:${FONT};font-size:13px;color:${C.muted};padding:3px 0 12px;">Senior Software Engineer · Pine Labs (Qwikcilver · Woohoo)</div>
        <div style="line-height:1.4;">
          ${link(site.domain, "Portfolio")}${sep}${link(site.github, "GitHub")}${sep}${link(
            site.linkedin,
            "LinkedIn",
          )}
        </div>
        <div style="font-family:${MONO};font-size:12px;color:${C.faint};padding-top:12px;">
          <a href="mailto:${site.email}" style="color:${C.faint};text-decoration:none;">${site.email}</a>
        </div>
      </td>
    </tr>
  </table>`;
}

/**
 * Auto-reply sent to whoever filled in the form.
 */
export function autoReplyEmail(input: {
  name: string;
  subject: string;
  message: string;
}) {
  const firstName = input.name.trim().split(/\s+/)[0] || input.name;

  const inner = `
    <tr>
      <td style="padding:32px 36px 8px;">
        <div style="font-family:${FONT};font-size:22px;font-weight:700;letter-spacing:-0.3px;color:${C.ink};padding-bottom:16px;">
          Thanks, ${escapeHtml(firstName)} — your message landed. ✅
        </div>
        <div style="font-family:${FONT};font-size:15px;line-height:1.7;color:${C.muted};">
          I read every message myself, and I reply within one business day (IST).
          If it's time-sensitive, just reply to this email — it comes straight to
          my inbox.
        </div>

        ${quotedMessage(input.subject, input.message)}

        <div style="font-family:${MONO};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${C.muted};padding:30px 0 12px;">
          While you wait — what I work on
        </div>
        <div style="font-family:${FONT};font-size:14px;line-height:1.7;color:${C.muted};padding-bottom:16px;">
          I design and operate the systems that move money — message queues
          sustaining 500+ TPS, gift-card and notification platforms in Go and
          Node.js, and full payment products built end-to-end.
        </div>
        <div>
          ${EXPERTISE.map(chip).join("")}
        </div>

        ${signature()}
      </td>
    </tr>`;

  return {
    subject: `Thanks for reaching out — I'll reply within a day (${site.name})`,
    html: shell(inner, {
      preview: `Got your message about "${input.subject}". I reply within one business day.`,
    }),
    text: [
      `Hi ${firstName},`,
      ``,
      `Thanks for reaching out — your message landed and I'll reply within one business day (IST).`,
      `If it's time-sensitive, just reply to this email; it comes straight to my inbox.`,
      ``,
      `— Your message —`,
      `Subject: ${input.subject}`,
      ``,
      input.message,
      ``,
      `— While you wait, what I work on —`,
      `Payments infrastructure · distributed systems · message queues at 500+ TPS ·`,
      `gift-card & notification platforms in Go and Node.js · full payment products (NestJS, Stripe).`,
      ``,
      `— Saurabh Singh`,
      `Senior Software Engineer · Pine Labs (Qwikcilver · Woohoo)`,
      `Portfolio: ${site.domain}`,
      `GitHub:    ${site.github}`,
      `LinkedIn:  ${site.linkedin}`,
      `Email:     ${site.email}`,
    ].join("\n"),
  };
}

/**
 * Notification to the site owner when the form is submitted.
 */
export function ownerNotificationEmail(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const inner = `
    <tr>
      <td style="padding:32px 36px 8px;">
        <div style="font-family:${MONO};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.accent};padding-bottom:10px;">
          New enquiry
        </div>
        <div style="font-family:${FONT};font-size:20px;font-weight:700;letter-spacing:-0.3px;color:${C.ink};padding-bottom:20px;">
          ${escapeHtml(input.name)} sent you a message
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:4px;">
          <tr>
            <td style="font-family:${MONO};font-size:12px;color:${C.muted};padding:6px 0;width:70px;">From</td>
            <td style="font-family:${FONT};font-size:14px;color:${C.ink};padding:6px 0;">${escapeHtml(
              input.name,
            )}</td>
          </tr>
          <tr>
            <td style="font-family:${MONO};font-size:12px;color:${C.muted};padding:6px 0;">Email</td>
            <td style="font-family:${FONT};font-size:14px;padding:6px 0;"><a href="mailto:${escapeHtml(
              input.email,
            )}" style="color:${C.accent};text-decoration:none;">${escapeHtml(
              input.email,
            )}</a></td>
          </tr>
        </table>

        ${quotedMessage(input.subject, input.message)}

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
          <tr>
            <td style="border-radius:8px;background-color:${C.accent};">
              <a href="mailto:${escapeHtml(input.email)}?subject=${encodeURIComponent(
                "Re: " + input.subject,
              )}" style="display:inline-block;font-family:${FONT};font-size:14px;font-weight:600;color:${C.accentInk};text-decoration:none;padding:12px 24px;">
                Reply to ${escapeHtml(input.name.trim().split(/\s+/)[0] || input.name)} &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  return {
    subject: `Portfolio enquiry: ${input.subject}`,
    html: shell(inner, {
      preview: `${input.name} <${input.email}>: ${input.subject}`,
    }),
    text: [
      `New enquiry via iamsaurabh.in`,
      ``,
      `From:    ${input.name}`,
      `Email:   ${input.email}`,
      `Subject: ${input.subject}`,
      ``,
      input.message,
    ].join("\n"),
  };
}
