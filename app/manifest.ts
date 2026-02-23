import type { MetadataRoute } from "next"
import { SITE_URL, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from "@/lib/seo"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KHOJ - White Clothing",
    short_name: "KHOJ",
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F5",
    theme_color: "#FAF8F5",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    categories: ["shopping", "lifestyle"],
  }
}
