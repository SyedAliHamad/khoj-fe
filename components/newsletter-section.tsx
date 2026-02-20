"use client"

import React, { useState } from "react"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { newsletterApi } from "@/lib/api/newsletter"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isLoading) return

    setIsLoading(true)
    try {
      const res = await newsletterApi.subscribe(email)
      if (res.code === 200 || res.code === 201) {
        setSubmitted(true)
        setEmail("")
      } else {
        toast.error(res.message ?? "Failed to subscribe")
      }
    } catch {
      toast.error("Failed to subscribe")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="border-t border-border px-6 py-20 md:py-32">
      <div className="mx-auto max-w-xl text-center">
        <p className="mb-3 text-xs tracking-[0.3em] uppercase text-muted-foreground">
          Stay Connected
        </p>
        <h2 className="mb-4 font-serif text-3xl md:text-4xl">
          Join the Journey
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          Be the first to know about new collections, exclusive offers, and the
          stories behind our craft.
        </p>
        {submitted ? (
          <p className="text-sm text-foreground">
            Thank you for subscribing. Welcome to KHOJ.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-sm items-center border-b border-foreground"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              required
              aria-label="Email address"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="py-3 pl-4 text-foreground transition-colors hover:text-foreground/70 disabled:opacity-50"
              aria-label="Subscribe"
              disabled={isLoading}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
