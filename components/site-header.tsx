"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Search, ShoppingBag, User, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { SHIPPING } from "@/lib/config"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { totalItems, openDrawer } = useCart()

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        {/* Announcement Bar */}
        <div className="border-b border-border bg-primary text-primary-foreground">
          <div className="flex items-center justify-center px-4 py-2">
            <p className="text-xs tracking-[0.2em] uppercase">
              Free shipping on orders above PKR{" "}
              {SHIPPING.freeThreshold.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Main Header */}
        <div className="border-b border-border">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            {/* Left Nav */}
            <nav className="hidden items-center gap-8 md:flex">
              <Link
                href="/collection"
                className="text-xs tracking-[0.15em] uppercase text-foreground/70 transition-colors hover:text-foreground"
              >
                Collection
              </Link>
              <Link
                href="/collection"
                className="text-xs tracking-[0.15em] uppercase text-foreground/70 transition-colors hover:text-foreground"
              >
                New Arrivals
              </Link>
              <Link
                href="#"
                className="text-xs tracking-[0.15em] uppercase text-foreground/70 transition-colors hover:text-foreground"
              >
                About
              </Link>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <h1 className="font-serif text-2xl tracking-[0.3em] md:text-3xl">
                KHOJ
              </h1>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
                className="text-foreground/70 transition-colors hover:text-foreground"
              >
                <Search className="h-4 w-4" />
              </button>
              <Link
                href="/account"
                className="hidden text-foreground/70 transition-colors hover:text-foreground md:block"
                aria-label="Account"
              >
                <User className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={openDrawer}
                className="relative text-foreground/70 transition-colors hover:text-foreground"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center bg-foreground text-[9px] text-background">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-b border-border bg-background px-6 py-4">
            <div className="mx-auto flex max-w-7xl items-center gap-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for products..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[calc(2.5rem+4rem)] z-40 bg-background md:hidden">
          <nav className="flex flex-col gap-1 px-6 py-8">
            {["Collection", "New Arrivals", "About"].map((item) => (
              <Link
                key={item}
                href={item === "About" ? "#" : "/collection"}
                className="border-b border-border py-4 text-sm tracking-[0.15em] uppercase text-foreground/80 transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
