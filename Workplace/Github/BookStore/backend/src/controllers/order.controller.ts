import { Request, Response } from 'express'
import * as orderService from '../services/order.service'

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const orders = await orderService.getOrdersByUserId(userId)
    res.json({ success: true, data: orders })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getMyOrderById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const order = await orderService.getOrderById(Number(req.params.id), userId)
    if (!order) {
      res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
      return
    }
    res.json({ success: true, data: order })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { deliveryMethod = 1 } = req.body

    if (![1, 2].includes(Number(deliveryMethod))) {
      res.status(400).json({ success: false, message: 'Phương thức giao hàng không hợp lệ' })
      return
    }

    const orderId = await orderService.createOrder(userId, Number(deliveryMethod) as 1 | 2)
    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: { orderId }
    })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// Admin only
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { page, limit, status } = req.query
    const result = await orderService.getAllOrders(
      Number(page) || 1,
      Number(limit) || 10,
      status ? Number(status) : undefined
    )
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body
    if (![1, 2, 3].includes(Number(status))) {
      res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ (1, 2, 3)' })
      return
    }
    const updated = await orderService.updateOrderStatus(Number(req.params.id), Number(status) as 1 | 2 | 3)
    if (!updated) {
      res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
      return
    }
    res.json({ success: true, message: 'Đã cập nhật trạng thái đơn hàng' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}