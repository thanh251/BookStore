import { Request, Response } from 'express'
import * as wishlistService from '../services/wishlist.service'

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const data = await wishlistService.getWishlistByUserId(userId)
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { productId } = req.body
    if (!productId) {
      res.status(400).json({ success: false, message: 'productId là bắt buộc' })
      return
    }
    await wishlistService.addToWishlist(userId, Number(productId))
    res.json({ success: true, message: 'Đã thêm vào danh sách yêu thích' })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    await wishlistService.removeFromWishlist(userId, Number(req.params.productId))
    res.json({ success: true, message: 'Đã xóa khỏi danh sách yêu thích' })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const checkWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const isFaved = await wishlistService.checkWishlist(userId, Number(req.params.productId))
    res.json({ success: true, data: { isFaved } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const clearWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    await wishlistService.clearWishlist(userId)
    res.json({ success: true, message: 'Đã xóa toàn bộ danh sách yêu thích' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}