import pool from '../config/db'
import { DELIVERY_METHOD } from '../models/order.model'
import { getCartByUserId, clearCart } from './cart.service'

export const getOrdersByUserId = async (userId: number) => {
  const [orders] = await pool.query(
    `SELECT o.*,
       COUNT(oi.id) as totalItems,
       SUM(oi.price * (1 - oi.discount/100) * oi.quantity) as subtotal
     FROM orders o
     LEFT JOIN order_item oi ON o.id = oi.orderId
     WHERE o.userId = ?
     GROUP BY o.id
     ORDER BY o.createdAt DESC`,
    [userId]
  ) as any
  return orders
}

export const getOrderById = async (id: number, userId?: number) => {
  const whereSQL = userId ? 'WHERE o.id = ? AND o.userId = ?' : 'WHERE o.id = ?'
  const params = userId ? [id, userId] : [id]

  const [orders] = await pool.query(
    `SELECT * FROM orders o ${whereSQL}`, params
  ) as any

  if (orders.length === 0) return null

  const [items] = await pool.query(
    `SELECT oi.*, p.name, p.imageName
     FROM order_item oi
     JOIN product p ON oi.productId = p.id
     WHERE oi.orderId = ?`,
    [id]
  ) as any

  return { ...orders[0], items }
}

export const createOrder = async (
  userId: number,
  deliveryMethod: 1 | 2
): Promise<number> => {
  const cart = await getCartByUserId(userId)

  if (cart.items.length === 0) {
    throw new Error('Giỏ hàng đang trống')
  }

  // Kiểm tra tồn kho
  for (const item of cart.items) {
    const [stock] = await pool.query(
      'SELECT quantity FROM product WHERE id = ?', [item.productId]
    ) as any
    if (stock[0].quantity < item.quantity) {
      throw new Error(`Sản phẩm "${item.name}" không đủ số lượng trong kho`)
    }
  }

  const deliveryPrice = DELIVERY_METHOD[deliveryMethod].price

  const conn = await (pool as any).getConnection()
  try {
    await conn.beginTransaction()

    // Tạo order
    const [orderResult] = await conn.query(
      `INSERT INTO orders (userId, status, deliveryMethod, deliveryPrice, createdAt)
       VALUES (?, 1, ?, ?, NOW())`,
      [userId, deliveryMethod, deliveryPrice]
    )
    const orderId = orderResult.insertId

    // Tạo order items + trừ tồn kho
    for (const item of cart.items) {
      await conn.query(
        `INSERT INTO order_item (orderId, productId, price, discount, quantity, createdAt)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [orderId, item.productId, item.price, item.discount, item.quantity]
      )
      await conn.query(
        `UPDATE product SET
           quantity = quantity - ?,
           totalBuy = totalBuy + ?
         WHERE id = ?`,
        [item.quantity, item.quantity, item.productId]
      )
    }

    await conn.commit()
    await clearCart(userId)
    return orderId
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    conn.release()
  }
}

export const updateOrderStatus = async (
  id: number,
  status: 1 | 2 | 3
): Promise<boolean> => {
  const [result] = await pool.query(
    'UPDATE orders SET status = ?, updatedAt = NOW() WHERE id = ?',
    [status, id]
  ) as any
  return result.affectedRows > 0
}

// Admin: lấy tất cả orders
export const getAllOrders = async (page = 1, limit = 10, status?: number) => {
  const offset = (page - 1) * limit
  const whereSQL = status ? 'WHERE o.status = ?' : ''
  const params: any[] = status ? [status] : []

  const [orders] = await pool.query(
    `SELECT o.*, u.fullname, u.email,
       COUNT(oi.id) as totalItems,
       SUM(oi.price * (1 - oi.discount/100) * oi.quantity) as subtotal
     FROM orders o
     JOIN user u ON o.userId = u.id
     LEFT JOIN order_item oi ON o.id = oi.orderId
     ${whereSQL}
     GROUP BY o.id
     ORDER BY o.createdAt DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  ) as any

  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total FROM orders o ${whereSQL}`, params
  ) as any

  return {
    data: orders,
    pagination: {
      page, limit,
      total: countRows[0].total,
      totalPages: Math.ceil(countRows[0].total / limit)
    }
  }
}