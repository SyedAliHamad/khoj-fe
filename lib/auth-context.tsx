"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { authApi } from "@/lib/api/auth"
import { userApi } from "@/lib/api/user"
import { setAccessToken } from "@/lib/api/client"
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "@/lib/api/types"

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<{ success: boolean; message: string; redirectTo?: string }>
  register: (
    data: RegisterRequest
  ) => Promise<{ success: boolean; message: string; redirectTo?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount, try to refresh the session
  useEffect(() => {
    async function initAuth() {
      try {
        const refreshRes = await authApi.refresh()
        if (refreshRes.code === 200) {
          const profileRes = await userApi.getProfile()
          if (profileRes.code === 200 && profileRes.data) {
            setUser({
              id: profileRes.data.id,
              name: profileRes.data.name,
              email: profileRes.data.email,
              phone: profileRes.data.phone,
              avatarUrl: profileRes.data.avatarUrl,
              role: profileRes.data.role ?? "user",
            })
          }
        }
      } catch {
        // Not authenticated, that's fine
      } finally {
        setIsLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authApi.login(data)
    if (res.code === 200 && res.data) {
      setAccessToken(res.data.tokens.accessToken)
      setUser(res.data.user)
      const redirectTo = res.data.user.role === "admin" ? "/admin" : "/account"
      return { success: true, message: res.message, redirectTo }
    }
    return { success: false, message: res.message }
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await authApi.register(data)
    if (res.code === 201 && res.data) {
      setAccessToken(res.data.tokens.accessToken)
      setUser(res.data.user)
      const redirectTo = res.data.user.role === "admin" ? "/admin" : "/account"
      return { success: true, message: res.message, redirectTo }
    }
    return { success: false, message: res.message }
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
