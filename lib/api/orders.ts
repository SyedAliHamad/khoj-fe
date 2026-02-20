import { api } from "./client"
import type {
  CreateOrderRequest,
  Order,
  PaginatedResponse,
} from "./types"

export const ordersApi = {
  create: (data: CreateOrderRequest) =>
    api.post<Order>("/orders", data),

  list: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<Order>>(`/orders?page=${page}&limit=${limit}`),

  getById: (id: string) => api.get<Order>(`/orders/${id}`),
}
