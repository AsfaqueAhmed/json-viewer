import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://jsonstudio-app.web.app";
  const lastModified = new Date();

  const routes = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/diff", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/schema-validator", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/jsonpath", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/converter", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/repair", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/graph", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/table", priority: 0.8, changeFrequency: "weekly" as const },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
