import pool from '../config/db'

export const getWishlistByUserId = async (userId: number) => {
  const [rows] = await pool.query(
    `SELECT wi.id, wi.productId, wi.createdAt,
       p.name, p.price, p.discount, p.imageName, p.author
     FROM wishlist_item wi
     JOIN product p ON wi.productId = p.id
     WHERE wi.userId = ?
     ORDER BY wi.createdAt DESC`,
    [userId]
  ) as any
  return rows
}

export const addToWishlist = async (userId: number, productId: number): Promise<void> => {
  const [product] = await pool.query(
    'SELECT id FROM product WHERE id = ? AND shop = 1', [productId]
  ) as any
  if (product.length === 0) throw new Error('Sản phẩm không tồn tại')

  const [existing] = await pool.query(
    'SELECT id FROM wishlist_item WHERE userId = ? AND productId = ?',
    [userId, productId]
  ) as any
  if (existing.length > 0) throw new Error('Sản phẩm đã có trong danh sách yêu thích')

  await pool.query(
    'INSERT INTO wishlist_item (userId, productId, createdAt) VALUES (?, ?, NOW())',
    [userId, productId]
  )
}

export const removeFromWishlist = async (userId: number, productId: number): Promise<void> => {
  const [result] = await pool.query(
    'DELETE FROM wishlist_item WHERE userId = ? AND productId = ?',
    [userId, productId]
  ) as any
  if (result.affectedRows === 0) throw new Error('Sản phẩm không có trong danh sách yêu thích')
}

export const checkWishlist = async (userId: number, productId: number): Promise<boolean> => {
  const [rows] = await pool.query(
    'SELECT id FROM wishlist_item WHERE userId = ? AND productId = ?',
    [userId, productId]
  ) as any
  return rows.length > 0
}

export const clearWishlist = async (userId: number): Promise<void> => {
  await pool.query('DELETE FROM wishlist_item WHERE userId = ?', [userId])
}