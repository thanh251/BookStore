import { Request, Response } from 'express'
import * as productService from '../services/product.service'

export const getAll = async (req: Request, res: Response) => {
  try {
    const { page, limit, search, categoryId, minPrice, maxPrice, sort } = req.query
    const result = await productService.getProducts({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
      search: search as string,
      categoryId: categoryId ? Number(categoryId) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort as any
    })
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getById = async (req: Request, res: Response) => {
  try {
    const product = await productService.getProductById(Number(req.params.id))
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' })
      return
    }
    const categories = await productService.getProductCategories(Number(req.params.id))
    res.json({ success: true, data: { ...product, categories } })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const id = await productService.createProduct(req.body)
    res.status(201).json({ success: true, data: { id }, message: 'Product created' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const updated = await productService.updateProduct(Number(req.params.id), req.body)
    if (!updated) {
      res.status(404).json({ success: false, message: 'Product not found' })
      return
    }
    res.json({ success: true, message: 'Product updated' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    const deleted = await productService.deleteProduct(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Product not found' })
      return
    }
    res.json({ success: true, message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getBestsellers = async (req: Request, res: Response) => {
  try {
    const data = await productService.getBestsellers(Number(req.query.limit) || 8)
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getNewProducts = async (req: Request, res: Response) => {
  try {
    const data = await productService.getNewProducts(Number(req.query.limit) || 8)
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getPromotions = async (req: Request, res: Response) => {
  try {
    const data = await productService.getPromotions(Number(req.query.limit) || 8)
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}