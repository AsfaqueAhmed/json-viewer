import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JSON Studio — Modern JSON Viewer, Comparer, Editor & Developer Suite",
  description: "High-performance VS Code-inspired JSON Viewer, Comparer, Editor, Schema Validator, JSONPath Query, Type Generator, and Auto-Repair Tool.",
  keywords: ["json viewer", "json diff", "json compare", "json editor", "json repair", "json to typescript", "json schema validator", "jsonpath", "json converter"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="vscode-dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
