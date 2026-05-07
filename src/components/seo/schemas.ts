/**
 * Schema.org Vorlagen für Microvista
 */

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "@id": "https://microvista.de/#organization",
  "name": "Microvista GmbH",
  "legalName": "Microvista GmbH",
  "url": "https://microvista.de",
  "logo": {
    "@type": "ImageObject",
    "url": "https://microvista.de/images/logos/2013-08-microvista_Logo_RGB-7.png",
    "width": 705,
    "height": 399
  },
  "image": "https://microvista.de/images/wp/2025/10/Microvista-Industrieller-CT-Container-Truck-ScanExpress-4K-1024x576.jpg",
  "description": "Industrielle Computertomographie für Labor und Serie. ISO 9001 zertifiziert, TISAX 27001 in Zertifizierung. Automatisierte CT-Auswertung mit InspectVista.",
  "slogan": "GET YOUR INSPECTION DONE – Anywhere. Anytime. Fast.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Am Münchenfelde 12",
    "postalCode": "38889",
    "addressLocality": "Blankenburg",
    "addressRegion": "Sachsen-Anhalt",
    "addressCountry": "DE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 51.791,
    "longitude": 10.959
  },
  "telephone": "+49-3944-950-36",
  "email": "vertrieb@microvista.de",
  "hasCredential": [
    { "@type": "EducationalOccupationalCredential", "name": "ISO 9001" },
    { "@type": "EducationalOccupationalCredential", "name": "TISAX (ISO/IEC 27001)" }
  ],
  "knowsAbout": [
    "Industrielle Computertomographie",
    "Zerstörungsfreie Prüfung",
    "Erstmusterprüfung",
    "Hairpin-Stator-Prüfung",
    "Porositätsanalyse",
    "CAD Soll-Ist-Vergleich",
    "Reverse Engineering",
    "Mobile CT"
  ],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+49-3944-950-36",
      "email": "vertrieb@microvista.de",
      "contactType": "sales",
      "areaServed": ["DE", "EU"],
      "availableLanguage": ["de", "en", "fr", "es", "it"]
    }
  ],
  "sameAs": [
    "https://www.linkedin.com/company/microvista-gmbh",
    "https://www.instagram.com/netco_microvista/"
  ]
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Microvista",
  "url": "https://microvista.de",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://microvista.de/suche?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export function articleSchema(options: {
  title: string;
  description: string;
  url: string;
  image: string;
  publishDate: Date;
  modifiedDate?: Date;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": options.title,
    "description": options.description,
    "url": options.url,
    "image": options.image,
    "datePublished": options.publishDate.toISOString(),
    "dateModified": (options.modifiedDate || options.publishDate).toISOString(),
    "author": {
      "@type": "Organization",
      "name": options.author || "Microvista"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Microvista",
      "logo": {
        "@type": "ImageObject",
        "url": "https://microvista.de/images/logos/2013-08-microvista_Logo_RGB-7.png"
      }
    }
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function serviceSchema(options: {
  name: string;
  description: string;
  url: string;
  image?: string;
  serviceType?: string;
  areaServed?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": options.name,
    "description": options.description,
    "url": options.url,
    "provider": { "@id": "https://microvista.de/#organization" },
    "areaServed": options.areaServed ?? ["DE", "AT", "CH", "EU"],
    ...(options.serviceType && { "serviceType": options.serviceType }),
    ...(options.image && { "image": options.image })
  };
}

export function softwareApplicationSchema(options: {
  name: string;
  description: string;
  url: string;
  image?: string;
  featureList?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": options.name,
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Industrial CT Evaluation Software",
    "operatingSystem": "Web Browser",
    "description": options.description,
    "url": options.url,
    "provider": { "@id": "https://microvista.de/#organization" },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "EUR",
      "price": "0",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "0",
        "priceCurrency": "EUR",
        "description": "Preis auf Anfrage — Jahreslizenz mit allen Modulen, Updates und Support inklusive."
      }
    },
    ...(options.image && { "image": options.image }),
    ...(options.featureList && { "featureList": options.featureList })
  };
}
