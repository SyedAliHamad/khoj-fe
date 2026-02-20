"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User,
  Package,
  MapPin,
  LogOut,
  ArrowRight,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const ACCOUNT_LINKS = [
  {
    href: "/orders",
    icon: Package,
    label: "My Orders",
    description: "Track your orders and view history",
  },
  {
    href: "/account/addresses",
    icon: MapPin,
    label: "Addresses",
    description: "Manage your shipping addresses",
  },
]

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()

  // Redirect admins to admin portal
  if (!isLoading && user?.role === "admin") {
    router.replace("/admin")
    return null
  }

  // Show login prompt for unauthenticated users
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="flex flex-col items-center justify-center px-6 py-20 md:py-32">
          <User className="mb-6 h-16 w-16 text-muted-foreground/30" />
          <h1 className="mb-2 font-serif text-3xl">Welcome to KHOJ</h1>
          <p className="mb-8 max-w-sm text-center text-sm text-muted-foreground">
            Sign in to view your orders, manage your account, and access
            exclusive features.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 bg-foreground px-10 py-4 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90"
            >
              Sign In
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 border border-foreground px-10 py-4 text-xs tracking-[0.2em] uppercase text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Create Account
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const displayName = user?.name || "Guest"
  const displayEmail = user?.email || ""
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  async function handleLogout() {
    await logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        {/* Header */}
        <div className="px-6 pb-8 pt-16 text-center md:pt-24">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-foreground text-lg text-background">
            {initials}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl">{displayName}</h1>
          {displayEmail && (
            <p className="mt-2 text-sm text-muted-foreground">
              {displayEmail}
            </p>
          )}
        </div>

        <div className="mx-auto max-w-2xl px-6 pb-20 md:pb-32">
          {/* Account Links */}
          <div className="space-y-3">
            {ACCOUNT_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="group flex items-center gap-4 border border-border p-5 transition-colors hover:border-foreground/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-muted text-muted-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{link.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              )
            })}
          </div>

          {/* Logout */}
          <div className="mt-8 border-t border-border pt-8">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 border border-border py-4 text-xs tracking-[0.15em] uppercase text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
