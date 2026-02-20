"use client"

import { useEffect } from "react"
import { contentApi } from "@/lib/api/content"

/** Converts hex to HSL for Tailwind CSS variable format (H S% L%) */
function hexToHsl(hex: string): string {
  if (!hex || !hex.startsWith("#")) return "40 20% 98%"
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return "40 20% 98%"
  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }
  h = Math.round(h * 360)
  s = Math.round(s * 100)
  const lPct = Math.round(l * 100)
  return `${h} ${s}% ${lPct}%`
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    contentApi
      .getHomepage()
      .then((res) => {
        if (res.code === 200 && res.data?.backgroundColor) {
          const hex = res.data.backgroundColor
          if (hex && hex.startsWith("#")) {
            const hsl = hexToHsl(hex)
            document.documentElement.style.setProperty("--background", hsl)
            document.documentElement.style.setProperty("--card", hsl)
            document.documentElement.style.setProperty("--popover", hsl)
          }
        }
      })
      .catch(() => {})
  }, [])

  return <>{children}</>
}
