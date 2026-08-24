import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  // WONK gives Fraunces its angled terminals at display sizes; SOFT 0 keeps
  // the corners sharp so it reads institutional rather than artisanal.
  axes: ["SOFT", "WONK", "opsz"],
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
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
      className={`${fraunces.variable} ${instrument.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
