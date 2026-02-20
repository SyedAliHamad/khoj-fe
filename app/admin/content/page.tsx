"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { adminContentApi } from "@/lib/api/content"
import { ImageUploadField } from "@/components/admin/image-upload-field"
import { toast } from "sonner"
import type { HomepageContent } from "@/lib/api/content"

export default function AdminContentPage() {
  const [content, setContent] = useState<HomepageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    backgroundColor: "#FAF8F5",
    heroImage: "",
    heroSubtitle: "",
    heroTitle: "",
    heroDescription: "",
    heroCtaText: "",
    heroCtaHref: "",
    lookbookImage: "",
    lookbookSeason: "",
    lookbookTitle: "",
    lookbookCtaText: "",
    lookbookCtaHref: "",
    easternImage: "",
    easternName: "",
    easternSlug: "",
    westernImage: "",
    westernName: "",
    westernSlug: "",
  })

  useEffect(() => {
    adminContentApi
      .getContent()
      .then((res) => {
        if (res.code === 200 && res.data) {
          const c = res.data
          setContent(c)
          setForm({
            backgroundColor: c.backgroundColor ?? "#FAF8F5",
            heroImage: c.hero.image ?? "",
            heroSubtitle: c.hero.subtitle ?? "",
            heroTitle: c.hero.title ?? "",
            heroDescription: c.hero.description ?? "",
            heroCtaText: c.hero.ctaText ?? "",
            heroCtaHref: c.hero.ctaHref ?? "",
            lookbookImage: c.lookbook.image ?? "",
            lookbookSeason: c.lookbook.season ?? "",
            lookbookTitle: c.lookbook.title ?? "",
            lookbookCtaText: c.lookbook.ctaText ?? "",
            lookbookCtaHref: c.lookbook.ctaHref ?? "",
            easternImage: c.categoryImages?.[0]?.image ?? "",
            easternName: c.categoryImages?.[0]?.name ?? "Eastern",
            easternSlug: c.categoryImages?.[0]?.slug ?? "eastern",
            westernImage: c.categoryImages?.[1]?.image ?? "",
            westernName: c.categoryImages?.[1]?.name ?? "Western",
            westernSlug: c.categoryImages?.[1]?.slug ?? "western",
          })
        }
      })
      .catch(() => toast.error("Failed to load content"))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleSave() {
    setIsSaving(true)
    try {
      const updates = [
        { key: "background_color", value: form.backgroundColor },
        { key: "hero_image", value: form.heroImage },
        { key: "hero_subtitle", value: form.heroSubtitle },
        { key: "hero_title", value: form.heroTitle },
        { key: "hero_description", value: form.heroDescription },
        { key: "hero_cta_text", value: form.heroCtaText },
        { key: "hero_cta_href", value: form.heroCtaHref },
        { key: "lookbook_image", value: form.lookbookImage },
        { key: "lookbook_season", value: form.lookbookSeason },
        { key: "lookbook_title", value: form.lookbookTitle },
        { key: "lookbook_cta_text", value: form.lookbookCtaText },
        { key: "lookbook_cta_href", value: form.lookbookCtaHref },
        { key: "eastern_image", value: form.easternImage },
        { key: "eastern_name", value: form.easternName },
        { key: "eastern_slug", value: form.easternSlug },
        { key: "western_image", value: form.westernImage },
        { key: "western_name", value: form.westernName },
        { key: "western_slug", value: form.westernSlug },
      ]
      const res = await adminContentApi.updateContent(updates)
      if (res.code === 200 && res.data) {
        setContent(res.data)
        toast.success("Content saved")
      } else {
        toast.error(res.message ?? "Failed to save")
      }
    } catch {
      toast.error("Failed to save content")
    } finally {
      setIsSaving(false)
    }
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
      <h1 className="mb-8 font-serif text-2xl tracking-wider">Homepage Content</h1>

      <div className="max-w-2xl space-y-10">
        {/* Theme / Appearance */}
        <section className="space-y-4 border-b border-border pb-10">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Theme & Appearance
          </h2>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              Background Color
            </label>
            <p className="mb-3 text-xs text-muted-foreground">
              Applied to the main background across all pages.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.backgroundColor}
                  onChange={(e) => setForm((p) => ({ ...p, backgroundColor: e.target.value }))}
                  className="h-12 w-20 cursor-pointer rounded border border-border bg-transparent p-1"
                />
                <input
                  type="text"
                  value={form.backgroundColor}
                  onChange={(e) => setForm((p) => ({ ...p, backgroundColor: e.target.value }))}
                  className="w-28 border border-border bg-transparent px-3 py-2 text-sm font-mono outline-none focus:border-foreground"
                  placeholder="#FAF8F5"
                />
              </div>
              <div
                className="h-10 w-10 rounded border border-border"
                style={{ backgroundColor: form.backgroundColor }}
                title="Preview"
              />
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="space-y-4 border-b border-border pb-10">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Hero Section
          </h2>
          <ImageUploadField
            label="Hero Image"
            value={form.heroImage}
            onChange={(v) => setForm((p) => ({ ...p, heroImage: v }))}
          />
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              Subtitle
            </label>
            <input
              type="text"
              value={form.heroSubtitle}
              onChange={(e) => setForm((p) => ({ ...p, heroSubtitle: e.target.value }))}
              className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              Title
            </label>
            <input
              type="text"
              value={form.heroTitle}
              onChange={(e) => setForm((p) => ({ ...p, heroTitle: e.target.value }))}
              className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <textarea
              value={form.heroDescription}
              onChange={(e) => setForm((p) => ({ ...p, heroDescription: e.target.value }))}
              rows={3}
              className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                CTA Text
              </label>
              <input
                type="text"
                value={form.heroCtaText}
                onChange={(e) => setForm((p) => ({ ...p, heroCtaText: e.target.value }))}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                CTA Link
              </label>
              <input
                type="text"
                value={form.heroCtaHref}
                onChange={(e) => setForm((p) => ({ ...p, heroCtaHref: e.target.value }))}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
              />
            </div>
          </div>
        </section>

        {/* Lookbook Section */}
        <section className="space-y-4 border-b border-border pb-10">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Lookbook Section
          </h2>
          <ImageUploadField
            label="Lookbook Image"
            value={form.lookbookImage}
            onChange={(v) => setForm((p) => ({ ...p, lookbookImage: v }))}
          />
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              Season
            </label>
            <input
              type="text"
              value={form.lookbookSeason}
              onChange={(e) => setForm((p) => ({ ...p, lookbookSeason: e.target.value }))}
              className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              Title
            </label>
            <input
              type="text"
              value={form.lookbookTitle}
              onChange={(e) => setForm((p) => ({ ...p, lookbookTitle: e.target.value }))}
              className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                CTA Text
              </label>
              <input
                type="text"
                value={form.lookbookCtaText}
                onChange={(e) => setForm((p) => ({ ...p, lookbookCtaText: e.target.value }))}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                CTA Link
              </label>
              <input
                type="text"
                value={form.lookbookCtaHref}
                onChange={(e) => setForm((p) => ({ ...p, lookbookCtaHref: e.target.value }))}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
              />
            </div>
          </div>
        </section>

        {/* Category Images */}
        <section className="space-y-6 border-b border-border pb-10">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Category Images (Eastern & Western)
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4 border border-border p-6">
              <h3 className="text-sm font-medium">Eastern</h3>
              <ImageUploadField
                label="Image"
                value={form.easternImage}
                onChange={(v) => setForm((p) => ({ ...p, easternImage: v }))}
              />
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                  Display Name
                </label>
                <input
                  type="text"
                  value={form.easternName}
                  onChange={(e) => setForm((p) => ({ ...p, easternName: e.target.value }))}
                  className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                  URL Slug (for collection links)
                </label>
                <input
                  type="text"
                  value={form.easternSlug}
                  onChange={(e) => setForm((p) => ({ ...p, easternSlug: e.target.value }))}
                  className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
                  placeholder="eastern"
                />
              </div>
            </div>
            <div className="space-y-4 border border-border p-6">
              <h3 className="text-sm font-medium">Western</h3>
              <ImageUploadField
                label="Image"
                value={form.westernImage}
                onChange={(v) => setForm((p) => ({ ...p, westernImage: v }))}
              />
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                  Display Name
                </label>
                <input
                  type="text"
                  value={form.westernName}
                  onChange={(e) => setForm((p) => ({ ...p, westernName: e.target.value }))}
                  className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                  URL Slug (for collection links)
                </label>
                <input
                  type="text"
                  value={form.westernSlug}
                  onChange={(e) => setForm((p) => ({ ...p, westernSlug: e.target.value }))}
                  className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground"
                  placeholder="western"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-foreground px-6 py-3 text-xs uppercase tracking-wider text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border px-6 py-3 text-xs uppercase tracking-wider transition-colors hover:bg-muted"
          >
            Preview Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
