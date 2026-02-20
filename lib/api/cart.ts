import { api } from "./client"
import type {
  AddToCartRequest,
  Cart,
  UpdateCartItemRequest,
} from "./types"

export const cartApi = {
  get: () => api.get<Cart>("/cart"),

  addItem: (data: AddToCartRequest) =>
    api.post<Cart>("/cart/items", data),

  updateItem: (itemId: string, data: UpdateCartItemRequest) =>
    api.patch<Cart>(`/cart/items/${itemId}`, data),

  removeItem: (itemId: string) =>
    api.delete<Cart>(`/cart/items/${itemId}`),

  clear: () => api.delete<null>("/cart"),
}
