import { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Không có token xác thực' })
      return
    }

    const token = authHeader.split(' ')[1]
    const payload = authService.verifyToken(token)
    ;(req as any).user = payload
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    if (!roles.includes(user.role)) {
      res.status(403).json({ success: false, message: 'Không có quyền truy cập' })
      return
    }
    next()
  }
}