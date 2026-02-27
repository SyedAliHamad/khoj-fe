import { api } from "./client"
import type {
  ApiProduct,
  CategoryInfo,
  PaginatedResponse,
  ProductListParams,
} from "./types"

export const productsApi = {
  list: (params?: ProductListParams) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.limit) searchParams.set("limit", String(params.limit))
    if (params?.category) searchParams.set("category", params.category)
    if (params?.collection) searchParams.set("collection", params.collection)
    if (params?.sort) searchParams.set("sort", params.sort)
    if (params?.search) searchParams.set("search", params.search)
    const qs = searchParams.toString()
    return api.get<PaginatedResponse<ApiProduct>>(
      `/products${qs ? `?${qs}` : ""}`
    )
  },

  getById: (id: string) => api.get<ApiProduct>(`/products/${id}`),

  featured: () => api.get<ApiProduct[]>("/products/featured"),

  categories: () => api.get<CategoryInfo[]>("/products/categories"),
}
