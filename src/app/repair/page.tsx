import type { Metadata } from "next";
import { JsonStudioApp } from "@/components/JsonStudioApp";
import {
  TOOLS_CONFIG,
  getSoftwareAppSchema,
  getFaqSchema,
  getBreadcrumbSchema,
} from "@/lib/seo-schemas";

const config = TOOLS_CONFIG.repair;

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  keywords: config.keywords,
  alternates: {
    canonical: "/repair",
  },
  openGraph: {
    title: config.title,
    description: config.description,
    url: "https://jsonstudio-app.web.app/repair",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: config.headline }],
  },
  twitter: {
    title: config.title,
    description: config.description,
    images: ["/og-image.png"],
  },
};

export default function RepairPage() {
  const softwareSchema = getSoftwareAppSchema(config);
  const faqSchema = getFaqSchema(config.faqs);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: config.name, path: config.path },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <JsonStudioApp initialView="repair" currentToolKey="repair" />
    </>
  );
}
