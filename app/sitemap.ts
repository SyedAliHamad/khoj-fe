import type { MetadataRoute } from "next"
import { getAllProductIds } from "@/lib/api/server-products"
import { SITE_URL, absoluteUrl } from "@/lib/seo"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL.replace(/\/$/, "")

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/collection"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/auth/login"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/auth/register"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  const ids = await getAllProductIds()
  const productPages: MetadataRoute.Sitemap = ids.map((id) => ({
    url: absoluteUrl(`/product/${id}`),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [...staticPages, ...productPages]
}
