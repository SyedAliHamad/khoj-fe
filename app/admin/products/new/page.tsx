"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { adminApi, toCreateProductRequest } from "@/lib/api/admin"
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
    stockXS: 5,
    stockS: 8,
    stockM: 10,
    stockL: 6,
    stockXL: 4,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  return (
    <div className="p-8">
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>
      <h1 className="mb-8 font-serif text-2xl tracking-wider">Add Product</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
            placeholder="Product name"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Slug
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
            placeholder="product-slug"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              Price (PKR) *
            </label>
            <input
              type="number"
              min={0}
              value={form.price || ""}
              onChange={(e) => updateField("price", parseInt(e.target.value) || 0)}
              required
              className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              Compare at price (PKR)
            </label>
            <input
              type="number"
              min={0}
              value={form.compareAtPrice === "" ? "" : form.compareAtPrice}
              onChange={(e) =>
                updateField("compareAtPrice", e.target.value ? parseInt(e.target.value) : "")
              }
              className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
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
            onChange={(e) => updateField("description", e.target.value)}
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
            onChange={(e) => updateField("fabric", e.target.value)}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
            placeholder="e.g. 100% Cotton Lawn"
          />
        </div>
        <ProductImagesField
          images={form.images}
          onChange={(images) => updateField("images", images)}
          productName={form.name}
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="inStock"
            checked={form.inStock}
            onChange={(e) => updateField("inStock", e.target.checked)}
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
            onChange={(e) => updateField("tags", e.target.value)}
            className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
            placeholder="New, Bestseller"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
            Stock by size
          </label>
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
            {isSubmitting ? "Creating..." : "Create Product"}
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
