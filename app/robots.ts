import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL.replace(/\/$/, "")

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/account",
          "/account/*",
          "/orders",
          "/orders/*",
          "/auth/*",
          "/admin",
          "/admin/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/account",
          "/account/*",
          "/orders",
          "/orders/*",
          "/auth/*",
          "/admin",
          "/admin/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
