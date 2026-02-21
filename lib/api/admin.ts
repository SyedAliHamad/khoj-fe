import { api, getAccessToken, getApiBaseUrl } from "./client"
import type {
  ApiProduct,
  CreateProductRequest,
  PaginatedResponse,
  ProductImage,
  SizeGuideEntry,
  UpdateProductRequest,
} from "./types"

export const adminApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    const token = getAccessToken()
    const res = await fetch(`${getApiBaseUrl()}/admin/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
      body: formData,
    })
    const data = await res.json()
    return data as { code: number; data: { url: string } | null; message: string }
  },
  listProducts: () =>
    api.get<PaginatedResponse<ApiProduct>>("/admin/products"),

  getProduct: (id: string) => api.get<ApiProduct>(`/admin/products/${id}`),

  createProduct: (data: CreateProductRequest) =>
    api.post<ApiProduct>("/admin/products", data),

  updateProduct: (id: string, data: Partial<UpdateProductRequest>) =>
    api.patch<ApiProduct>(`/admin/products/${id}`, data),

  deleteProduct: (id: string) =>
    api.delete<{ message: string }>(`/admin/products/${id}`),
}

// Helper to build create/update payload from form
export function toCreateProductRequest(form: {
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  category: string
  description: string
  fabric: string
  inStock: boolean
  images: { url: string; alt: string }[]
  details: string[]
  sizes: string[]
  sizeGuide: SizeGuideEntry[]
  tags: string[]
  stockBySize: Record<string, number>
}): CreateProductRequest {
  return {
    name: form.name,
    slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
    price: form.price,
    compareAtPrice: form.compareAtPrice || undefined,
    category: form.category,
    description: form.description,
    fabric: form.fabric,
    inStock: form.inStock,
    images: form.images.map((img) => ({ id: "", url: img.url, alt: img.alt })),
    details: form.details.filter(Boolean),
    sizes: form.sizes,
    sizeGuide: form.sizeGuide,
    tags: form.tags,
    stockBySize: form.stockBySize,
  }
}
