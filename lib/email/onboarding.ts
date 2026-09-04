import "server-only";
import { site } from "@/lib/site";

/**
 * The onboarding email.
 *
 * Built as tables with inline styles, because that is still the only thing
 * every mail client agrees on. It follows the site's palette, and falls back
 * to Georgia for the headline — the closest widely-installed face to Fraunces,
 * so the mail reads as the same firm even though webfonts cannot be relied on.
 *
 * Two rules for this message:
 *   - One action. The button and the plain URL beneath it go to the same
 *     place, because a fair number of clients strip the button.
 *   - Say plainly who it is from, why it arrived, and what happens next. An
 *     unexpected "set your password" email is indistinguishable from phishing
 *     unless it names the sender and the reason.
 */

const INK = "#15201b";
const INK_SOFT = "#47544c";
const INK_MUTE = "#76837a";
const GROUND = "#e7eae3";
const PAPER = "#f3f5f0";
const RULE = "#c7cdc1";
const PINE = "#1e4a3c";

const SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', Times, serif";

export interface OnboardingEmailInput {
  /** The action link. One-time, and it expires. */
  actionUrl: string;
  /** Used to greet by first name when the admin supplied one. */
  fullName?: string | null;
  /** The organisation the account is attached to, when it is a client user. */
  organisation?: string | null;
  /** Admin accounts get the console, not the client portal. */
  role: "admin" | "client";
  /** How long the link is good for, in words. */
  expiresIn?: string;
}

function firstName(fullName?: string | null): string | null {
  const name = fullName?.trim().split(/\s+/)[0];
  return name && name.length > 1 ? name : null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function onboardingEmail(input: OnboardingEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const name = firstName(input.fullName);
  const greeting = name ? `${escapeHtml(name)},` : "Hello,";
  const isAdmin = input.role === "admin";
  const area = isAdmin ? "admin console" : "client portal";
  const expiresIn = input.expiresIn ?? "24 hours";

  const subject = isAdmin
    ? `Set up your ${site.name} admin account`
    : `Your ${site.name} client portal is ready`;

  const purpose = isAdmin
    ? `You have been given administrator access to the ${site.name} console. Choose a password and it is ready to use.`
    : `We have opened a client portal account for you${
        input.organisation ? ` at ${escapeHtml(input.organisation)}` : ""
      }. It is where your engagements, documents, subscriptions and support requests live.`;

  const contents = isAdmin
    ? ["Clients and users", "Engagements and subscriptions", "Documents and the audit log"]
    : [
        "Your engagements and where each one has reached",
        "Documents we have shared with you, including process maps and reports",
        "Your subscription and its billing period",
        "Support requests you have raised with us",
      ];

  // A preheader: the grey line a mail client prints after the subject. Without
  // one it prints the first thing in the body, which would be the wordmark.
  const preheader = `Choose a password and your ${area} is ready. The link is good for ${expiresIn}.`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${GROUND};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${GROUND};">
<tr><td align="center" style="padding:32px 16px;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;">

  <!-- Wordmark -->
  <tr><td style="padding:0 0 20px 4px;">
    <span style="font-family:${SERIF};font-size:21px;color:${INK};letter-spacing:-0.01em;">Marters <em style="font-style:italic;color:${PINE};">&amp;</em> Co.</span>
  </td></tr>

  <!-- Card -->
  <tr><td style="background-color:${PAPER};border:1px solid ${RULE};padding:36px 32px;">

    <p style="margin:0 0 20px;font-family:${SANS};font-size:15px;line-height:1.6;color:${INK_SOFT};">${greeting}</p>

    <h1 style="margin:0 0 18px;font-family:${SERIF};font-size:29px;line-height:1.2;font-weight:normal;color:${INK};letter-spacing:-0.015em;">
      ${isAdmin ? "Set up your admin account" : "Your client portal is ready"}
    </h1>

    <p style="margin:0 0 22px;font-family:${SANS};font-size:15px;line-height:1.65;color:${INK_SOFT};">
      ${purpose}
    </p>

    <!-- Action -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
      <tr><td style="background-color:${PINE};">
        <a href="${input.actionUrl}" style="display:inline-block;padding:14px 30px;font-family:${SANS};font-size:15px;font-weight:600;color:#f2f5f1;text-decoration:none;">
          Choose your password
        </a>
      </td></tr>
    </table>

    <p style="margin:0 0 28px;font-family:${SANS};font-size:13px;line-height:1.6;color:${INK_MUTE};">
      This link can only be used once and expires in ${escapeHtml(expiresIn)}. If the button does not work, paste this into your browser:<br>
      <a href="${input.actionUrl}" style="color:${PINE};word-break:break-all;">${escapeHtml(input.actionUrl)}</a>
    </p>

    <!-- What is inside -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${RULE};">
      <tr><td style="padding:22px 0 0;">
        <p style="margin:0 0 12px;font-family:${SANS};font-size:13px;font-weight:600;color:${INK};">What you will find there</p>
        ${contents
          .map(
            (item) =>
              `<p style="margin:0 0 7px;font-family:${SANS};font-size:14px;line-height:1.55;color:${INK_SOFT};">— ${item}</p>`,
          )
          .join("\n        ")}
      </td></tr>
    </table>

  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:22px 4px 0;">
    <p style="margin:0 0 10px;font-family:${SANS};font-size:13px;line-height:1.6;color:${INK_MUTE};">
      You are receiving this because someone at ${site.name} opened an account for this address. If you were not expecting it, ignore this email — the account cannot be used until a password is set — or tell us at
      <a href="mailto:${site.email}" style="color:${PINE};">${site.email}</a>.
    </p>
    <p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.6;color:${INK_MUTE};">
      ${escapeHtml(site.legalName)} · ${escapeHtml(site.address.line1)}, ${escapeHtml(site.address.locality)}<br>
      Licensed in the Dubai International Financial Centre
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    name ? `${name},` : "Hello,",
    "",
    isAdmin ? "Set up your admin account" : "Your client portal is ready",
    "",
    purpose.replace(/<[^>]+>/g, ""),
    "",
    "Choose your password:",
    input.actionUrl,
    "",
    `This link can only be used once and expires in ${expiresIn}.`,
    "",
    "What you will find there:",
    ...contents.map((item) => `  - ${item}`),
    "",
    `You are receiving this because someone at ${site.name} opened an account for this address. If you were not expecting it, ignore this email — the account cannot be used until a password is set — or tell us at ${site.email}.`,
    "",
    `${site.legalName}, ${site.address.line1}, ${site.address.locality}`,
    "Licensed in the Dubai International Financial Centre",
  ].join("\n");

  return { subject, html, text };
}
