import { api } from "./client"

export interface CategoryImage {
  slug: string
  name: string
  image: string
}

export interface HomepageContent {
  hero: {
    image: string
    subtitle: string
    title: string
    description: string
    ctaText: string
    ctaHref: string
  }
  lookbook: {
    image: string
    season: string
    title: string
    ctaText: string
    ctaHref: string
  }
  brand: {
    subtitle: string
    title: string
    tagline: string
  }
  categoryImages: CategoryImage[]
  backgroundColor: string
}

export const contentApi = {
  getHomepage: () => api.get<HomepageContent>("/content/homepage"),
}

export const adminContentApi = {
  getContent: () => api.get<HomepageContent>("/admin/content"),
  updateContent: (updates: { key: string; value: string }[]) =>
    api.patch<HomepageContent>("/admin/content", { updates }),
}
