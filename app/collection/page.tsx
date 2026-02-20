"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, SlidersHorizontal, X } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useCart } from "@/lib/cart-context"
import { productsApi } from "@/lib/api/products"
import { getProductImage } from "@/lib/products"
import type { ApiProduct, CategoryInfo } from "@/lib/api/types"

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Popular" },
]

function CollectionProductCard({ product }: { product: ApiProduct }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem } = useCart()
  const tag = product.tags?.[0] ?? null

  return (
    <div
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <Image
            src={getProductImage(product)}
            alt={product.images?.[0]?.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {tag && (
            <span className="absolute left-3 top-3 bg-foreground px-3 py-1 text-[10px] tracking-[0.15em] uppercase text-background">
              {tag}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setIsWishlisted(!isWishlisted)
            }}
            className={`absolute right-3 top-3 transition-opacity ${isHovered || isWishlisted ? "opacity-100" : "opacity-0"}`}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              className={`h-5 w-5 ${isWishlisted ? "fill-foreground text-foreground" : "text-foreground/70"}`}
            />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              const defaultSize = product.sizes[0] ?? "M"
              addItem(product, defaultSize)
            }}
            className={`absolute bottom-0 left-0 right-0 bg-foreground/90 py-3 text-center transition-all duration-300 ${isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
          >
            <span className="text-xs tracking-[0.2em] uppercase text-background">
              Add to Bag
            </span>
          </button>
        </div>
      </Link>
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-normal">{product.name}</h3>
        <p className="text-sm text-muted-foreground">
          PKR {product.price.toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default function CollectionPage() {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [activeSort, setActiveSort] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params: { category?: string; sort?: string } = {}
    if (activeFilter !== "all") params.category = activeFilter
    params.sort = activeSort

    productsApi
      .list(params)
      .then((res) => {
        if (res.code === 200 && res.data) {
          setProducts(res.data.items ?? [])
        } else {
          setError(res.message ?? "Failed to load products")
        }
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setIsLoading(false))
  }, [activeFilter, activeSort])

  useEffect(() => {
    productsApi
      .categories()
      .then((res) => {
        if (res.code === 200 && res.data) {
          setCategories(res.data)
        }
      })
      .catch(() => {})
  }, [])

  const filterOptions = [
    { value: "all", label: "All" },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ]

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <div className="px-6 pb-8 pt-16 text-center md:pt-24">
          <p className="mb-3 text-xs tracking-[0.3em] uppercase text-muted-foreground">
            Shop
          </p>
          <h1 className="font-serif text-4xl md:text-5xl">The Collection</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Every piece in pure white. Crafted from the finest fabrics with
            meticulous attention to detail.
          </p>
        </div>

        <div className="sticky top-[calc(2.5rem+4rem)] z-30 border-b border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <div className="hidden items-center gap-6 md:flex">
              {filterOptions.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`text-xs tracking-[0.15em] uppercase transition-colors ${
                    activeFilter === filter.value
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-foreground/70 md:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {products.length} pieces
              </span>
              <span className="text-muted-foreground">|</span>
              <select
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
                className="cursor-pointer bg-transparent text-xs tracking-[0.1em] uppercase text-foreground/70 outline-none"
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="border-b border-border bg-background px-6 py-4 md:hidden">
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs tracking-[0.15em] uppercase">
                Filter By
              </span>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter.value)
                    setShowFilters(false)
                  }}
                  className={`border px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors ${
                    activeFilter === filter.value
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground/70 hover:border-foreground"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 py-12 md:py-16">
          <div className="mx-auto max-w-7xl">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse bg-muted" />
                ))}
              </div>
            ) : error ? (
              <p className="text-center text-sm text-muted-foreground">
                {error}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
                {products.map((product) => (
                  <CollectionProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
