/**
 * SEO config and helpers - canonical base URL and defaults
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.khoj.com.pk"

export const DEFAULT_TITLE = "KHOJ - White Clothing | Minimalist Fashion Pakistan"
export const DEFAULT_DESCRIPTION =
  "Discover the art of white. Minimalist clothing crafted with intention. Premium quality, ethical fashion in Pakistan. Free shipping over PKR 5,000."
export const DEFAULT_KEYWORDS = [
  "white clothing",
  "minimalist fashion",
  "Pakistan fashion",
  "KHOJ clothing",
  "ethical fashion",
  "white dress",
  "minimal clothing",
  "Pakistani fashion brand",
]

export function absoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL.replace(/\/$/, "")}${p}`
}
