"use client"

import { useState, useRef } from "react"
import { Plus, X, Upload } from "lucide-react"
import { adminApi } from "@/lib/api/admin"
import { toast } from "sonner"

export interface ProductImageEntry {
  url: string
  alt: string
}

interface ProductImagesFieldProps {
  images: ProductImageEntry[]
  onChange: (images: ProductImageEntry[]) => void
  productName?: string
}

export function ProductImagesField({
  images,
  onChange,
  productName = "",
}: ProductImagesFieldProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`)
          continue
        }
        const res = await adminApi.uploadImage(file)
        if (res.code === 200 && res.data?.url) {
          onChange([
            ...images,
            { url: res.data.url, alt: productName || file.name.replace(/\.[^/.]+$/, "") },
          ])
        } else {
          toast.error(res.message ?? "Upload failed")
        }
      }
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  function addByUrl() {
    const url = prompt("Enter image URL (e.g. /images/product.jpg or https://...):")
    if (url?.trim()) {
      onChange([...images, { url: url.trim(), alt: productName }])
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  function updateAlt(index: number, alt: string) {
    const next = [...images]
    next[index] = { ...next[index], alt }
    onChange(next)
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">
          Images
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button
            type="button"
            onClick={addByUrl}
            className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" />
            Add URL
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-wrap gap-4">
        {images.map((img, i) => (
          <div
            key={`${img.url}-${i}`}
            className="group relative flex flex-col gap-2"
          >
            <div className="relative h-24 w-24 overflow-hidden border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url.startsWith("http") ? img.url : img.url}
                alt={img.alt}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' fill='%23ddd'%3E%3Crect width='96' height='96'/%3E%3C/svg%3E"
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 bg-foreground/80 p-1 text-background opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <input
              type="text"
              value={img.alt}
              onChange={(e) => updateAlt(i, e.target.value)}
              placeholder="Alt text"
              className="w-24 border border-border bg-transparent px-2 py-1 text-[10px] outline-none focus:border-foreground"
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Upload files (JPEG, PNG, WebP, GIF up to 5MB) or paste a URL. First image is the main image.
      </p>
    </div>
  )
}
