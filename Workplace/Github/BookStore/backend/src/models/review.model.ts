export interface ProductReview {
  id: number
  userId: number
  productId: number
  ratingScore: 1 | 2 | 3 | 4 | 5
  content: string
  isShow: boolean
  createdAt: Date
  updatedAt: Date | null
}