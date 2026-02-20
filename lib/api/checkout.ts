import { api } from "./client"
import type {
  CheckoutInitiateRequest,
  CheckoutSummary,
  CheckoutWithItemsRequest,
  CheckoutWithItemsResponse,
  PaymentResult,
  ProcessPaymentRequest,
  VerifyPaymentRequest,
} from "./types"

export const checkoutApi = {
  initiate: (data: CheckoutInitiateRequest) =>
    api.post<CheckoutSummary>("/checkout/initiate", data),

  /** Create order with inline address and items (guest checkout) */
  createOrderWithItems: (data: CheckoutWithItemsRequest) =>
    api.post<CheckoutWithItemsResponse>("/checkout/with-items", data),

  processPayment: (data: ProcessPaymentRequest) =>
    api.post<PaymentResult>("/checkout/payment", data),

  verifyPayment: (data: VerifyPaymentRequest) =>
    api.post<PaymentResult>("/checkout/verify", data),
}
