"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import type { ApiProduct } from "@/lib/api/types"
import { toCartProduct } from "@/lib/products"

export interface CartProduct {
  id: string
  name: string
  price: number
  image: string
}

export interface CartItem {
  id: string // unique key: `${product.id}-${size}`
  product: CartProduct
  size: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  isDrawerOpen: boolean
  isLoading: boolean
  openDrawer: () => void
  closeDrawer: () => void
  addItem: (product: ApiProduct, size: string, quantity?: number) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function generateItemId(productId: string, size: string) {
  return `${productId}-${size}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isLoading] = useState(false)

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  const addItem = useCallback(
    (product: ApiProduct, size: string, quantity = 1) => {
      const cartProduct = toCartProduct(product)
      setItems((prev) => {
        const itemId = generateItemId(product.id, size)
        const existing = prev.find((item) => item.id === itemId)
        if (existing) {
          return prev.map((item) =>
            item.id === itemId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        }
        return [...prev, { id: itemId, product: cartProduct, size, quantity }]
      })
      setIsDrawerOpen(true)
      toast.success(`${cartProduct.name} added to bag`, {
        description: `Size ${size} | Qty ${quantity}`,
      })
    },
    []
  )

  const removeItem = useCallback((productId: string, size: string) => {
    setItems((prev) => {
      const itemId = generateItemId(productId, size)
      return prev.filter((item) => item.id !== itemId)
    })
    toast("Item removed from bag")
  }, [])

  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, size)
        return
      }
      setItems((prev) => {
        const itemId = generateItemId(productId, size)
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      })
    },
    [removeItem]
  )

  const clearCart = useCallback(() => {
    setItems([])
    toast("Bag cleared")
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        isDrawerOpen,
        isLoading,
        openDrawer,
        closeDrawer,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
