import { api } from "./client"
import type { Collection } from "./types"

export interface CreateCollectionRequest {
  name: string
  slug: string
  image?: string
  sortOrder?: number
}

export interface UpdateCollectionRequest {
  name?: string
  slug?: string
  image?: string
  sortOrder?: number
}

export const collectionsApi = {
  list: () => api.get<Collection[]>("/collections"),
}

export const adminCollectionsApi = {
  list: () => api.get<Collection[]>("/admin/collections"),
  create: (data: CreateCollectionRequest) =>
    api.post<Collection>("/admin/collections", {
      name: data.name,
      slug: data.slug,
      image: data.image ?? "",
      sortOrder: data.sortOrder ?? 0,
    }),
  update: (id: string, data: UpdateCollectionRequest) =>
    api.patch<Collection>(`/admin/collections/${id}`, data),
  delete: (id: string) =>
    api.delete<{ message: string }>(`/admin/collections/${id}`),
}
