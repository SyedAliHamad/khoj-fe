"use client"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { adminApi } from "@/lib/api/admin"
import { toast } from "sonner"

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
}

export function ImageUploadField({ label, value, onChange }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, WebP, or GIF)")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB")
      return
    }
    setUploading(true)
    try {
      const res = await adminApi.uploadImage(file)
      if (res.code === 200 && res.data?.url) {
        onChange(res.data.url)
        toast.success("Image uploaded")
      } else if (res.code === 401) {
        toast.error("Please sign in as admin to upload images")
      } else if (res.code === 403) {
        toast.error("Admin access required to upload images")
      } else {
        toast.error(res.message ?? "Upload failed")
      }
    } catch (err) {
      const msg =
        err instanceof TypeError
          ? "Network or CORS error. Ensure the API is reachable and CORS_ALLOWED_ORIGINS includes your site (e.g. https://www.khoj.com.pk) in backend .env."
          : "Upload failed"
      toast.error(msg)
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-32 shrink-0 overflow-hidden border border-border bg-muted">
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value.startsWith("http") ? value : value}
                alt={label}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='96' fill='%23ddd'%3E%3Crect width='128' height='96'/%3E%3C/svg%3E"
                }}
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-1 top-1 bg-foreground/80 p-1 text-background"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex w-fit items-center gap-2 border border-border px-3 py-2 text-xs transition-colors hover:bg-muted disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste image URL"
            className="w-full border border-border bg-transparent px-3 py-2 text-xs outline-none focus:border-foreground"
          />
        </div>
      </div>
    </div>
  )
}
