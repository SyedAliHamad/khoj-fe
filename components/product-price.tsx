import type { ApiProduct } from "@/lib/api/types"
import { getProductPricing } from "@/lib/products"

interface ProductPriceProps {
  product: ApiProduct
  size?: "sm" | "md"
  showBadge?: boolean
}

export function ProductPrice({
  product,
  size = "sm",
  showBadge = true,
}: ProductPriceProps) {
  const { salePrice, originalPrice, discountPercent, isOnSale } =
    getProductPricing(product)

  const sizeClass = size === "sm" ? "text-sm" : "text-lg"

  if (isOnSale) {
    return (
      <div className="space-y-0.5">
        <div className={`flex flex-wrap items-center gap-2 ${sizeClass}`}>
          <span className="font-medium text-foreground">
            PKR {salePrice.toLocaleString()}
          </span>
          <span className="text-muted-foreground line-through">
            PKR {originalPrice!.toLocaleString()}
          </span>
          {showBadge && (
            <span className="rounded bg-foreground px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-background">
              {discountPercent}% off
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <p className={`${sizeClass} text-muted-foreground`}>
      PKR {salePrice.toLocaleString()}
    </p>
  )
}
