import { Router } from 'express'
import pool from '../config/db'
import { authenticate, authorize } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', authenticate, authorize('ADMIN', 'EMPLOYEE'), async (req, res) => {
  const { page = 1, limit = 10, search } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  const where = search ? `WHERE fullname LIKE ? OR email LIKE ? OR username LIKE ?` : ''
  const params: any[] = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []

  const [rows] = await pool.query(
    `SELECT id, username, fullname, email, phoneNumber, gender, address, role
     FROM user ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  ) as any
  const [count] = await pool.query(`SELECT COUNT(*) as total FROM user ${where}`, params) as any

  res.json({
    success: true, data: rows,
    pagination: { page: Number(page), limit: Number(limit), total: count[0].total, totalPages: Math.ceil(count[0].total / Number(limit)) }
  })
})

export default router