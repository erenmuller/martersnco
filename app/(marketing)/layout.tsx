import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import { site } from "@/lib/site";

const organisation = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${site.url}/#organisation`,
  name: site.name,
  legalName: site.legalName,
  description: site.description,
  url: site.url,
  email: site.email,
  foundingDate: site.founded,
  slogan: site.tagline,
  areaServed: [
    { "@type": "Country", name: "United Arab Emirates" },
    { "@type": "Place", name: "Gulf Cooperation Council" },
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.line1,
    addressLocality: site.address.locality,
    addressCountry: site.address.country,
  },
  ...(site.difc.licenceNumber
    ? {
        identifier: {
          "@type": "PropertyValue",
          name: "DIFC commercial licence",
          value: site.difc.licenceNumber,
        },
      }
    : {}),
  knowsAbout: [
    "Business process automation",
    "Process mapping and identification",
    "AI workflow design",
    "Systems integration",
    "Custom software development",
    "Data infrastructure",
    "Staff training and enablement",
  ],
  makesOffer: [
    "Process audit and mapping",
    "Automation opportunity assessment",
    "Automation build and rollout",
    "AI workflow programmes",
    "Custom application and infrastructure builds",
    "Team enablement",
  ].map((name) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name },
  })),
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={organisation} />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
