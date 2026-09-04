import "server-only";

/**
 * Transactional email.
 *
 * Supabase can send invite and recovery mail itself, but its templates are
 * configured in a dashboard, are hard to keep in step with the site, and the
 * default styling does not look like anything this firm would post. So the
 * app owns the message: it asks Supabase for the action link only (see
 * `generateLink` in app/admin/actions.ts) and sends its own mail through a
 * provider configured here.
 *
 * Providers follow the same shape as lib/whatsapp.ts: `console` is the
 * default so local development and preview deploys never send real mail to a
 * real person.
 *
 * To go live, set EMAIL_PROVIDER=resend, RESEND_API_KEY and EMAIL_FROM.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  /** Always send a text part. Some clients show it, and spam filters read it. */
  text: string;
  replyTo?: string;
}

export interface EmailResult {
  ok: boolean;
  /** Provider-side message id, when the provider returns one. */
  reference?: string;
  error?: string;
}

export interface EmailProvider {
  readonly id: string;
  send(message: EmailMessage): Promise<EmailResult>;
}

/**
 * Default provider. Prints the message and the links inside it rather than
 * sending, so an invite can be completed locally without an email account.
 */
class ConsoleProvider implements EmailProvider {
  readonly id = "console";

  async send(message: EmailMessage): Promise<EmailResult> {
    const links = [...message.html.matchAll(/href="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((href) => href.startsWith("http"));

    console.info(
      [
        "",
        "──────────────────────────────────────────────────────────────",
        `[email:console] would send to ${message.to}`,
        `  subject: ${message.subject}`,
        ...(links.length ? ["  links:", ...links.map((l) => `    ${l}`)] : []),
        "──────────────────────────────────────────────────────────────",
        "",
      ].join("\n"),
    );

    return { ok: true, reference: `console-${Date.now()}` };
  }
}

/** Resend. HTTP only, so it needs no extra dependency. */
class ResendProvider implements EmailProvider {
  readonly id = "resend";

  async send(message: EmailMessage): Promise<EmailResult> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      return {
        ok: false,
        error: "RESEND_API_KEY and EMAIL_FROM must both be set.",
      };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
          ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { id?: string; message?: string; name?: string }
        | null;

      if (!response.ok) {
        return {
          ok: false,
          error:
            payload?.message ??
            `Resend rejected the message (HTTP ${response.status}).`,
        };
      }

      return { ok: true, reference: payload?.id };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Network error.",
      };
    }
  }
}

function selectProvider(): EmailProvider {
  switch (process.env.EMAIL_PROVIDER?.trim().toLowerCase()) {
    case "resend":
      return new ResendProvider();
    default:
      return new ConsoleProvider();
  }
}

/** True when mail will actually leave the building. */
export function emailIsLive(): boolean {
  return selectProvider().id !== "console";
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const provider = selectProvider();
  const replyTo =
    message.replyTo ?? process.env.EMAIL_REPLY_TO?.trim() ?? undefined;

  const result = await provider.send({ ...message, replyTo });

  // A failed send is never fatal to the caller — an invited user still exists
  // and the link can be re-sent — but it must be visible in the logs.
  if (!result.ok) {
    console.error(`[email:${provider.id}] ${result.error ?? "send failed"}`);
  }

  return result;
}
