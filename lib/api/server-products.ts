/**
 * Server-side product fetcher for SEO (generateMetadata, sitemap).
 * Uses direct fetch - no auth required for public product endpoints.
 */
import type { ApiProduct } from "./types"

function getApiBase(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"
  return url.replace(/\/$/, "")
}

export async function getProductById(id: string): Promise<ApiProduct | null> {
  try {
    const base = getApiBase()
    const res = await fetch(`${base}/products/${id}`, {
      next: { revalidate: 60 },
    })
    const data = await res.json()
    return data?.code === 200 && data?.data ? data.data : null
  } catch {
    return null
  }
}

export async function getAllProductIds(): Promise<string[]> {
  try {
    const base = getApiBase()
    const ids: string[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const res = await fetch(
        `${base}/products?page=${page}&limit=100&sort=newest`,
        { next: { revalidate: 300 } }
      )
      const data = await res.json()

      if (data?.code !== 200 || !data?.data?.items?.length) {
        break
      }

      for (const p of data.data.items) {
        if (p?.id) ids.push(p.id)
      }

      const totalPages = data?.data?.totalPages ?? 1
      hasMore = page < totalPages
      page++
    }

    return ids
  } catch {
    return []
  }
}
