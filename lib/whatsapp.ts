import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";

/**
 * WhatsApp OTP — infrastructure only.
 *
 * Nothing in the running app calls this yet. It exists so that turning on
 * WhatsApp as a second factor later is a provider swap plus a UI, not a
 * schema migration. The `otp_challenges` table it writes to already ships in
 * the migrations.
 *
 * To go live:
 *   1. Create a Meta WhatsApp Business account and an approved message
 *      template with one variable (the code).
 *   2. Set WHATSAPP_PROVIDER=meta plus the four META_* variables.
 *   3. Build the two screens: request code, then verify code.
 *
 * Codes are stored as SHA-256 hashes with a per-row salt, never in plaintext.
 */

export const OTP_LENGTH = 6;
export const OTP_TTL_SECONDS = 300;
export const OTP_MAX_ATTEMPTS = 5;

export type OtpPurpose = "login" | "enrol" | "step_up";

export interface SendResult {
  ok: boolean;
  /** Provider-side message id, when the provider returns one. */
  reference?: string;
  error?: string;
}

export interface WhatsAppProvider {
  readonly id: string;
  sendOtp(phoneE164: string, code: string): Promise<SendResult>;
}

/**
 * Default provider. Logs instead of sending so local development and preview
 * deploys never hit a paid API or message a real number.
 */
class ConsoleProvider implements WhatsAppProvider {
  readonly id = "console";

  async sendOtp(phoneE164: string, code: string): Promise<SendResult> {
    console.info(
      `[whatsapp:console] would send code ${code} to ${maskPhone(phoneE164)}`,
    );
    return { ok: true, reference: `console-${Date.now()}` };
  }
}

/** Meta WhatsApp Cloud API. Wired but unused until WHATSAPP_PROVIDER=meta. */
class MetaCloudProvider implements WhatsAppProvider {
  readonly id = "meta";

  async sendOtp(phoneE164: string, code: string): Promise<SendResult> {
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.META_WHATSAPP_TOKEN;
    const template = process.env.META_WHATSAPP_TEMPLATE ?? "otp_code";
    const locale = process.env.META_WHATSAPP_TEMPLATE_LOCALE ?? "en";

    if (!phoneNumberId || !token) {
      return { ok: false, error: "Meta WhatsApp credentials are not set." };
    }

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneE164.replace(/^\+/, ""),
          type: "template",
          template: {
            name: template,
            language: { code: locale },
            components: [
              {
                type: "body",
                parameters: [{ type: "text", text: code }],
              },
              {
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [{ type: "text", text: code }],
              },
            ],
          },
        }),
      },
    );

    if (!res.ok) {
      const detail = await res.text();
      return { ok: false, error: `Meta API ${res.status}: ${detail.slice(0, 300)}` };
    }

    const json = (await res.json()) as { messages?: { id: string }[] };
    return { ok: true, reference: json.messages?.[0]?.id };
  }
}

export function getWhatsAppProvider(): WhatsAppProvider {
  return process.env.WHATSAPP_PROVIDER === "meta"
    ? new MetaCloudProvider()
    : new ConsoleProvider();
}

/* -------------------------------------------------------------------------
   Code generation and verification
   ------------------------------------------------------------------------- */

/** Cryptographically random numeric code, zero-padded to OTP_LENGTH. */
export function generateOtp(): string {
  const max = 10 ** OTP_LENGTH;
  return String(randomInt(0, max)).padStart(OTP_LENGTH, "0");
}

export function hashOtp(code: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${code}`).digest("hex");
}

/** Constant-time compare, so a wrong code leaks nothing through timing. */
export function verifyOtpHash(
  code: string,
  salt: string,
  expectedHash: string,
): boolean {
  const actual = Buffer.from(hashOtp(code, salt), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

/**
 * Accepts E.164 only: a leading + then 8–15 digits. Deliberately strict —
 * the UAE numbers this will mostly see are +9715XXXXXXXX.
 */
export function normalisePhone(input: string): string | null {
  const trimmed = input.replace(/[\s()\-.]/g, "");
  return /^\+[1-9]\d{7,14}$/.test(trimmed) ? trimmed : null;
}

export function maskPhone(phoneE164: string): string {
  return phoneE164.length <= 4
    ? phoneE164
    : `${phoneE164.slice(0, 4)}${"•".repeat(Math.max(0, phoneE164.length - 6))}${phoneE164.slice(-2)}`;
}
