import pool from '../config/db'

const formatReview = (review: any) => ({
  ...review,
  isShow: review.isShow?.[0] === 1 || review.isShow === true
})

export const getReviewsByProductId = async (productId: number) => {
  const [rows] = await pool.query(
    `SELECT pr.id, pr.ratingScore, pr.content, pr.createdAt,
       u.fullname, u.username
     FROM product_review pr
     JOIN user u ON pr.userId = u.id
     WHERE pr.productId = ? AND pr.isShow = 1
     ORDER BY pr.createdAt DESC`,
    [productId]
  ) as any

  const [stats] = await pool.query(
    `SELECT
       COUNT(*) as totalReviews,
       ROUND(AVG(ratingScore), 1) as avgRating,
       SUM(ratingScore = 5) as star5,
       SUM(ratingScore = 4) as star4,
       SUM(ratingScore = 3) as star3,
       SUM(ratingScore = 2) as star2,
       SUM(ratingScore = 1) as star1
     FROM product_review
     WHERE productId = ? AND isShow = 1`,
    [productId]
  ) as any

  return { reviews: rows, stats: stats[0] }
}

export const createReview = async (
  userId: number,
  productId: number,
  ratingScore: number,
  content: string
): Promise<number> => {
  const [product] = await pool.query(
    'SELECT id FROM product WHERE id = ?', [productId]
  ) as any
  if (product.length === 0) throw new Error('Sản phẩm không tồn tại')

  const [existing] = await pool.query(
    'SELECT id FROM product_review WHERE userId = ? AND productId = ?',
    [userId, productId]
  ) as any
  if (existing.length > 0) throw new Error('Bạn đã đánh giá sản phẩm này rồi')

  if (ratingScore < 1 || ratingScore > 5) throw new Error('Điểm đánh giá phải từ 1-5')

  const [result] = await pool.query(
    `INSERT INTO product_review (userId, productId, ratingScore, content, isShow, createdAt)
     VALUES (?, ?, ?, ?, 1, NOW())`,
    [userId, productId, ratingScore, content]
  ) as any
  return result.insertId
}

export const updateReview = async (
  userId: number,
  reviewId: number,
  ratingScore: number,
  content: string
): Promise<boolean> => {
  if (ratingScore < 1 || ratingScore > 5) throw new Error('Điểm đánh giá phải từ 1-5')

  const [result] = await pool.query(
    `UPDATE product_review SET ratingScore = ?, content = ?, updatedAt = NOW()
     WHERE id = ? AND userId = ?`,
    [ratingScore, content, reviewId, userId]
  ) as any
  return result.affectedRows > 0
}

export const deleteReview = async (userId: number, reviewId: number): Promise<boolean> => {
  const [result] = await pool.query(
    'DELETE FROM product_review WHERE id = ? AND userId = ?',
    [reviewId, userId]
  ) as any
  return result.affectedRows > 0
}

// Admin
export const getAllReviews = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit
  const [rows] = await pool.query(
    `SELECT pr.*, u.fullname, u.username, p.name as productName
     FROM product_review pr
     JOIN user u ON pr.userId = u.id
     JOIN product p ON pr.productId = p.id
     ORDER BY pr.createdAt DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  ) as any

  const [countRows] = await pool.query(
    'SELECT COUNT(*) as total FROM product_review'
  ) as any

  return {
    data: rows.map(formatReview),
    pagination: {
      page, limit,
      total: countRows[0].total,
      totalPages: Math.ceil(countRows[0].total / limit)
    }
  }
}

export const toggleReviewVisibility = async (reviewId: number): Promise<boolean> => {
  const [result] = await pool.query(
    `UPDATE product_review SET
       isShow = NOT isShow,
       updatedAt = NOW()
     WHERE id = ?`,
    [reviewId]
  ) as any
  return result.affectedRows > 0
}