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
  createdAt: Date
  updatedAt: Date | null
  startsAt: Date | null
  endsAt: Date | null
}

export interface ProductQuery {
  page?: number
  limit?: number
  search?: string
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'bestseller'
}