import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JSON Studio — Developer JSON Suite",
    short_name: "JSON Studio",
    description: "High-performance VS Code-inspired JSON Viewer, Comparer, Editor, Schema Validator, JSONPath Query, Type Generator, and Auto-Repair Tool.",
    start_url: "/",
    display: "standalone",
    background_color: "#1e1e1e",
    theme_color: "#007acc",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
