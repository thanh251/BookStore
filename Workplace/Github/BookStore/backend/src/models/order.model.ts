export interface Order {
  id: number
  userId: number
  status: 1 | 2 | 3        // 1=Pending, 2=Processing, 3=Delivered
  deliveryMethod: 1 | 2    // 1=Standard(15k), 2=Express(50k)
  deliveryPrice: number
  createdAt: Date
  updatedAt: Date | null
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  price: number
  discount: number
  quantity: number
  createdAt: Date
  updatedAt: Date | null
}

export const ORDER_STATUS = {
  1: 'Chờ xác nhận',
  2: 'Đang xử lý',
  3: 'Đã giao'
} as const

export const DELIVERY_METHOD = {
  1: { name: 'Tiêu chuẩn', price: 15000 },
  2: { name: 'Nhanh', price: 50000 }
} as const