import type { Metadata, Viewport } from "next";
import { Inter, Fira_Code, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const siteUrl = "https://jsonstudio-app.web.app";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#1e1e1e" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JSON Studio — Free Online JSON Viewer, Editor & Tools",
    template: "%s",
  },
  description:
    "Ultra-fast, 100% private in-browser JSON Viewer, Monaco-powered Editor, Side-by-Side Diff Comparer, Schema Validator, JSONPath Query Studio, TypeScript/YAML/CSV/XML Type Generator, and Auto-Repair Tool.",
  keywords: [
    "json viewer",
    "json diff",
    "json compare",
    "json editor",
    "json repair",
    "json to typescript",
    "json schema validator",
    "jsonpath",
    "json converter",
    "json to yaml",
    "json to csv",
    "json to xml",
    "online json formatter",
    "json beautifier",
    "json minifier",
    "json fixer",
    "monaco json editor",
    "visual json tree",
    "json node graph",
  ],
  authors: [{ name: "JSON Studio", url: siteUrl }],
  creator: "JSON Studio",
  publisher: "JSON Studio",
  applicationName: "JSON Studio",
  category: "Developer Tools",
  classification: "Web Application / Developer Productivity",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "JSON Studio — Modern JSON Viewer, Comparer, Editor & Developer Suite",
    description:
      "High-performance Monaco-powered JSON Viewer, Side-by-Side Diff, Schema Validator, JSONPath Studio, TypeScript Generator, and Auto-Repair Tool.",
    siteName: "JSON Studio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JSON Studio — Professional Developer Suite for JSON",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Studio — Modern JSON Viewer, Comparer, Editor & Developer Suite",
    description:
      "Ultra-fast, 100% private in-browser JSON Viewer, Diff Comparer, Schema Validator, JSONPath Studio, and Auto-Repair.",
    images: ["/og-image.png"],
    creator: "@jsonstudio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.webmanifest",
  verification: {
    google: "google3318945ee6839373",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdWebApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "JSON Studio",
    url: siteUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    browserRequirements: "Requires modern web browser with WebAssembly and JavaScript support",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "High-performance VS Code-inspired JSON Viewer, Comparer, Editor, Schema Validator, JSONPath Query, Type Generator, and Auto-Repair Tool.",
    featureList: [
      "Monaco-powered JSON Editor with autocomplete and bracket matching",
      "Interactive Collapsible Tree Viewer with search & filter",
      "Side-by-side JSON Diff & Comparison Engine",
      "JSON Auto-Repair for broken syntax and malformed quotes",
      "Multi-format Converter: JSON to TypeScript, YAML, CSV, and XML",
      "AJV-based Draft-07 JSON Schema Validation & Template Generator",
      "JSONPath Query Studio with real-time selector testing",
      "Visual Node Graph Hierarchy Visualizer",
      "100% Client-side sandbox privacy (No server-side data retention)",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "380",
      bestRating: "5",
      worstRating: "1",
    },
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is my JSON data secure and private on JSON Studio?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, 100%. JSON Studio is a completely client-side web application. All parsing, validation, formatting, auto-repair, and conversions happen directly in your browser. No JSON payloads or confidential data are ever transmitted to or stored on external servers.",
        },
      },
      {
        "@type": "Question",
        name: "How do I compare two JSON files to find differences?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Switch to the 'Diff & Compare' view in JSON Studio. Paste or load your original JSON on the left and modified JSON on the right to see side-by-side semantic differences, additions, deletions, and value changes highlighted.",
        },
      },
      {
        "@type": "Question",
        name: "Can JSON Studio repair malformed or broken JSON?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the built-in Auto-Repair studio uses advanced heuristics to automatically fix unquoted keys, single quotes, trailing commas, missing brackets, unescaped characters, and truncated responses.",
        },
      },
      {
        "@type": "Question",
        name: "How to convert JSON to TypeScript interfaces?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Navigate to the Converter view in JSON Studio and select TypeScript. The tool generates strongly typed TypeScript interfaces with optional field detection, ready to copy or export.",
        },
      },
    ],
  };

  const jsonLdHowTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Format, Validate, and Repair JSON with JSON Studio",
    description: "Step-by-step instructions to beautify, inspect, validate, and fix JSON documents online.",
    step: [
      {
        "@type": "HowToStep",
        name: "Paste or Load JSON",
        text: "Paste your raw JSON into the Monaco editor, upload a .json file, or load from a public URL.",
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: "Format and Beautify",
        text: "Click Format (Shift+Alt+F) to structure the JSON with clean indentation (2 spaces, 4 spaces, or tabs).",
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: "Inspect in Tree or Graph View",
        text: "Switch to Tree or Node Graph view to explore nested objects, arrays, and property values interactively.",
        position: 3,
      },
      {
        "@type": "HowToStep",
        name: "Validate or Convert",
        text: "Use the Schema Validator to verify structure against Draft-07 schemas, or convert to TypeScript, YAML, CSV, or XML.",
        position: 4,
      },
    ],
  };

  return (
    <html lang="en" data-theme="vscode-dark" suppressHydrationWarning>
      <head>
        {/* Structured Data: WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebApp) }}
        />
        {/* Structured Data: FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
        {/* Structured Data: HowTo */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
        />
      </head>
      <body className={`${inter.variable} ${firaCode.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
