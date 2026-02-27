"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { adminApi } from "@/lib/api/admin"
import { adminCollectionsApi } from "@/lib/api/collections"
import { ProductDetailsField } from "@/components/admin/product-details-field"
import { ProductImagesField } from "@/components/admin/product-images-field"
import { toast } from "sonner"
import type { ApiProduct, Collection } from "@/lib/api/types"

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL"]

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [product, setProduct] = useState<ApiProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: "",
    slug: "",
    price: 0,
    compareAtPrice: "" as number | "",
    category: "women",
    description: "",
    fabric: "",
    inStock: true,
    images: [] as { url: string; alt: string }[],
    details: [""],
    tags: "" as string,
    collectionIds: [] as string[],
    stockBySize: {} as Record<string, number>,
  })
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    adminCollectionsApi.list().then((res) => {
      if (res.code === 200 && res.data) setCollections(res.data)
    })
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.getProduct(id)
        if (res.code === 200 && res.data) {
          const p = res.data
          setProduct(p)
          const collRes = await adminCollectionsApi.list()
          const colls = collRes.code === 200 ? collRes.data ?? [] : []
          const productSlugs = new Set(p.collections ?? [])
          const collectionIds = colls.filter((c) => productSlugs.has(c.slug)).map((c) => c.id)
          setForm({
            name: p.name,
            slug: p.slug,
            price: p.price,
            compareAtPrice: p.compareAtPrice ?? "",
            category: p.category,
            description: p.description ?? "",
            fabric: p.fabric ?? "",
            inStock: p.inStock,
            images: p.images?.map((img) => ({ url: img.url, alt: img.alt })) ?? [],
            details: p.details?.length ? p.details : [""],
            tags: p.tags?.join(", ") ?? "",
            collectionIds,
            stockBySize: p.stockBySize ?? {},
          })
        } else {
          toast.error("Product not found")
          router.push("/admin/products")
        }
      } catch {
        toast.error("Failed to load product")
        router.push("/admin/products")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!product || !form.name || form.price <= 0) return
    setIsSubmitting(true)
    try {
      const res = await adminApi.updateProduct(id, {
        name: form.name,
        slug: form.slug || undefined,
        price: form.price,
        compareAtPrice: form.compareAtPrice || undefined,
        category: form.category,
        collectionIds: form.collectionIds,
        description: form.description || undefined,
        fabric: form.fabric || undefined,
        inStock: form.inStock,
        images: form.images.map((img) => ({ id: "", url: img.url, alt: img.alt || form.name })),
        details: form.details.filter(Boolean),
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        stockBySize: Object.keys(form.stockBySize).length ? form.stockBySize : undefined,
      })
      if (res.code === 200 && res.data) {
        toast.success("Product updated")
        router.push("/admin/products")
      } else {
        toast.error(res.message ?? "Failed to update product")
      }
    } catch {
      toast.error("Failed to update product")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  const sizes = product.sizes?.length ? product.sizes : DEFAULT_SIZES

  const inputCls = "admin-input w-full px-4 py-3 text-sm"
  const labelCls = "mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
  const hintCls = "mb-2 text-[11px] text-muted-foreground/80"

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>
      <h1 className="mb-10 font-serif text-2xl tracking-wider">Edit Product</h1>

      <form onSubmit={handleSubmit} className="max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Left: main content */}
          <div className="space-y-8">
            <section className="rounded-md border border-border bg-muted/40 p-6">
              <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Basic info
              </h2>
              <div className="space-y-6">
                <div>
                  <label className={labelCls}>Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-md border border-border bg-muted/40 p-6">
              <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Content
              </h2>
              <div className="space-y-6">
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className={`${inputCls} resize-y`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Product details</label>
                  <ProductDetailsField
                    value={form.details}
                    onChange={(details) => setForm((prev) => ({ ...prev, details }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>Fabric</label>
                  <input
                    type="text"
                    value={form.fabric}
                    onChange={(e) => setForm((prev) => ({ ...prev, fabric: e.target.value }))}
                    className={inputCls}
                    placeholder="e.g. 100% Cotton Lawn"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-md border border-border bg-muted/40 p-6">
              <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Images
              </h2>
              <ProductImagesField
                images={form.images}
                onChange={(images) => setForm((prev) => ({ ...prev, images }))}
                productName={form.name}
              />
            </section>
          </div>

          {/* Right: pricing, taxonomy, inventory */}
          <div className="space-y-8 lg:max-w-[360px]">
            <section className="rounded-md border border-border bg-muted/40 p-6">
              <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Pricing
              </h2>
              <div className="space-y-6">
                <div>
                  <label className={labelCls}>Sale price (PKR) *</label>
                  <p className={hintCls}>The price customers pay.</p>
                  <input
                    type="number"
                    min={0}
                    value={form.price || ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, price: parseInt(e.target.value) || 0 }))
                    }
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Original price (PKR)</label>
                  <p className={hintCls}>Before discount. Must be &gt; sale price to show as sale.</p>
                  <input
                    type="number"
                    min={0}
                    value={form.compareAtPrice === "" ? "" : form.compareAtPrice}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        compareAtPrice: e.target.value ? parseInt(e.target.value) : "",
                      }))
                    }
                    className={inputCls}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-md border border-border bg-muted/40 p-6">
              <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Taxonomy
              </h2>
              <div className="space-y-6">
                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Collections</label>
                  <p className={hintCls}>Eastern, Western, etc.</p>
                  <div className="flex flex-wrap gap-2">
                    {collections.map((c) => (
                      <label
                        key={c.id}
                        className="flex cursor-pointer items-center gap-2 rounded border border-border bg-[hsl(var(--input-bg))] px-3 py-2 text-sm transition-colors hover:border-foreground/30"
                      >
                        <input
                          type="checkbox"
                          checked={form.collectionIds.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm((prev) => ({
                                ...prev,
                                collectionIds: [...prev.collectionIds, c.id],
                              }))
                            } else {
                              setForm((prev) => ({
                                ...prev,
                                collectionIds: prev.collectionIds.filter((id) => id !== c.id),
                              }))
                            }
                          }}
                          className="h-4 w-4"
                        />
                        {c.name}
                      </label>
                    ))}
                    {collections.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        Add collections in Admin → Collections.
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Tags</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                    className={inputCls}
                    placeholder="New, Bestseller"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-md border border-border bg-muted/40 p-6">
              <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Inventory
              </h2>
              <div className="space-y-6">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => setForm((prev) => ({ ...prev, inStock: e.target.checked }))}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">In stock</span>
                </label>
                <div>
                  <label className={labelCls}>Stock by size</label>
                  <div className="grid grid-cols-5 gap-2">
                    {sizes.map((size) => (
                      <div key={size}>
                        <label className="mb-1 block text-[10px] text-muted-foreground">{size}</label>
                        <input
                          type="number"
                          min={0}
                          value={form.stockBySize[size] ?? 0}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              stockBySize: {
                                ...prev.stockBySize,
                                [size]: parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                          className="admin-input w-full px-2 py-2 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-10 flex gap-4 border-t border-border pt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-foreground px-8 py-3 text-xs font-medium uppercase tracking-wider text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
          <Link
            href="/admin/products"
            className="border border-border px-8 py-3 text-xs font-medium uppercase tracking-wider transition-colors hover:bg-muted"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
