"use client"

import { useState, useEffect } from "react"
import { contentApi } from "@/lib/api/content"

const DEFAULTS = {
  subtitle: "Our Philosophy",
  title: "White is not the absence of color.",
  tagline: "It is the presence of every possibility.",
}

export function BrandStatement() {
  const [content, setContent] = useState(DEFAULTS)

  useEffect(() => {
    contentApi
      .getHomepage()
      .then((res) => {
        if (res.code === 200 && res.data?.brand) {
          setContent({
            subtitle: res.data.brand.subtitle || DEFAULTS.subtitle,
            title: res.data.brand.title || DEFAULTS.title,
            tagline: res.data.brand.tagline || DEFAULTS.tagline,
          })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="px-6 py-20 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-6 text-xs tracking-[0.3em] uppercase text-muted-foreground">
          {content.subtitle}
        </p>
        <h2 className="font-serif text-3xl leading-relaxed md:text-4xl lg:text-5xl">
          <span className="text-balance">
            {content.title}{" "}
            <span className="text-muted-foreground">{content.tagline}</span>
          </span>
        </h2>
      </div>
    </section>
  )
}
