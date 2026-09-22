import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import JsonLd from "@/components/JsonLd";
import WhatsAppBubble from "@/components/WhatsAppBubble";
import DiscoveryAuditBanner from "@/components/DiscoveryAuditBanner";
import bannerStyles from "@/components/discovery-audit-banner.module.css";
import { site } from "@/lib/site";
import { marketingServices } from "@/lib/marketing-services";

const organisation = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${site.url}/#organisation`,
  name: site.name,
  legalName: site.legalName,
  description: site.description,
  alternateName: ["Marters and Co", "Marters & Co"],
  url: site.url,
  logo: `${site.url}/icon.svg`,
  image: `${site.url}/opengraph-image`,
  email: site.email,
  ...(site.phoneE164 ? { telephone: site.phoneE164 } : {}),
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: site.email,
    ...(site.phoneE164 ? { telephone: site.phoneE164 } : {}),
    availableLanguage: ["English"],
    areaServed: ["AE", "SA", "QA", "KW", "BH", "OM"],
  },
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
    "Artificial intelligence for small and mid-sized businesses",
    "Process mapping and discovery audits",
    "Systems and ERP integration",
    "Custom software development",
    "Document data extraction with AI",
    "Staff training and AI workshops",
  ],
  makesOffer: marketingServices.map((service) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: service.title,
      description: service.description,
      url: `${site.url}/services#${service.id}`,
    },
  })),
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`marketing-site ${bannerStyles.site}`}>
      <JsonLd data={organisation} />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <DiscoveryAuditBanner />
      <WhatsAppBubble />
    </div>
  );
}
