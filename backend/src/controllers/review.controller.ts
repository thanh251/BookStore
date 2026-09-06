import { Request, Response } from 'express'
import * as reviewService from '../services/review.service'

export const getByProductId = async (req: Request, res: Response) => {
  try {
    const data = await reviewService.getReviewsByProductId(Number(req.params.productId))
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { productId, ratingScore, content } = req.body

    if (!productId || !ratingScore || !content) {
      res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' })
      return
    }

    const id = await reviewService.createReview(userId, Number(productId), Number(ratingScore), content)
    res.status(201).json({ success: true, message: 'Đánh giá thành công', data: { id } })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { ratingScore, content } = req.body

    if (!ratingScore || !content) {
      res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' })
      return
    }

    const updated = await reviewService.updateReview(userId, Number(req.params.id), Number(ratingScore), content)
    if (!updated) {
      res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' })
      return
    }
    res.json({ success: true, message: 'Đã cập nhật đánh giá' })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const deleted = await reviewService.deleteReview(userId, Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' })
      return
    }
    res.json({ success: true, message: 'Đã xóa đánh giá' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// Admin
export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await reviewService.getAllReviews(
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10
    )
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const toggleVisibility = async (req: Request, res: Response) => {
  try {
    const toggled = await reviewService.toggleReviewVisibility(Number(req.params.id))
    if (!toggled) {
      res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' })
      return
    }
    res.json({ success: true, message: 'Đã cập nhật trạng thái hiển thị' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}