"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import {
  Heart,
  Minus,
  Plus,
  ChevronLeft,
  ArrowRight,
  Truck,
  RotateCcw,
  Shield,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SizeGuideDialog } from "@/components/size-guide-dialog"
import { useCart } from "@/lib/cart-context"
import { productsApi } from "@/lib/api/products"
import { getProductImage } from "@/lib/products"
import { getDisplayImageUrl } from "@/lib/image-utils"
import type { ApiProduct } from "@/lib/api/types"

function RelatedProductCard({ product }: { product: ApiProduct }) {
  const [isHovered, setIsHovered] = useState(false)

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
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {product.tags?.[0] && (
            <span className="absolute left-3 top-3 bg-foreground px-3 py-1 text-[10px] tracking-[0.15em] uppercase text-background">
              {product.tags[0]}
            </span>
          )}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-foreground/90 py-3 text-center transition-all duration-300 ${isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
          >
            <span className="text-xs tracking-[0.2em] uppercase text-background">
              Quick View
            </span>
          </div>
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

export default function ProductDetailPage() {
  const params = useParams()
  const productId = String(params.id ?? "")
  const [product, setProduct] = useState<ApiProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)

  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [shippingOpen, setShippingOpen] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [sizeError, setSizeError] = useState(false)

  useEffect(() => {
    if (!productId) return

    productsApi
      .getById(productId)
      .then((res) => {
        if (res.code === 200 && res.data) {
          setProduct(res.data)
        } else {
          setNotFoundState(true)
        }
      })
      .catch(() => setNotFoundState(true))
      .finally(() => setIsLoading(false))
  }, [productId])

  useEffect(() => {
    if (!product) return

    productsApi
      .list({ category: product.category, limit: 5 })
      .then((res) => {
        if (res.code === 200 && res.data) {
          const others = (res.data.items ?? []).filter((p) => p.id !== product.id)
          setRelatedProducts(others.slice(0, 4))
        }
      })
      .catch(() => {})
  }, [product])

  if (notFoundState || (!isLoading && !product)) {
    notFound()
  }

  if (isLoading || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  const sizes = product.sizes?.length ? product.sizes : ["XS", "S", "M", "L", "XL"]

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-7xl px-6 pb-4 pt-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Link
              href="/"
              className="transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/collection"
              className="transition-colors hover:text-foreground"
            >
              Collection
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-20 pt-4 md:pb-32">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-3">
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <Image
                  src={getDisplayImageUrl(
                    product.images?.[activeImage]?.url ??
                    getProductImage(product)
                  )}
                  alt={`${product.name} - Image ${activeImage + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      className={`relative aspect-square w-20 overflow-hidden border-2 transition-colors ${
                        activeImage === idx
                          ? "border-foreground"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <Image
                        src={getDisplayImageUrl(img.url)}
                        alt={img.alt ?? `${product.name} thumbnail ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col lg:sticky lg:top-40 lg:self-start">
              <Link
                href="/collection"
                className="mb-6 inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-muted-foreground transition-colors hover:text-foreground lg:hidden"
              >
                <ChevronLeft className="h-3 w-3" />
                Back to Collection
              </Link>

              {product.tags?.[0] && (
                <span className="mb-4 inline-block w-fit bg-foreground px-3 py-1 text-[10px] tracking-[0.15em] uppercase text-background">
                  {product.tags[0]}
                </span>
              )}

              <h1 className="font-serif text-3xl md:text-4xl">{product.name}</h1>

              <p className="mt-3 text-lg text-muted-foreground">
                PKR {product.price.toLocaleString()}
              </p>

              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              <p className="mt-4 text-xs tracking-[0.1em] uppercase text-muted-foreground">
                Fabric: {product.fabric}
              </p>

              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs tracking-[0.15em] uppercase">
                    Size
                  </span>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`flex h-11 w-14 items-center justify-center border text-xs tracking-[0.1em] transition-colors ${
                        selectedSize === size
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-foreground hover:border-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <span className="mb-3 block text-xs tracking-[0.15em] uppercase">
                  Quantity
                </span>
                <div className="inline-flex border border-border">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-11 w-11 items-center justify-center text-foreground/70 transition-colors hover:text-foreground"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="flex h-11 w-12 items-center justify-center border-l border-r border-border text-sm">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-11 w-11 items-center justify-center text-foreground/70 transition-colors hover:text-foreground"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {sizeError && (
                <p className="mt-3 text-xs text-destructive">
                  Please select a size before adding to bag
                </p>
              )}

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedSize) {
                      setSizeError(true)
                      return
                    }
                    setSizeError(false)
                    addItem(product, selectedSize, quantity)
                    setQuantity(1)
                  }}
                  className="flex-1 bg-foreground py-4 text-xs tracking-[0.2em] uppercase text-background transition-opacity hover:opacity-90"
                >
                  Add to Bag
                </button>
                <button
                  type="button"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="flex h-[52px] w-[52px] items-center justify-center border border-border transition-colors hover:border-foreground"
                  aria-label={
                    isWishlisted
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  <Heart
                    className={`h-5 w-5 ${isWishlisted ? "fill-foreground text-foreground" : "text-foreground/70"}`}
                  />
                </button>
              </div>

              <div className="mt-10 border-t border-border">
                <button
                  type="button"
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <span className="text-xs tracking-[0.15em] uppercase">
                    Product Details
                  </span>
                  <Plus
                    className={`h-4 w-4 text-muted-foreground transition-transform ${detailsOpen ? "rotate-45" : ""}`}
                  />
                </button>
                {detailsOpen && (
                  <ul className="space-y-2.5 pb-5">
                    {(product.details ?? []).map((detail) => (
                      <li
                        key={detail}
                        className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-1.5 block h-1 w-1 shrink-0 bg-muted-foreground/50" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-border">
                <button
                  type="button"
                  onClick={() => setShippingOpen(!shippingOpen)}
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <span className="text-xs tracking-[0.15em] uppercase">
                    Shipping & Returns
                  </span>
                  <Plus
                    className={`h-4 w-4 text-muted-foreground transition-transform ${shippingOpen ? "rotate-45" : ""}`}
                  />
                </button>
                {shippingOpen && (
                  <div className="space-y-4 pb-5">
                    <div className="flex items-start gap-3">
                      <Truck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-sm">Free Shipping</p>
                        <p className="text-xs text-muted-foreground">
                          On orders above PKR 5,000. Delivery in 3-5 business
                          days.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-sm">Easy Returns</p>
                        <p className="text-xs text-muted-foreground">
                          14-day return policy for unworn items with tags
                          attached.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-sm">Quality Guarantee</p>
                        <p className="text-xs text-muted-foreground">
                          Every piece is inspected for quality before shipping.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="border-t border-border px-6 py-20 md:py-28">
            <div className="mx-auto max-w-7xl">
              <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
                <div>
                  <p className="mb-3 text-xs tracking-[0.3em] uppercase text-muted-foreground">
                    You May Also Like
                  </p>
                  <h2 className="font-serif text-3xl md:text-4xl">
                    Complete the Look
                  </h2>
                </div>
                <Link
                  href="/collection"
                  className="group inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-foreground/70 transition-colors hover:text-foreground"
                >
                  View All
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-6">
                {relatedProducts.map((p) => (
                  <RelatedProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
      <SizeGuideDialog
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        productName={product.name}
        sizeGuide={product.sizeGuide ?? []}
      />
    </div>
  )
}
