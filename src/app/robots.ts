import type { MetadataRoute } from "next";

const SITE_URL = "https://offerteflits.online";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/api/", "/auth/", "/uitschrijven/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
