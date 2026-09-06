import pool from '../config/db'
import { Product, ProductQuery } from '../models/product.model'
 
const formatProduct = (product: any) => ({
  ...product,
  shop: product.shop?.[0] === 1 || product.shop === true
})
 
export const getProducts = async (query: ProductQuery) => {
  const { page = 1, limit = 12, search, categoryId, minPrice, maxPrice, sort } = query
  const offset = (page - 1) * limit
 
  let whereClauses = ['p.shop = 1']
  const params: any[] = []
 
  if (search) {
    whereClauses.push('(p.name LIKE ? OR p.author LIKE ?)')
    params.push(`%${search}%`, `%${search}%`)
  }
 
  if (categoryId) {
    whereClauses.push('pc.categoryId = ?')
    params.push(categoryId)
  }
 
  if (minPrice !== undefined) {
    whereClauses.push('p.price >= ?')
    params.push(minPrice)
  }
 
  if (maxPrice !== undefined) {
    whereClauses.push('p.price <= ?')
    params.push(maxPrice)
  }
 
  const whereSQL = 'WHERE ' + whereClauses.join(' AND ')
 
  const joinSQL = categoryId
    ? 'JOIN product_category pc ON p.id = pc.productId'
    : 'LEFT JOIN product_category pc ON p.id = pc.productId'
 
  let orderSQL = 'ORDER BY p.createdAt DESC'
  if (sort === 'price_asc') orderSQL = 'ORDER BY p.price ASC'
  if (sort === 'price_desc') orderSQL = 'ORDER BY p.price DESC'
  if (sort === 'bestseller') orderSQL = 'ORDER BY p.totalBuy DESC'
 
  const [rows] = await pool.query(
    `SELECT DISTINCT p.* FROM product p ${joinSQL} ${whereSQL} ${orderSQL} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  ) as any
 
  const [countRows] = await pool.query(
    `SELECT COUNT(DISTINCT p.id) as total FROM product p ${joinSQL} ${whereSQL}`,
    params
  ) as any
 
  const total = countRows[0].total
 
  return {
    data: (rows as any[]).map(formatProduct),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}
 
export const getProductById = async (id: number): Promise<Product | null> => {
  const [rows] = await pool.query(
    'SELECT * FROM product WHERE id = ?', [id]
  ) as any
  const results = rows as any[]
  return results.length > 0 ? formatProduct(results[0]) : null
}
 
export const getProductCategories = async (productId: number) => {
  const [rows] = await pool.query(
    `SELECT c.* FROM category c
     JOIN product_category pc ON c.id = pc.categoryId
     WHERE pc.productId = ?`,
    [productId]
  )
  return rows
}
 
export const createProduct = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
  const [result] = await pool.query(
    `INSERT INTO product
     (name, price, discount, quantity, totalBuy, author, pages, publisher,
      yearPublishing, description, imageName, shop, startsAt, endsAt, createdAt)
     VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      data.name, data.price, data.discount, data.quantity,
      data.author, data.pages, data.publisher, data.yearPublishing,
      data.description, data.imageName, data.shop, data.startsAt, data.endsAt
    ]
  ) as any
  return result.insertId
}
 
export const updateProduct = async (id: number, data: Partial<Product>): Promise<boolean> => {
  const [result] = await pool.query(
    `UPDATE product SET
     name = ?, price = ?, discount = ?, quantity = ?, author = ?,
     pages = ?, publisher = ?, yearPublishing = ?, description = ?,
     imageName = ?, shop = ?, startsAt = ?, endsAt = ?, updatedAt = NOW()
     WHERE id = ?`,
    [
      data.name, data.price, data.discount, data.quantity, data.author,
      data.pages, data.publisher, data.yearPublishing, data.description,
      data.imageName, data.shop, data.startsAt, data.endsAt, id
    ]
  ) as any
  return result.affectedRows > 0
}
 
export const deleteProduct = async (id: number): Promise<boolean> => {
  const [result] = await pool.query(
    'DELETE FROM product WHERE id = ?', [id]
  ) as any
  return result.affectedRows > 0
}
 
export const getBestsellers = async (limit = 8) => {
  const [rows] = await pool.query(
    'SELECT * FROM product WHERE shop = 1 ORDER BY totalBuy DESC LIMIT ?',
    [limit]
  ) as any
  return (rows as any[]).map(formatProduct)
}
 
export const getNewProducts = async (limit = 8) => {
  const [rows] = await pool.query(
    'SELECT * FROM product WHERE shop = 1 ORDER BY createdAt DESC LIMIT ?',
    [limit]
  ) as any
  return (rows as any[]).map(formatProduct)
}
 
export const getPromotions = async (limit = 8) => {
  const [rows] = await pool.query(
    'SELECT * FROM product WHERE shop = 1 AND discount > 0 ORDER BY discount DESC LIMIT ?',
    [limit]
  ) as any
  return (rows as any[]).map(formatProduct)
}