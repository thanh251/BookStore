import { Request, Response } from 'express'
import * as cartService from '../services/cart.service'

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const cart = await cartService.getCartByUserId(userId)
    res.json({ success: true, data: cart })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { productId, quantity = 1 } = req.body

    if (!productId) {
      res.status(400).json({ success: false, message: 'productId là bắt buộc' })
      return
    }

    await cartService.addToCart(userId, Number(productId), Number(quantity))
    res.json({ success: true, message: 'Đã thêm vào giỏ hàng' })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      res.status(400).json({ success: false, message: 'Số lượng không hợp lệ' })
      return
    }

    await cartService.updateCartItem(userId, Number(req.params.itemId), Number(quantity))
    res.json({ success: true, message: 'Đã cập nhật giỏ hàng' })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    await cartService.removeCartItem(userId, Number(req.params.itemId))
    res.json({ success: true, message: 'Đã xóa khỏi giỏ hàng' })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    await cartService.clearCart(userId)
    res.json({ success: true, message: 'Đã xóa toàn bộ giỏ hàng' })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}