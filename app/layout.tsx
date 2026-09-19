import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Public_Sans,
  IBM_Plex_Mono,
} from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// Wordmark and monograms only — never a heading, never a sentence.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-cormorant",
});

// Headings and body. Chosen for legibility for non-native English readers.
const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

// Eyebrows, step numbers, footers, the licence line. Never body copy.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const viewport: Viewport = {
  themeColor: "#f6f5f0",
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
      className={`${publicSans.variable} ${plexMono.variable} ${cormorant.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
