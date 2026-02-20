# KHOJ Frontend - API Specification & Architecture Document

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Client Infrastructure](#2-api-client-infrastructure)
3. [Standard Response Contract](#3-standard-response-contract)
4. [Global Providers (React Context)](#4-global-providers-react-context)
5. [Complete API Endpoint Reference](#5-complete-api-endpoint-reference)
6. [Page-by-Page API Mapping](#6-page-by-page-api-mapping)
7. [Data Flow Diagrams](#7-data-flow-diagrams)
8. [Type Definitions](#8-type-definitions)

---

## 1. Architecture Overview

```
Frontend (Next.js 16 App Router)
|
|-- lib/api/client.ts        <-- Centralized fetch wrapper (JWT, refresh, error handling)
|-- lib/api/types.ts         <-- All TypeScript interfaces for requests & responses
|-- lib/api/auth.ts          <-- Auth service (login, register, refresh, logout)
|-- lib/api/products.ts      <-- Products service (list, detail, featured, categories)
|-- lib/api/cart.ts          <-- Cart service (get, add, update, remove, clear)
|-- lib/api/checkout.ts      <-- Checkout service (initiate, payment, verify)
|-- lib/api/orders.ts        <-- Orders service (create, list, detail)
|-- lib/api/user.ts          <-- User service (profile, update, wishlist)
|
|-- lib/auth-context.tsx     <-- AuthProvider (wraps app, manages user session)
|-- lib/cart-context.tsx     <-- CartProvider (wraps app, manages cart state)
|
|-- Pages that consume the above services
```

### Tech Stack

| Layer            | Technology               |
|------------------|--------------------------|
| Framework        | Next.js 16 (App Router)  |
| Language         | TypeScript               |
| Styling          | Tailwind CSS             |
| State Management | React Context            |
| Auth Tokens      | JWT (access + refresh)   |
| Notifications    | Sonner (toast)           |

---

## 2. API Client Infrastructure

**File:** `lib/api/client.ts`

The centralized API client handles all HTTP communication with the backend.

### Features

- **Base URL:** Reads from `NEXT_PUBLIC_API_BASE_URL` env variable, defaults to `/api`
- **Auto Auth Headers:** Automatically attaches `Authorization: Bearer <token>` to every request
- **401 Auto-Refresh:** On receiving a 401 response, the client automatically attempts a token refresh using the httpOnly refresh cookie. If refresh succeeds, it retries the original request. If refresh fails, it returns an unauthorized response
- **Singleton Refresh Lock:** Only one refresh request is made at a time (prevents race conditions)
- **Credentials:** All requests send `credentials: "include"` for httpOnly cookie support
- **Convenience Methods:** `api.get()`, `api.post()`, `api.patch()`, `api.delete()`

### Token Strategy

| Token         | Storage            | Sent Via                     | Lifetime      |
|---------------|--------------------|------------------------------|---------------|
| Access Token  | In-memory variable | `Authorization: Bearer` header | Short (15-30 min) |
| Refresh Token | httpOnly cookie    | Automatically via `credentials: "include"` | Long (7-30 days) |

---

## 3. Standard Response Contract

Every API endpoint MUST return this structure:

```json
{
  "code": 200,
  "data": { ... },
  "message": "Success"
}
```

| Field     | Type               | Description                                      |
|-----------|--------------------|--------------------------------------------------|
| `code`    | `number`           | HTTP-like status code (200, 201, 400, 401, 404, 500) |
| `data`    | `T | null`         | The response payload, or `null` on error         |
| `message` | `string`           | Human-readable message (success or error detail) |

### Common Status Codes

| Code | Meaning                | When Used                          |
|------|------------------------|------------------------------------|
| 200  | Success                | GET, PATCH, DELETE succeed         |
| 201  | Created                | POST register, POST create order   |
| 400  | Bad Request            | Validation failed                  |
| 401  | Unauthorized           | Token expired/invalid              |
| 404  | Not Found              | Product/order not found            |
| 409  | Conflict               | Email already registered           |
| 500  | Internal Server Error  | Unexpected backend failure         |

---

## 4. Global Providers (React Context)

### 4.1 AuthProvider (`lib/auth-context.tsx`)

Wraps the entire app in `layout.tsx`. Manages user authentication state.

**On App Load (mount):**
1. Calls `POST /auth/refresh` (uses httpOnly cookie)
2. If refresh succeeds, calls `GET /user/profile` to get user data
3. Sets `user` state and `isAuthenticated = true`
4. If refresh fails, user stays as guest (`isAuthenticated = false`)

**Exposed State & Methods:**

| Name              | Type                                   | Description                          |
|-------------------|----------------------------------------|--------------------------------------|
| `user`            | `AuthUser | null`                      | Current logged-in user or null       |
| `isLoading`       | `boolean`                              | True while initial auth check runs   |
| `isAuthenticated` | `boolean`                              | Whether a user is logged in          |
| `login(data)`     | `(LoginRequest) => Promise<Result>`    | Calls POST /auth/login               |
| `register(data)`  | `(RegisterRequest) => Promise<Result>` | Calls POST /auth/register            |
| `logout()`        | `() => Promise<void>`                  | Calls POST /auth/logout, clears user |

**APIs Used:**
- `POST /auth/refresh` (on mount)
- `GET /user/profile` (on mount, after refresh)
- `POST /auth/login` (when login() called)
- `POST /auth/register` (when register() called)
- `POST /auth/logout` (when logout() called)

---

### 4.2 CartProvider (`lib/cart-context.tsx`)

Wraps the entire app in `layout.tsx`. Manages shopping cart state and the cart drawer.

**Current implementation:** Client-side state (items stored in React state).  
**Backend integration path:** Replace `setItems` calls with `cartApi` calls (the service layer is already built).

**Exposed State & Methods:**

| Name                | Type                                                     | Description                         |
|---------------------|----------------------------------------------------------|-------------------------------------|
| `items`             | `CartItem[]`                                             | All items currently in cart         |
| `isDrawerOpen`      | `boolean`                                                | Whether cart drawer is visible      |
| `isLoading`         | `boolean`                                                | Loading state for API calls         |
| `openDrawer()`      | `() => void`                                             | Opens the slide-over cart drawer    |
| `closeDrawer()`     | `() => void`                                             | Closes the cart drawer              |
| `addItem()`         | `(product, size, quantity?) => void`                     | Adds an item to cart                |
| `removeItem()`      | `(productId, size) => void`                              | Removes a specific item             |
| `updateQuantity()`  | `(productId, size, quantity) => void`                    | Updates item quantity               |
| `clearCart()`       | `() => void`                                             | Empties the entire cart             |
| `totalItems`        | `number`                                                 | Sum of all item quantities          |
| `totalPrice`        | `number`                                                 | Sum of all (price * quantity)       |

**APIs to Integrate (service layer ready in `lib/api/cart.ts`):**

| Method             | API Endpoint              | When to Call                  |
|--------------------|---------------------------|-------------------------------|
| `addItem()`        | `POST /cart/items`        | When user adds item to bag    |
| `removeItem()`     | `DELETE /cart/items/:id`  | When user removes item        |
| `updateQuantity()` | `PATCH /cart/items/:id`   | When user changes qty         |
| `clearCart()`      | `DELETE /cart`            | When user clears bag          |
| On mount (if auth) | `GET /cart`               | Fetch server-side cart on load|

---

## 5. Complete API Endpoint Reference

### 5.1 Authentication (4 endpoints)

| #  | Method | Endpoint          | Auth Required | Request Body                                   | Response Data          | Used By                              |
|----|--------|-------------------|---------------|------------------------------------------------|------------------------|--------------------------------------|
| 1  | POST   | `/auth/register`  | No            | `{ name, email, phone, password }`             | `AuthResponse`         | Register page, AuthProvider          |
| 2  | POST   | `/auth/login`     | No            | `{ email, password }`                          | `AuthResponse`         | Login page, AuthProvider             |
| 3  | POST   | `/auth/refresh`   | Cookie        | _(empty, uses httpOnly refresh cookie)_        | `{ accessToken }`      | API client (auto), AuthProvider      |
| 4  | POST   | `/auth/logout`    | Yes           | _(empty)_                                      | `null`                 | Account page, AuthProvider           |

**AuthResponse shape:**
```typescript
{
  user: { id, name, email, phone, avatarUrl },
  tokens: { accessToken, refreshToken }
}
```

**Backend Notes:**
- On register/login: Set `refreshToken` as httpOnly, Secure, SameSite=Strict cookie
- On refresh: Validate the httpOnly cookie, issue new `accessToken`
- On logout: Clear the refresh cookie, invalidate the refresh token in DB

---

### 5.2 Products (4 endpoints)

| #  | Method | Endpoint                | Auth Required | Query Parameters                              | Response Data                | Used By                              |
|----|--------|-------------------------|---------------|-----------------------------------------------|------------------------------|--------------------------------------|
| 5  | GET    | `/products`             | No            | `page, limit, category, sort, search`         | `PaginatedResponse<Product>` | Collection page                      |
| 6  | GET    | `/products/:id`         | No            | _none_                                        | `ApiProduct`                 | Product detail page                  |
| 7  | GET    | `/products/featured`    | No            | _none_                                        | `ApiProduct[]`               | Homepage product grid                |
| 8  | GET    | `/products/categories`  | No            | _none_                                        | `CategoryInfo[]`             | Collection page filters, categories  |

**Query Parameter Details for `/products`:**

| Param      | Type     | Default | Options                                  |
|------------|----------|---------|------------------------------------------|
| `page`     | `number` | 1       | Any positive integer                     |
| `limit`    | `number` | 12      | Suggested: 12, 24, 48                    |
| `category` | `string` | _all_   | `kurtas`, `sets`, `dupattas`, `trousers` |
| `sort`     | `string` | _none_  | `newest`, `price-asc`, `price-desc`, `popular` |
| `search`   | `string` | _none_  | Free text search                         |

**Product Object Shape:**
```typescript
{
  id: string,
  name: string,
  slug: string,
  price: number,
  compareAtPrice: number | null,     // for showing sale/original price
  category: string,
  tags: string[],                    // e.g. ["new", "bestseller"]
  images: [{ id, url, alt }],       // multiple product images
  description: string,
  fabric: string,
  details: string[],                 // e.g. ["Hand-embroidered", "Unstitched"]
  sizes: string[],                   // e.g. ["XS","S","M","L","XL"]
  sizeGuide: [{ size, chest, waist, hips, length, shoulder }],
  inStock: boolean,
  stockBySize: { "S": 5, "M": 10 }, // stock per size
  createdAt: string
}
```

---

### 5.3 Cart (5 endpoints)

| #  | Method | Endpoint            | Auth Required | Request Body                          | Response Data | Used By                              |
|----|--------|---------------------|---------------|---------------------------------------|---------------|--------------------------------------|
| 9  | GET    | `/cart`             | Yes           | _none_                                | `Cart`        | CartProvider (on mount), cart page    |
| 10 | POST   | `/cart/items`       | Yes           | `{ productId, size, quantity }`       | `Cart`        | Add to bag (all surfaces)            |
| 11 | PATCH  | `/cart/items/:id`   | Yes           | `{ quantity }`                        | `Cart`        | Cart page qty +/- buttons            |
| 12 | DELETE | `/cart/items/:id`   | Yes           | _none_                                | `Cart`        | Cart page remove button              |
| 13 | DELETE | `/cart`             | Yes           | _none_                                | `null`        | Clear cart                           |

**Cart Object Shape:**
```typescript
{
  id: string,
  items: [{
    id: string,           // cart item ID (used for PATCH/DELETE)
    productId: string,
    product: ApiProduct,  // embedded product data
    size: string,
    quantity: number,
    unitPrice: number,
    totalPrice: number
  }],
  itemCount: number,
  subtotal: number
}
```

**Backend Notes:**
- Cart items are uniquely identified by `productId + size` combination
- Adding same product+size again should increment quantity
- Return full updated cart after every mutation (single source of truth)
- For guest users: backend can use session-based cart or the frontend can continue with client-side state

---

### 5.4 Checkout (3 endpoints)

| #  | Method | Endpoint              | Auth Required | Request Body                                   | Response Data      | Used By                              |
|----|--------|-----------------------|---------------|------------------------------------------------|--------------------|--------------------------------------|
| 14 | POST   | `/checkout/initiate`  | Yes           | `{ addressId }`                                | `CheckoutSummary`  | Checkout page (review step)          |
| 15 | POST   | `/checkout/payment`   | Yes           | `{ orderId, paymentMethod, paymentDetails? }`  | `PaymentResult`    | Checkout page (place order)          |
| 16 | POST   | `/checkout/verify`    | Yes           | `{ orderId, transactionId, gatewayResponse }`  | `PaymentResult`    | After mobile wallet redirect         |

**Checkout Flow:**

```
Step 1: User fills shipping form
Step 2: User selects payment method (COD / JazzCash / Easypaisa / Card)
Step 3: User reviews order
Step 4: Frontend calls POST /checkout/initiate -> gets CheckoutSummary with orderId
Step 5: Frontend calls POST /checkout/payment -> processes payment
        - COD: Immediate success, order confirmed
        - JazzCash/Easypaisa: Returns redirectUrl, user redirected
        - Card: Returns gateway URL or handled via payment form
Step 6 (if redirect): After gateway redirect, call POST /checkout/verify
Step 7: Show confirmation with order number
```

**CheckoutSummary shape:**
```typescript
{
  orderId: string,
  items: CartItem[],
  subtotal: number,
  shippingFee: number,      // Free above PKR 5,000
  tax: number,
  discount: number,
  total: number,
  address: Address,
  estimatedDelivery: string
}
```

**PaymentResult shape:**
```typescript
{
  orderId: string,
  paymentStatus: "pending" | "paid" | "failed" | "refunded",
  redirectUrl: string | null,    // for JazzCash/Easypaisa
  transactionId: string | null
}
```

**Supported Payment Methods:**

| ID          | Label              | Flow                             |
|-------------|--------------------|----------------------------------|
| `cod`       | Cash on Delivery   | Direct confirmation, no redirect |
| `jazzcash`  | JazzCash           | Redirect to JazzCash gateway     |
| `easypaisa` | Easypaisa          | Redirect to Easypaisa gateway    |
| `card`      | Credit/Debit Card  | Card form or redirect to gateway |

---

### 5.5 Orders (3 endpoints)

| #  | Method | Endpoint        | Auth Required | Query Parameters  | Request Body                        | Response Data            | Used By                              |
|----|--------|-----------------|---------------|-------------------|-------------------------------------|--------------------------|--------------------------------------|
| 17 | POST   | `/orders`       | Yes           | _none_            | `{ addressId, paymentMethod }`      | `Order`                  | Checkout (alternative to /checkout)  |
| 18 | GET    | `/orders`       | Yes           | `page, limit`     | _none_                              | `PaginatedResponse<Order>` | Orders page                        |
| 19 | GET    | `/orders/:id`   | Yes           | _none_            | _none_                              | `Order`                  | Order detail page                    |

**Order Object Shape:**
```typescript
{
  id: string,
  orderNumber: string,            // e.g. "KHJ-ABC123"
  items: [{
    id, productId, productName, productImage,
    size, quantity, unitPrice, totalPrice
  }],
  subtotal: number,
  shippingFee: number,
  tax: number,
  discount: number,
  total: number,
  status: OrderStatus,            // "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned"
  paymentStatus: PaymentStatus,   // "pending" | "paid" | "failed" | "refunded"
  paymentMethod: PaymentMethod,
  shippingAddress: Address,
  tracking: [{
    status: string,
    timestamp: string,
    description: string           // e.g. "Shipped via TCS Express - Tracking #TCS123456"
  }],
  estimatedDelivery: string,
  createdAt: string
}
```

---

### 5.6 User Profile (2 endpoints)

| #  | Method | Endpoint         | Auth Required | Request Body                               | Response Data  | Used By                              |
|----|--------|------------------|---------------|--------------------------------------------|----------------|--------------------------------------|
| 20 | GET    | `/user/profile`  | Yes           | _none_                                     | `UserProfile`  | AuthProvider (on mount), Account page|
| 21 | PATCH  | `/user/profile`  | Yes           | `{ name?, phone?, address? }`              | `UserProfile`  | Account page (edit profile)          |

**UserProfile shape:**
```typescript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  avatarUrl: string | null,
  addresses: Address[],
  createdAt: string
}
```

---

### 5.7 Wishlist (1 endpoint)

| #  | Method | Endpoint           | Auth Required | Request Body        | Response Data      | Used By                              |
|----|--------|--------------------|---------------|---------------------|--------------------|--------------------------------------|
| 22 | POST   | `/wishlist/toggle` | Yes           | `{ productId }`     | `WishlistResponse` | Product card hearts, product detail  |

**WishlistResponse shape:**
```typescript
{
  productIds: string[]    // full list of wishlisted product IDs
}
```

---

## 6. Page-by-Page API Mapping

### 6.1 Homepage (`/`)
**File:** `app/page.tsx`

| Section          | Component              | API Endpoint                | When Called        |
|------------------|------------------------|-----------------------------|--------------------|
| Product Grid     | `product-grid.tsx`     | `GET /products/featured`    | On page load       |
| Add to Bag hover | `product-grid.tsx`     | `POST /cart/items`          | On hover btn click |
| Wishlist heart   | `product-grid.tsx`     | `POST /wishlist/toggle`     | On heart click     |
| Categories       | `categories-section.tsx`| `GET /products/categories` | On page load       |

---

### 6.2 Collection Page (`/collection`)
**File:** `app/collection/page.tsx`

| Feature            | API Endpoint              | When Called                       |
|--------------------|---------------------------|-----------------------------------|
| Product listing    | `GET /products`           | On page load, on filter/sort change |
| Category filters   | `GET /products/categories`| On page load                      |
| Add to Bag overlay | `POST /cart/items`        | On hover button click             |
| Wishlist heart     | `POST /wishlist/toggle`   | On heart click                    |

**Query param examples:**
- All products: `GET /products?page=1&limit=12`
- Filter by category: `GET /products?category=kurtas&page=1&limit=12`
- Sort by price: `GET /products?sort=price-asc&page=1&limit=12`
- Combined: `GET /products?category=sets&sort=newest&page=1&limit=12`

---

### 6.3 Product Detail Page (`/product/:id`)
**File:** `app/product/[id]/page.tsx`

| Feature           | API Endpoint             | When Called                    |
|-------------------|--------------------------|--------------------------------|
| Product data      | `GET /products/:id`      | On page load                   |
| Related products  | `GET /products`          | On page load (filtered by category) |
| Add to Bag        | `POST /cart/items`       | On "Add to Bag" button click   |
| Wishlist toggle   | `POST /wishlist/toggle`  | On heart button click          |
| Size Guide        | _(from product data)_    | Displayed from product.sizeGuide |

---

### 6.4 Cart Page (`/cart`)
**File:** `app/cart/page.tsx`

| Feature            | API Endpoint              | When Called              |
|--------------------|---------------------------|--------------------------|
| Load cart          | `GET /cart`               | On page load             |
| Update quantity    | `PATCH /cart/items/:id`   | On +/- buttons           |
| Remove item        | `DELETE /cart/items/:id`  | On remove button         |
| Clear cart         | `DELETE /cart`            | On "Clear all" action    |
| Proceed to checkout| _(navigation)_            | Links to /checkout       |

---

### 6.5 Cart Drawer (Slide-over)
**File:** `components/cart-drawer.tsx`

| Feature           | API Endpoint              | When Called              |
|-------------------|---------------------------|--------------------------|
| Show items        | _(from CartContext)_      | On drawer open           |
| Update quantity   | `PATCH /cart/items/:id`   | On +/- buttons           |
| Remove item       | `DELETE /cart/items/:id`  | On X button              |
| View full cart    | _(navigation)_            | Links to /cart           |
| Checkout          | _(navigation)_            | Links to /checkout       |

---

### 6.6 Checkout Page (`/checkout`)
**File:** `app/checkout/page.tsx`

Multi-step form: Shipping -> Payment -> Review -> Confirmation

| Step           | API Endpoint               | When Called                           |
|----------------|----------------------------|---------------------------------------|
| Shipping       | _(client-side form)_       | User fills address form               |
| Payment        | _(client-side selection)_  | User selects payment method           |
| Review         | `POST /checkout/initiate`  | When entering review step             |
| Place Order    | `POST /checkout/payment`   | On "Place Order" button               |
| Redirect back  | `POST /checkout/verify`    | After JazzCash/Easypaisa redirect     |
| Confirmation   | _(client-side)_            | Display order number from response    |

**Shipping form validation (client-side):**
- Full Name: required
- Email: required, valid format
- Phone: required
- Address Line 1: required
- City: required
- Province: required (dropdown with PK provinces)
- Postal Code: required

---

### 6.7 Login Page (`/auth/login`)
**File:** `app/auth/login/page.tsx`

| Feature    | API Endpoint        | When Called         |
|------------|---------------------|---------------------|
| Sign In    | `POST /auth/login`  | On form submit      |

**Fields:** email (required), password (required)  
**On success:** Redirect to `/account`  
**On error:** Show error message from `response.message`

---

### 6.8 Register Page (`/auth/register`)
**File:** `app/auth/register/page.tsx`

| Feature          | API Endpoint           | When Called         |
|------------------|------------------------|---------------------|
| Create Account   | `POST /auth/register`  | On form submit      |

**Fields:** name, email, phone, password, confirmPassword (all required)  
**Client-side validations:** Password min 8 chars, passwords must match  
**On success:** Redirect to `/account`  
**On error:** Show error message from `response.message`

---

### 6.9 Account Page (`/account`)
**File:** `app/account/page.tsx`

| Feature      | API Endpoint        | When Called                  |
|--------------|---------------------|------------------------------|
| User info    | _(from AuthContext)_ | Loaded from AuthProvider state |
| Sign Out     | `POST /auth/logout` | On "Sign Out" button click   |

**If not authenticated:** Shows sign-in / create account prompt with links.

---

### 6.10 Orders Page (`/orders`)
**File:** `app/orders/page.tsx`

| Feature      | API Endpoint       | When Called     |
|--------------|--------------------|-----------------|
| Order list   | `GET /orders`      | On page load    |

Displays: order number, date, status badge, item previews, total price.

---

### 6.11 Order Detail Page (`/orders/:id`)
**File:** `app/orders/[id]/page.tsx`

| Feature          | API Endpoint         | When Called     |
|------------------|----------------------|-----------------|
| Order detail     | `GET /orders/:id`    | On page load    |

Displays: tracking timeline, items list, shipping address, payment info, order summary, estimated delivery.

---

## 7. Data Flow Diagrams

### 7.1 Authentication Flow

```
User opens app
  |
  v
AuthProvider mounts
  |
  +--> POST /auth/refresh (uses httpOnly cookie)
  |      |
  |      +--> 200: Token refreshed
  |      |      |
  |      |      +--> GET /user/profile
  |      |             |
  |      |             +--> Set user state (authenticated)
  |      |
  |      +--> 401: Not authenticated (guest mode)
  |
  v
App renders with auth state
```

### 7.2 Add to Cart Flow

```
User clicks "Add to Bag"
  |
  v
CartContext.addItem(product, size, quantity)
  |
  +--> [If authenticated] POST /cart/items { productId, size, quantity }
  |      |
  |      +--> 200: Update cart state from server response
  |      +--> 401: Redirect to login
  |
  +--> [If guest] Update local cart state
  |
  +--> Open cart drawer
  +--> Show toast notification
```

### 7.3 Checkout Flow

```
/checkout page loads
  |
  v
Step 1: SHIPPING
  +--> User fills address form (client-side)
  +--> Validates all fields
  +--> Proceeds to payment
  |
  v
Step 2: PAYMENT
  +--> User selects payment method
  +--> Proceeds to review
  |
  v
Step 3: REVIEW
  +--> POST /checkout/initiate { addressId }
  |      +--> Returns CheckoutSummary with orderId, fees, total
  +--> User reviews everything
  +--> Clicks "Place Order"
  |
  v
POST /checkout/payment { orderId, paymentMethod }
  |
  +--> COD: paymentStatus = "pending", order confirmed
  |      +--> Show confirmation
  |
  +--> JazzCash/Easypaisa: redirectUrl returned
  |      +--> Redirect user to payment gateway
  |      +--> On return: POST /checkout/verify
  |      +--> Show confirmation
  |
  +--> Card: Process inline or redirect
         +--> Show confirmation
```

### 7.4 Order Lifecycle

```
pending --> confirmed --> processing --> shipped --> delivered
                                    |
                                    +--> cancelled (at any point before shipped)
                                                 |
                                                 +--> returned (after delivered)
```

---

## 8. Type Definitions

All types are defined in `lib/api/types.ts`. Here is a summary of the key interfaces:

### Shared Types

```typescript
// Standard API wrapper
interface ApiResponse<T> { code: number; data: T | null; message: string }

// Pagination wrapper
interface PaginatedResponse<T> {
  items: T[]; total: number; page: number; limit: number; totalPages: number
}

// Address (used in checkout, orders, user profile)
interface Address {
  id: string; label: string; fullName: string; phone: string;
  addressLine1: string; addressLine2: string;
  city: string; province: string; postalCode: string; isDefault: boolean
}

// Payment types
type PaymentMethod = "cod" | "jazzcash" | "easypaisa" | "card"
type PaymentStatus = "pending" | "paid" | "failed" | "refunded"
type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned"
```

---

## Summary: Total API Count

| Domain      | Endpoints | Methods                                           |
|-------------|-----------|---------------------------------------------------|
| Auth        | 4         | register, login, refresh, logout                  |
| Products    | 4         | list, getById, featured, categories               |
| Cart        | 5         | get, addItem, updateItem, removeItem, clear       |
| Checkout    | 3         | initiate, processPayment, verifyPayment           |
| Orders      | 3         | create, list, getById                             |
| User        | 2         | getProfile, updateProfile                         |
| Wishlist    | 1         | toggle                                            |
| **Total**   | **22**    |                                                   |
