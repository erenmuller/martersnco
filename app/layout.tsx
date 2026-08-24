import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Schibsted_Grotesk,
  Inter,
  IBM_Plex_Mono,
} from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// Fraunces now earns its download on one word: the wordmark. Its italic
// ampersand is the identity mark, so the serif survives there and nowhere
// else. Page type moved to sans for legibility at long reading lengths.
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

// Display: a grotesque with tight apertures and real presence at 4rem, so
// headlines keep institutional weight without a serif's fussy detail.
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-schibsted",
});

// Body: chosen for x-height and open counters. This is the face people read
// three paragraphs of, so it is picked for stamina rather than character.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const viewport: Viewport = {
  themeColor: "#f5f3ed",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  generator: undefined,
  keywords: [
    "AI consultancy Dubai",
    "business process automation UAE",
    "DIFC AI consultancy",
    "SME automation Dubai",
    "AI implementation partner",
    "process mapping consultancy",
    "workflow automation Gulf",
    "custom software Dubai",
  ],
  category: "Business Services",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-AE"
      className={`${schibsted.variable} ${inter.variable} ${plexMono.variable} ${fraunces.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
