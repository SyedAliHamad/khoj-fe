// ========================
// Standard API Response
// ========================
export interface ApiResponse<T> {
  code: number
  data: T | null
  message: string
}

// ========================
// Auth
// ========================
export interface RegisterRequest {
  name: string
  email: string
  phone: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl: string | null
  role: string
}

export interface AuthResponse {
  user: AuthUser
  tokens: AuthTokens
}

// ========================
// Products
// ========================
export interface ProductImage {
  id: string
  url: string
  alt: string
}

export interface SizeGuideEntry {
  size: string
  chest: string
  waist: string
  hips: string
  length: string
  shoulder: string
}

export interface Collection {
  id: string
  name: string
  slug: string
  image: string
  sortOrder: number
  count?: number
}

export interface ApiProduct {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  category: string
  collections?: string[]
  tags: string[]
  images: ProductImage[]
  description: string
  fabric: string
  details: string[]
  sizes: string[]
  sizeGuide: SizeGuideEntry[]
  inStock: boolean
  stockBySize: Record<string, number>
  createdAt: string
}

export interface ProductListParams {
  page?: number
  limit?: number
  category?: string
  collection?: string
  sort?: "newest" | "price-asc" | "price-desc" | "popular"
  search?: string
}

export interface CreateProductRequest {
  name: string
  slug?: string
  price: number
  compareAtPrice?: number
  category: string
  collectionIds?: string[]
  description?: string
  fabric?: string
  inStock?: boolean
  images?: ProductImage[]
  details?: string[]
  sizes?: string[]
  sizeGuide?: SizeGuideEntry[]
  tags?: string[]
  stockBySize?: Record<string, number>
}

export interface UpdateProductRequest {
  name?: string
  slug?: string
  price?: number
  compareAtPrice?: number
  category?: string
  collectionIds?: string[]
  description?: string
  fabric?: string
  inStock?: boolean
  images?: ProductImage[]
  details?: string[]
  sizes?: string[]
  sizeGuide?: SizeGuideEntry[]
  tags?: string[]
  stockBySize?: Record<string, number>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CategoryInfo {
  slug: string
  name: string
  count: number
  image?: string
}

// ========================
// Cart
// ========================
export interface CartItem {
  id: string
  productId: string
  product: ApiProduct
  size: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Cart {
  id: string
  items: CartItem[]
  itemCount: number
  subtotal: number
}

export interface AddToCartRequest {
  productId: string
  size: string
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

// ========================
// Addresses
// ========================
export interface Address {
  id: string
  label: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  province: string
  postalCode: string
  isDefault: boolean
}

export interface CreateAddressRequest {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  province: string
  postalCode: string
}

export interface CreateUserAddressRequest {
  label?: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  province: string
  postalCode: string
  isDefault?: boolean
}

export interface UpdateUserAddressRequest {
  label?: string
  fullName?: string
  phone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  province?: string
  postalCode?: string
  isDefault?: boolean
}

// ========================
// Checkout
// ========================
export type PaymentMethod = "cod" | "jazzcash" | "easypaisa" | "card"

export interface CheckoutInitiateRequest {
  addressId: string
}

export interface CheckoutSummary {
  orderId: string
  items: CartItem[]
  subtotal: number
  shippingFee: number
  tax: number
  discount: number
  total: number
  address: Address
  estimatedDelivery: string
}

export interface ProcessPaymentRequest {
  orderId: string
  paymentMethod: PaymentMethod
  paymentDetails?: Record<string, string>
}

/** Guest/offline cart checkout - backend creates address and order in one call */
export interface CheckoutWithItemsRequest {
  address: CreateAddressRequest
  items: { productId: string; size: string; quantity: number }[]
  paymentMethod: PaymentMethod
}

export interface CheckoutWithItemsResponse {
  orderId: string
  orderNumber: string
}

export interface PaymentResult {
  orderId: string
  paymentStatus: PaymentStatus
  redirectUrl: string | null
  transactionId: string | null
}

export interface VerifyPaymentRequest {
  orderId: string
  transactionId: string
  gatewayResponse: Record<string, string>
}

// ========================
// Orders
// ========================
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned"

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  size: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OrderTracking {
  status: OrderStatus
  timestamp: string
  description: string
}

export interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  tax: number
  discount: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  shippingAddress: Address
  tracking: OrderTracking[]
  estimatedDelivery: string
  createdAt: string
}

export interface CreateOrderRequest {
  addressId: string
  paymentMethod: PaymentMethod
}

// ========================
// User Profile
// ========================
export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl: string | null
  role: string
  addresses: Address[]
  createdAt: string
}

export interface UpdateProfileRequest {
  name?: string
  phone?: string
  address?: Omit<Address, "id" | "isDefault">
}

// ========================
// Wishlist
// ========================
export interface WishlistToggleRequest {
  productId: string
}

export interface WishlistResponse {
  productIds: string[]
}
