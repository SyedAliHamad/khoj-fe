/**
 * Placeholder for missing images.
 * Seed data uses /images/* paths that were never deployed.
 */
const PLACEHOLDER = "/placeholder.svg"

/** Use placeholder for non-existent /images/* seed paths */
export function getDisplayImageUrl(url: string | undefined): string {
  if (!url) return PLACEHOLDER
  if (url.startsWith("/images/")) return PLACEHOLDER
  return url
}
