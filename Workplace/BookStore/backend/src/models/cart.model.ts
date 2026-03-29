export interface Cart {
  id: number
  userId: number
  createdAt: Date
  updatedAt: Date | null
}

export interface CartItem {
  id: number
  cartId: number
  productId: number
  quantity: number
  createdAt: Date
  updatedAt: Date | null
}

export interface CartItemResponse {
  id: number
  productId: number
  name: string
  price: number
  discount: number
  imageName: string
  quantity: number
  subtotal: number
}