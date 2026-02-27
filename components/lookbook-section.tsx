"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { contentApi } from "@/lib/api/content"
import { getDisplayImageUrl } from "@/lib/image-utils"

const DEFAULTS = {
  image: "/placeholder.svg",
  season: "Spring / Summer",
  title: "The Lookbook",
  ctaText: "View Lookbook",
  ctaHref: "/collection",
}

export function LookbookSection() {
  const [content, setContent] = useState(DEFAULTS)

  useEffect(() => {
    contentApi
      .getHomepage()
      .then((res) => {
        if (res.code === 200 && res.data?.lookbook) {
          setContent({
            image: res.data.lookbook.image || DEFAULTS.image,
            season: res.data.lookbook.season || DEFAULTS.season,
            title: res.data.lookbook.title || DEFAULTS.title,
            ctaText: res.data.lookbook.ctaText || DEFAULTS.ctaText,
            ctaHref: res.data.lookbook.ctaHref || DEFAULTS.ctaHref,
          })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="px-6 pb-20 md:pb-32">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden">
          <div className="relative aspect-[16/9] min-h-[400px] md:aspect-[21/9]">
            <Image
              src={getDisplayImageUrl(content.image)}
              alt={content.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-foreground/15" />
            <div className="absolute inset-0 flex flex-col items-start justify-end p-8 md:p-16">
              <p className="mb-2 text-xs tracking-[0.3em] uppercase text-[#5c4a3a]">
                {content.season}
              </p>
              <h2 className="mb-4 font-serif text-3xl text-[#5c4a3a] md:text-5xl">
                {content.title}
              </h2>
              <Link
                href={content.ctaHref}
                className="group inline-flex items-center gap-2 border border-[#5c4a3a] px-6 py-2.5 text-xs tracking-[0.2em] uppercase text-[#5c4a3a] transition-all hover:bg-[#5c4a3a] hover:text-white"
              >
                {content.ctaText}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
