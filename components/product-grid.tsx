"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ArrowRight } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { productsApi } from "@/lib/api/products"
import { getProductImage, getProductPricing } from "@/lib/products"
import { ProductPrice } from "@/components/product-price"
import type { ApiProduct } from "@/lib/api/types"

function ProductCard({ product }: { product: ApiProduct }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem } = useCart()
  const [primaryImage] = product.images
  const tag = product.tags?.[0] ?? null
  const { isOnSale, discountPercent } = getProductPricing(product)

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
            alt={primaryImage?.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {isOnSale ? (
            <span className="absolute left-3 top-3 rounded bg-foreground px-3 py-1 text-[10px] tracking-[0.15em] uppercase text-background">
              {discountPercent}% off
            </span>
          ) : (
            tag && (
              <span className="absolute left-3 top-3 bg-foreground px-3 py-1 text-[10px] tracking-[0.15em] uppercase text-background">
                {tag}
              </span>
            )
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
        <ProductPrice product={product} />
      </div>
    </div>
  )
}

export function ProductGrid() {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    productsApi
      .featured()
      .then((res) => {
        if (res.code === 200 && res.data) {
          setProducts(res.data)
        } else {
          setError(res.message ?? "Failed to load products")
        }
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setIsLoading(false))
  }, [])

  const featuredProducts = products.slice(0, 6)

  return (
    <section id="collection" className="px-6 py-20 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <p className="mb-3 text-xs tracking-[0.3em] uppercase text-muted-foreground">
              The Collection
            </p>
            <h2 className="font-serif text-3xl md:text-4xl">Curated Pieces</h2>
          </div>
          <Link
            href="/collection"
            className="group inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-foreground/70 transition-colors hover:text-foreground"
          >
            View All
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse bg-muted"
              />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-sm text-muted-foreground">{error}</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
