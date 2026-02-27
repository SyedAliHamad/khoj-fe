/**
 * Product types and helpers - data comes from API (productsApi)
 */

import type { ApiProduct, SizeGuideEntry } from "@/lib/api/types"

export type { SizeGuideEntry }

export type Product = ApiProduct

import { getDisplayImageUrl } from "./image-utils"

export interface ProductPricing {
  salePrice: number
  originalPrice: number | null
  discountPercent: number | null
  isOnSale: boolean
}

/** Get pricing info for discount display */
export function getProductPricing(product: Product): ProductPricing {
  const salePrice = product.price
  const originalPrice =
    product.compareAtPrice != null && product.compareAtPrice > salePrice
      ? product.compareAtPrice
      : null
  const discountPercent =
    originalPrice != null
      ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
      : null
  return {
    salePrice,
    originalPrice,
    discountPercent,
    isOnSale: discountPercent != null && discountPercent > 0,
  }
}

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
