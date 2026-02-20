import { api, setAccessToken } from "./client"
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "./types"

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/auth/register", data),

  login: async (data: LoginRequest) => {
    const res = await api.post<AuthResponse>("/auth/login", data)
    if (res.code === 200 && res.data) {
      setAccessToken(res.data.tokens.accessToken)
    }
    return res
  },

  refresh: async () => {
    const res = await api.post<{ accessToken: string }>("/auth/refresh")
    if (res.code === 200 && res.data) {
      setAccessToken(res.data.accessToken)
    }
    return res
  },

  logout: async () => {
    const res = await api.post<null>("/auth/logout")
    setAccessToken(null)
    return res
  },
}
