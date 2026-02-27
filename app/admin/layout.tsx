"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Package, LogOut, LayoutDashboard, ImageIcon, ExternalLink, Tags } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !user) {
      router.replace("/auth/login?redirect=/admin")
      return
    }
    if (user.role !== "admin") {
      router.replace("/")
      return
    }
  }, [user, isLoading, isAuthenticated, router])

  async function handleLogout() {
    await logout()
    router.replace("/auth/login")
  }

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-border bg-card">
        <div className="flex h-16 shrink-0 items-center border-b border-border px-6">
          <Link href="/admin" className="font-serif text-xl tracking-widest">
            KHOJ Admin
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            View Main Site
          </Link>
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
              pathname === "/admin"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
              pathname?.startsWith("/admin/products")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Package className="h-4 w-4" />
            Products
          </Link>
          <Link
            href="/admin/collections"
            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
              pathname?.startsWith("/admin/collections")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Tags className="h-4 w-4" />
            Collections
          </Link>
          <Link
            href="/admin/content"
            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
              pathname?.startsWith("/admin/content")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            Homepage Content
          </Link>
        </nav>
        <div className="shrink-0 border-t border-border p-4">
          <div className="mb-2 px-4 text-xs text-muted-foreground">
            {user.email}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
