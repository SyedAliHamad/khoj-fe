"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsSubmitting(true)
    const res = await register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    })
    if (res.success) {
      router.push(res.redirectTo ?? "/account")
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
              Join KHOJ
            </p>
            <h1 className="font-serif text-3xl md:text-4xl">Create Account</h1>
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
                htmlFor="name"
                className="mb-2 block text-xs tracking-[0.15em] uppercase text-muted-foreground"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
                autoComplete="name"
                className="w-full border border-border bg-transparent px-4 py-3.5 text-sm outline-none transition-colors focus:border-foreground placeholder:text-muted-foreground/50"
                placeholder="Your full name"
              />
            </div>

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
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-border bg-transparent px-4 py-3.5 text-sm outline-none transition-colors focus:border-foreground placeholder:text-muted-foreground/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-xs tracking-[0.15em] uppercase text-muted-foreground"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                required
                autoComplete="tel"
                className="w-full border border-border bg-transparent px-4 py-3.5 text-sm outline-none transition-colors focus:border-foreground placeholder:text-muted-foreground/50"
                placeholder="+92 300 1234567"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs tracking-[0.15em] uppercase text-muted-foreground"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full border border-border bg-transparent px-4 py-3.5 pr-12 text-sm outline-none transition-colors focus:border-foreground"
                  placeholder="Min. 8 characters"
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-xs tracking-[0.15em] uppercase text-muted-foreground"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                required
                autoComplete="new-password"
                className="w-full border border-border bg-transparent px-4 py-3.5 text-sm outline-none transition-colors focus:border-foreground"
                placeholder="Re-enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 bg-foreground py-4 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
              {!isSubmitting && <ArrowRight className="h-3 w-3" />}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-[11px] text-muted-foreground leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link href="#" className="underline underline-offset-2">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline underline-offset-2">
              Privacy Policy
            </Link>
          </p>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
