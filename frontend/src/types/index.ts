export interface Product {
  id: number
  name: string
  price: number
  discount: number
  quantity: number
  totalBuy: number
  author: string
  pages: number
  publisher: string
  yearPublishing: number
  description: string | null
  imageName: string | null
  shop: boolean
  createdAt: string
  categories?: Category[]
}

export interface Category {
  id: number
  name: string
  description: string | null
  imageName: string | null
}

export interface User {
  id: number
  username: string
  fullname: string
  email: string
  phoneNumber: string
  gender: boolean
  address: string
  role: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER'
}

export interface CartItem {
  id: number
  productId: number
  name: string
  price: number
  discount: number
  imageName: string
  quantity: number
  subtotal: number
}

export interface Cart {
  cartId: number
  items: CartItem[]
  totalPrice: number
  totalItems: number
}

export interface Order {
  id: number
  userId: number
  status: 1 | 2 | 3
  deliveryMethod: 1 | 2
  deliveryPrice: number
  createdAt: string
  totalItems: number
  subtotal: number
}

export interface Review {
  id: number
  ratingScore: number
  content: string
  createdAt: string
  fullname: string
  username: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}