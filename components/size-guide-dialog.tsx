"use client"

import { X, Ruler } from "lucide-react"
import type { SizeGuideEntry } from "@/lib/api/types"

interface SizeGuideDialogProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  sizeGuide?: SizeGuideEntry[] | null
}

export function SizeGuideDialog({
  isOpen,
  onClose,
  productName,
  sizeGuide = [],
}: SizeGuideDialogProps) {
  if (!isOpen) return null

  const guide = sizeGuide ?? []
  const hasChest = guide.some((s) => s.chest !== "N/A")
  const hasWaist = guide.some((s) => s.waist !== "N/A")
  const hasHips = guide.some((s) => s.hips !== "N/A")
  const hasShoulder = guide.some((s) => s.shoulder !== "N/A")

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose()
        }}
        role="button"
        tabIndex={0}
        aria-label="Close size guide"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
        className="relative z-10 mx-4 w-full max-w-lg animate-fade-in border border-border bg-background p-8 shadow-lg md:p-10"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close size guide"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-muted-foreground">
            <Ruler className="h-4 w-4" />
            <span className="text-xs tracking-[0.2em] uppercase">
              Size Guide
            </span>
          </div>
          <h2
            id="size-guide-title"
            className="font-serif text-2xl md:text-3xl"
          >
            {productName}
          </h2>
        </div>

        {/* Size Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-foreground">
                <th className="pb-3 pr-4 text-[10px] tracking-[0.2em] uppercase text-foreground">
                  Size
                </th>
                {hasChest && (
                  <th className="pb-3 pr-4 text-[10px] tracking-[0.2em] uppercase text-foreground">
                    Chest
                  </th>
                )}
                {hasWaist && (
                  <th className="pb-3 pr-4 text-[10px] tracking-[0.2em] uppercase text-foreground">
                    Waist
                  </th>
                )}
                {hasHips && (
                  <th className="pb-3 pr-4 text-[10px] tracking-[0.2em] uppercase text-foreground">
                    Hips
                  </th>
                )}
                <th className="pb-3 pr-4 text-[10px] tracking-[0.2em] uppercase text-foreground">
                  Length
                </th>
                {hasShoulder && (
                  <th className="pb-3 text-[10px] tracking-[0.2em] uppercase text-foreground">
                    Shoulder
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {guide.map((entry) => (
                <tr
                  key={entry.size}
                  className="border-b border-border last:border-0"
                >
                  <td className="py-3 pr-4 text-sm font-medium">
                    {entry.size}
                  </td>
                  {hasChest && (
                    <td className="py-3 pr-4 text-sm text-muted-foreground">
                      {entry.chest}
                    </td>
                  )}
                  {hasWaist && (
                    <td className="py-3 pr-4 text-sm text-muted-foreground">
                      {entry.waist}
                    </td>
                  )}
                  {hasHips && (
                    <td className="py-3 pr-4 text-sm text-muted-foreground">
                      {entry.hips}
                    </td>
                  )}
                  <td className="py-3 pr-4 text-sm text-muted-foreground">
                    {entry.length}
                  </td>
                  {hasShoulder && (
                    <td className="py-3 text-sm text-muted-foreground">
                      {entry.shoulder}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Measurement Tips */}
        <div className="mt-8 border-t border-border pt-6">
          <p className="mb-3 text-[10px] tracking-[0.2em] uppercase text-foreground">
            How to Measure
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1 block h-1 w-1 shrink-0 bg-muted-foreground/50" />
              Chest: Measure around the fullest part of the bust
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1 block h-1 w-1 shrink-0 bg-muted-foreground/50" />
              Waist: Measure around the narrowest part of the waist
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1 block h-1 w-1 shrink-0 bg-muted-foreground/50" />
              Hips: Measure around the fullest part of the hips
            </li>
            <li className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1 block h-1 w-1 shrink-0 bg-muted-foreground/50" />
              If between sizes, we recommend ordering one size up
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
