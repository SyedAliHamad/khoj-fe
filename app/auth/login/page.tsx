"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const redirect = searchParams.get("redirect") ?? "/account"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    const res = await login({ email, password })
    if (res.success) {
      router.push(res.redirectTo ?? redirect)
    } else {
      setError(res.message)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="flex items-center justify-center px-6 py-20 md:py-32">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs tracking-[0.3em] uppercase text-muted-foreground">
              Welcome back
            </p>
            <h1 className="font-serif text-3xl md:text-4xl">Sign In</h1>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 border border-destructive/30 bg-destructive/5 px-4 py-3">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs tracking-[0.15em] uppercase text-muted-foreground"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-border bg-transparent px-4 py-3.5 text-sm outline-none transition-colors focus:border-foreground placeholder:text-muted-foreground/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs tracking-[0.15em] uppercase text-muted-foreground"
                >
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full border border-border bg-transparent px-4 py-3.5 pr-12 text-sm outline-none transition-colors focus:border-foreground"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 bg-foreground py-4 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
              {!isSubmitting && <ArrowRight className="h-3 w-3" />}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link
              href="/auth/register"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
            >
              Create one
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
