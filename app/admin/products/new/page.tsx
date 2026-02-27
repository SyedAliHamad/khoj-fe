"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { adminApi, toCreateProductRequest } from "@/lib/api/admin"
import { adminCollectionsApi } from "@/lib/api/collections"
import type { Collection } from "@/lib/api/types"
import { ProductDetailsField } from "@/components/admin/product-details-field"
import { ProductImagesField } from "@/components/admin/product-images-field"
import { toast } from "sonner"

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL"]
const DEFAULT_SIZE_GUIDE = [
  { size: "XS", chest: "32\"", waist: "26\"", hips: "34\"", length: "40\"", shoulder: "13.5\"" },
  { size: "S", chest: "34\"", waist: "28\"", hips: "36\"", length: "41\"", shoulder: "14\"" },
  { size: "M", chest: "36\"", waist: "30\"", hips: "38\"", length: "42\"", shoulder: "14.5\"" },
  { size: "L", chest: "38\"", waist: "32\"", hips: "40\"", length: "43\"", shoulder: "15\"" },
  { size: "XL", chest: "40\"", waist: "34\"", hips: "42\"", length: "44\"", shoulder: "15.5\"" },
]

export default function NewProductPage() {
  const router = useRouter()
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
    sizes: DEFAULT_SIZES,
    sizeGuide: DEFAULT_SIZE_GUIDE,
    tags: "" as string,
    collectionIds: [] as string[],
    stockXS: 5,
    stockS: 8,
    stockM: 10,
    stockL: 6,
    stockXL: 4,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    adminCollectionsApi.list().then((res) => {
      if (res.code === 200 && res.data) setCollections(res.data)
    })
  }, [])

  function updateField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [k]: v }))
    if (k === "name" && !form.slug) {
      setForm((prev) => ({
        ...prev,
        slug: v.toString().toLowerCase().replace(/\s+/g, "-"),
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || form.price <= 0) {
      toast.error("Name and price required")
      return
    }
    setIsSubmitting(true)
    try {
      const payload = toCreateProductRequest({
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
        price: form.price,
        compareAtPrice: form.compareAtPrice || undefined,
        category: form.category,
        collectionIds: form.collectionIds,
        description: form.description,
        fabric: form.fabric,
        inStock: form.inStock,
        images: form.images.map((img) => ({ url: img.url, alt: img.alt || form.name })),
        details: form.details.filter(Boolean),
        sizes: form.sizes,
        sizeGuide: form.sizeGuide,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        stockBySize: {
          XS: form.stockXS,
          S: form.stockS,
          M: form.stockM,
          L: form.stockL,
          XL: form.stockXL,
        },
      })
      const res = await adminApi.createProduct(payload)
      if (res.code === 201 && res.data) {
        toast.success("Product created")
        router.push("/admin/products")
      } else {
        toast.error(res.message ?? "Failed to create product")
      }
    } catch {
      toast.error("Failed to create product")
    } finally {
      setIsSubmitting(false)
    }
  }

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
      <h1 className="mb-10 font-serif text-2xl tracking-wider">Add Product</h1>

      <form onSubmit={handleSubmit} className="max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
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
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                    className={inputCls}
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <label className={labelCls}>Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => updateField("slug", e.target.value)}
                    className={inputCls}
                    placeholder="product-slug"
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
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={4}
                    className={`${inputCls} resize-y`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Product details</label>
                  <ProductDetailsField
                    value={form.details}
                    onChange={(details) => updateField("details", details)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Fabric</label>
                  <input
                    type="text"
                    value={form.fabric}
                    onChange={(e) => updateField("fabric", e.target.value)}
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
                onChange={(images) => updateField("images", images)}
                productName={form.name}
              />
            </section>
          </div>

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
                    onChange={(e) => updateField("price", parseInt(e.target.value) || 0)}
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
                      updateField("compareAtPrice", e.target.value ? parseInt(e.target.value) : "")
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
                    onChange={(e) => updateField("category", e.target.value)}
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
                              updateField("collectionIds", [...form.collectionIds, c.id])
                            } else {
                              updateField(
                                "collectionIds",
                                form.collectionIds.filter((id) => id !== c.id)
                              )
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
                    onChange={(e) => updateField("tags", e.target.value)}
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
                    onChange={(e) => updateField("inStock", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">In stock</span>
                </label>
                <div>
                  <label className={labelCls}>Stock by size</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(["XS", "S", "M", "L", "XL"] as const).map((size) => (
                      <div key={size}>
                        <label className="mb-1 block text-[10px] text-muted-foreground">{size}</label>
                        <input
                          type="number"
                          min={0}
                          value={form[`stock${size}` as keyof typeof form] as number}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0
                            setForm((prev) => ({ ...prev, [`stock${size}`]: val }))
                          }}
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
            {isSubmitting ? "Creating..." : "Create product"}
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
