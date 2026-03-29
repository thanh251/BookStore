import pool from '../config/db'

export const getOrCreateCart = async (userId: number): Promise<number> => {
  const [rows] = await pool.query(
    'SELECT id FROM cart WHERE userId = ?', [userId]
  ) as any

  if (rows.length > 0) return rows[0].id

  const [result] = await pool.query(
    'INSERT INTO cart (userId, createdAt) VALUES (?, NOW())', [userId]
  ) as any
  return result.insertId
}

export const getCartByUserId = async (userId: number) => {
  const cartId = await getOrCreateCart(userId)

  const [items] = await pool.query(
    `SELECT
       ci.id, ci.productId, ci.quantity,
       p.name, p.price, p.discount, p.imageName,
       ROUND(p.price * (1 - p.discount / 100)) AS subtotal
     FROM cart_item ci
     JOIN product p ON ci.productId = p.id
     WHERE ci.cartId = ?`,
    [cartId]
  ) as any

  const totalPrice = items.reduce((sum: number, item: any) => {
    return sum + item.subtotal * item.quantity
  }, 0)

  return {
    cartId,
    items,
    totalPrice,
    totalItems: items.length
  }
}

export const addToCart = async (
  userId: number,
  productId: number,
  quantity: number
): Promise<void> => {
  const cartId = await getOrCreateCart(userId)

  // Kiểm tra product có tồn tại không
  const [productRows] = await pool.query(
    'SELECT id, quantity FROM product WHERE id = ? AND shop = 1', [productId]
  ) as any
  if (productRows.length === 0) throw new Error('Sản phẩm không tồn tại')

  const stock = productRows[0].quantity
  if (quantity > stock) throw new Error(`Chỉ còn ${stock} sản phẩm trong kho`)

  // Nếu đã có trong cart thì update quantity
  const [existing] = await pool.query(
    'SELECT id, quantity FROM cart_item WHERE cartId = ? AND productId = ?',
    [cartId, productId]
  ) as any

  if (existing.length > 0) {
    const newQty = existing[0].quantity + quantity
    if (newQty > stock) throw new Error(`Chỉ còn ${stock} sản phẩm trong kho`)
    await pool.query(
      'UPDATE cart_item SET quantity = ?, updatedAt = NOW() WHERE id = ?',
      [newQty, existing[0].id]
    )
  } else {
    await pool.query(
      'INSERT INTO cart_item (cartId, productId, quantity, createdAt) VALUES (?, ?, ?, NOW())',
      [cartId, productId, quantity]
    )
  }

  await pool.query('UPDATE cart SET updatedAt = NOW() WHERE id = ?', [cartId])
}

export const updateCartItem = async (
  userId: number,
  cartItemId: number,
  quantity: number
): Promise<void> => {
  const cartId = await getOrCreateCart(userId)

  const [items] = await pool.query(
    'SELECT ci.id, p.quantity as stock FROM cart_item ci JOIN product p ON ci.productId = p.id WHERE ci.id = ? AND ci.cartId = ?',
    [cartItemId, cartId]
  ) as any

  if (items.length === 0) throw new Error('Sản phẩm không có trong giỏ hàng')
  if (quantity > items[0].stock) throw new Error(`Chỉ còn ${items[0].stock} sản phẩm trong kho`)

  await pool.query(
    'UPDATE cart_item SET quantity = ?, updatedAt = NOW() WHERE id = ?',
    [quantity, cartItemId]
  )
}

export const removeCartItem = async (
  userId: number,
  cartItemId: number
): Promise<void> => {
  const cartId = await getOrCreateCart(userId)
  const [result] = await pool.query(
    'DELETE FROM cart_item WHERE id = ? AND cartId = ?',
    [cartItemId, cartId]
  ) as any
  if (result.affectedRows === 0) throw new Error('Sản phẩm không có trong giỏ hàng')
}

export const clearCart = async (userId: number): Promise<void> => {
  const cartId = await getOrCreateCart(userId)
  await pool.query('DELETE FROM cart_item WHERE cartId = ?', [cartId])
}