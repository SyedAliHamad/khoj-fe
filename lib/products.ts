/**
 * Product types and helpers - data comes from API (productsApi)
 */

import type { ApiProduct, SizeGuideEntry } from "@/lib/api/types"

export type { SizeGuideEntry }

export type Product = ApiProduct

import { getDisplayImageUrl } from "./image-utils"

/** Get primary image URL from product */
export function getProductImage(product: Product): string {
  return getDisplayImageUrl(product.images?.[0]?.url)
}

/** Map ApiProduct to cart-friendly shape */
export function toCartProduct(product: Product): {
  id: string
  name: string
  price: number
  image: string
} {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: getProductImage(product),
  }
}
