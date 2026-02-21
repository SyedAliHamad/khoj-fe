"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { contentApi } from "@/lib/api/content"
import type { CategoryImage } from "@/lib/api/content"
import { getDisplayImageUrl } from "@/lib/image-utils"

export function CategoriesSection() {
  const [categories, setCategories] = useState<CategoryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    contentApi
      .getHomepage()
      .then((res) => {
        if (res.code === 200 && res.data?.categoryImages?.length) {
          setCategories(res.data.categoryImages)
        } else {
          setCategories([])
        }
      })
      .catch(() => setError("Failed to load categories"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <section className="px-6 pb-20 md:pb-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs tracking-[0.3em] uppercase text-muted-foreground">
            Shop By
          </p>
          <h2 className="font-serif text-3xl md:text-4xl">Categories</h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="aspect-[4/5] animate-pulse bg-muted md:aspect-[3/4]" />
            <div className="aspect-[4/5] animate-pulse bg-muted md:aspect-[3/4]" />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-muted-foreground">{error}</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No categories yet
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/collection?category=${cat.slug}`}
                className="group relative overflow-hidden"
              >
                <div className="relative aspect-[4/5] md:aspect-[3/4]">
                  <Image
                    src={getDisplayImageUrl(cat.image)}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-foreground/20 transition-colors group-hover:bg-foreground/30" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-12">
                    <h3 className="mb-2 font-serif text-3xl text-background md:text-4xl">
                      {cat.name}
                    </h3>
                    <span className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-background/90 transition-colors group-hover:text-background">
                      Shop Now
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
