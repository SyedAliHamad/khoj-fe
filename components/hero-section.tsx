"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { contentApi } from "@/lib/api/content"
import { getDisplayImageUrl } from "@/lib/image-utils"

const DEFAULTS = {
  image: "/placeholder.svg",
  subtitle: "The Collection",
  title: "Discover the Art of White",
  description:
    "Minimalist clothing crafted with intention. Every piece tells a story of purity, elegance, and timeless design.",
  ctaText: "Explore Collection",
  ctaHref: "#collection",
}

export function HeroSection() {
  const [content, setContent] = useState(DEFAULTS)

  useEffect(() => {
    contentApi
      .getHomepage()
      .then((res) => {
        if (res.code === 200 && res.data?.hero) {
          setContent({
            image: res.data.hero.image || DEFAULTS.image,
            subtitle: res.data.hero.subtitle || DEFAULTS.subtitle,
            title: res.data.hero.title || DEFAULTS.title,
            description: res.data.hero.description || DEFAULTS.description,
            ctaText: res.data.hero.ctaText || DEFAULTS.ctaText,
            ctaHref: res.data.hero.ctaHref || DEFAULTS.ctaHref,
          })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="relative">
      <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
        <Image
          src={getDisplayImageUrl(content.image)}
          alt="Hero"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-foreground/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 text-center md:pb-24">
          <div className="space-y-6 px-6">
            <p className="text-xs tracking-[0.3em] uppercase text-[#5c4a3a]">
              {content.subtitle}
            </p>
            <h2 className="font-serif text-4xl leading-tight text-[#5c4a3a] md:text-6xl lg:text-7xl">
              <span className="text-balance">{content.title}</span>
            </h2>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-[#5c4a3a]">
              {content.description}
            </p>
            <Link
              href={content.ctaHref}
              className="group inline-flex items-center gap-2 border border-[#5c4a3a] bg-white/20 px-8 py-3 text-xs tracking-[0.2em] uppercase text-[#5c4a3a] backdrop-blur-sm transition-all hover:bg-[#5c4a3a] hover:text-white"
            >
              {content.ctaText}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
