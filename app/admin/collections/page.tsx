"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { adminCollectionsApi } from "@/lib/api/collections"
import { ImageUploadField } from "@/components/admin/image-upload-field"
import type { Collection } from "@/lib/api/types"
import { toast } from "sonner"

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", slug: "", image: "" })

  useEffect(() => {
    load()
  }, [])

  function load() {
    adminCollectionsApi
      .list()
      .then((res) => {
        if (res.code === 200 && res.data) setCollections(res.data)
      })
      .catch((err) => toast.error(`Failed to load collections: ${err.message || "Network error"}`))
      .finally(() => setIsLoading(false))
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and slug required")
      return
    }
    adminCollectionsApi
      .create({ name: form.name, slug: form.slug, image: form.image })
      .then((res) => {
        if (res.code === 201 && res.data) {
          toast.success("Collection created")
          setForm({ name: "", slug: "", image: "" })
          load()
        } else {
          toast.error(res.message || `Failed to create (code: ${res.code})`)
        }
      })
      .catch((err) => toast.error(`Failed to create: ${err.message || "Network error"}`))
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId || !form.name.trim() || !form.slug.trim()) return
    adminCollectionsApi
      .update(editingId, { name: form.name, slug: form.slug, image: form.image })
      .then((res) => {
        if (res.code === 200) {
          toast.success("Collection updated")
          setEditingId(null)
          setForm({ name: "", slug: "", image: "" })
          load()
        } else {
          toast.error(res.message ?? "Failed to update")
        }
      })
      .catch(() => toast.error("Failed to update"))
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? Products will be unlinked.`)) return
    adminCollectionsApi
      .delete(id)
      .then((res) => {
        if (res.code === 200) {
          toast.success("Collection deleted")
          load()
        } else {
          toast.error(res.message ?? "Failed to delete")
        }
      })
      .catch(() => toast.error("Failed to delete"))
  }

  function startEdit(c: Collection) {
    setEditingId(c.id)
    setForm({ name: c.name, slug: c.slug, image: c.image })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ name: "", slug: "", image: "" })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      <h1 className="mb-8 font-serif text-2xl tracking-wider">Collections</h1>
      <p className="mb-8 max-w-xl text-sm text-muted-foreground">
        Collections like Eastern, Western, etc. Products can belong to multiple
        collections. These appear on the homepage and as collection filters.
      </p>

      <form
        onSubmit={editingId ? handleUpdate : handleCreate}
        className="mb-12 max-w-xl space-y-4 border-b border-border pb-12"
      >
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {editingId ? "Edit collection" : "Add collection"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({
                  ...p,
                  name: e.target.value,
                  slug: p.slug || e.target.value.toLowerCase().replace(/\s+/g, "-"),
                }))
              }}
              className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
              placeholder="Eastern"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              Slug
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
              placeholder="eastern"
              required
            />
          </div>
        </div>
        <ImageUploadField
          label="Image"
          value={form.image}
          onChange={(v) => setForm((p) => ({ ...p, image: v }))}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-foreground px-6 py-2 text-xs uppercase tracking-wider text-background"
          >
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="border border-border px-6 py-2 text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {collections.length === 0 ? (
          <p className="text-muted-foreground">No collections yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-4 border border-border p-4"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-muted">
                  {c.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={c.image}
                      alt={c.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.slug}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.count ?? 0} products
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="rounded border border-border p-2 text-muted-foreground hover:border-foreground hover:text-foreground"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.name)}
                    className="rounded border border-destructive/50 p-2 text-destructive/70 hover:border-destructive hover:bg-destructive/5 hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
