import { api } from "./client"
import type {
  UpdateProfileRequest,
  UserProfile,
  WishlistResponse,
  WishlistToggleRequest,
} from "./types"

export const userApi = {
  getProfile: () => api.get<UserProfile>("/user/profile"),

  updateProfile: (data: UpdateProfileRequest) =>
    api.patch<UserProfile>("/user/profile", data),

  toggleWishlist: (data: WishlistToggleRequest) =>
    api.post<WishlistResponse>("/wishlist/toggle", data),
}
