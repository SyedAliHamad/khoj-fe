import { api } from "./client"
import type {
  Address,
  CreateUserAddressRequest,
  UpdateUserAddressRequest,
} from "./types"

export const addressesApi = {
  list: () => api.get<Address[]>("/addresses"),

  create: (data: CreateUserAddressRequest) =>
    api.post<Address>("/addresses", data),

  update: (id: string, data: UpdateUserAddressRequest) =>
    api.patch<Address>(`/addresses/${id}`, data),

  delete: (id: string) => api.delete<{ message: string }>(`/addresses/${id}`),

  setDefault: (id: string) =>
    api.post<{ message: string }>(`/addresses/${id}/default`),
}
