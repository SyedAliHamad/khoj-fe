"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { adminApi } from "@/lib/api/admin"
import { getProductImage } from "@/lib/products"
import type { ApiProduct } from "@/lib/api/types"
import { toast } from "sonner"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    adminApi
      .listProducts()
      .then((res) => {
        if (res.code === 200 && res.data) {
          setProducts(res.data.items ?? [])
        } else {
          toast.error(res.message ?? "Failed to load products")
        }
      })
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    setDeletingId(id)
    try {
      const res = await adminApi.deleteProduct(id)
      if (res.code === 200) {
        setProducts((prev) => prev.filter((p) => p.id !== id))
        toast.success("Product deleted")
      } else {
        toast.error(res.message ?? "Failed to delete")
      }
    } catch {
      toast.error("Failed to delete product")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-2xl tracking-wider">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 border border-foreground px-4 py-2 text-xs tracking-[0.15em] uppercase transition-colors hover:bg-foreground hover:text-background"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse bg-muted" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No products yet. Add your first product.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Product
                </th>
                <th className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Category
                </th>
                <th className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Price
                </th>
                <th className="py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Stock
                </th>
                <th className="py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border">
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-muted">
                        <Image
                          src={getProductImage(product)}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <span className="text-sm font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">
                    {product.category}
                  </td>
                  <td className="py-4 text-sm">
                    PKR {product.price.toLocaleString()}
                  </td>
                  <td className="py-4 text-sm">
                    {product.inStock ? "In stock" : "Out of stock"}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded border border-border p-2 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id}
                        className="rounded border border-destructive/50 p-2 text-destructive/70 transition-colors hover:border-destructive hover:bg-destructive/5 hover:text-destructive disabled:opacity-50"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
