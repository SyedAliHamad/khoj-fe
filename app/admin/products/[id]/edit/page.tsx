"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { adminApi } from "@/lib/api/admin"
import { ProductImagesField } from "@/components/admin/product-images-field"
import { toast } from "sonner"
import type { ApiProduct } from "@/lib/api/types"

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
    stockBySize: {} as Record<string, number>,
  })

  useEffect(() => {
    adminApi
      .getProduct(id)
      .then((res) => {
        if (res.code === 200 && res.data) {
          const p = res.data
          setProduct(p)
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
            stockBySize: p.stockBySize ?? {},
          })
        } else {
          toast.error("Product not found")
          router.push("/admin/products")
        }
      })
      .catch(() => {
        toast.error("Failed to load product")
        router.push("/admin/products")
      })
      .finally(() => setIsLoading(false))
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

  return (
    <div className="p-8">
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>
      <h1 className="mb-8 font-serif text-2xl tracking-wider">Edit Product</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
            className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Slug
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              Sale price (PKR) *
            </label>
            <p className="mb-2 text-[10px] text-muted-foreground">
              The price customers pay. Set original price below to show a discount.
            </p>
            <input
              type="number"
              min={0}
              value={form.price || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, price: parseInt(e.target.value) || 0 }))
              }
              required
              className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              Original price (PKR)
            </label>
            <p className="mb-2 text-[10px] text-muted-foreground">
              Original price before discount. Must be &gt; sale price to show as sale.
            </p>
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
              className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
              placeholder="Optional"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
          >
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Fabric
          </label>
          <input
            type="text"
            value={form.fabric}
            onChange={(e) => setForm((prev) => ({ ...prev, fabric: e.target.value }))}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
          />
        </div>
        <ProductImagesField
          images={form.images}
          onChange={(images) => setForm((prev) => ({ ...prev, images }))}
          productName={form.name}
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="inStock"
            checked={form.inStock}
            onChange={(e) => setForm((prev) => ({ ...prev, inStock: e.target.checked }))}
            className="h-4 w-4"
          />
          <label htmlFor="inStock" className="text-sm">
            In stock
          </label>
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Stock by size
          </label>
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
                  className="w-full border border-border bg-transparent px-2 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-foreground px-6 py-3 text-xs uppercase tracking-wider text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href="/admin/products"
            className="border border-border px-6 py-3 text-xs uppercase tracking-wider transition-colors hover:bg-muted"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
