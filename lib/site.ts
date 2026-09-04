/** Single source of truth for firm details used across metadata and pages. */

const contactPhoneDisplay =
  process.env.NEXT_PUBLIC_PHONE_DISPLAY?.trim() || null;
const contactPhoneE164 = process.env.NEXT_PUBLIC_PHONE_E164?.trim() || null;
const difcLicenceNumber =
  process.env.NEXT_PUBLIC_DIFC_LICENCE?.trim() || null;
const legalName =
  process.env.NEXT_PUBLIC_LEGAL_NAME?.trim() || "Marters & Co.";
// An env var that is present but blank must fall back like a missing one, or
// `new URL(site.url)` in the root layout throws and the whole build fails.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
  "https://martersandco.com";

export const site = {
  name: "Marters & Co.",
  legalName,
  tagline: "AI and automation consultancy for SMEs",
  description:
    "Marters & Co. helps SMEs discover where AI and automation can save staff time and reduce errors, then builds the custom software to make it happen.",
  url: siteUrl,
  email:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    "hello@martersandco.com",
  // Phone is optional until the real business number is configured. A missing
  // number is preferable to publishing a plausible-looking placeholder.
  phoneDisplay: contactPhoneDisplay,
  phoneE164: contactPhoneE164,
  founded: "2026",
  address: {
    line1: "Dubai International Financial Centre",
    locality: "Dubai",
    country: "AE",
    countryName: "United Arab Emirates",
  },
  difc: {
    /** Set to the number printed on the firm's DIFC commercial licence. */
    licenceNumber: difcLicenceNumber,
    licenceDisplay: difcLicenceNumber ?? "Available on request",
    registry: "DIFC Registrar of Companies",
  },
} as const;

export const nav = [
  { href: "/services", label: "Services" },
  { href: "/approach", label: "Approach" },
  { href: "/about", label: "About" },
] as const;
