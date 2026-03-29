import { Request, Response } from 'express'
import * as categoryService from '../services/category.service'

export const getAll = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategories()
    res.json({ success: true, data: categories })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getById = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getCategoryById(Number(req.params.id))
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' })
      return
    }
    res.json({ success: true, data: category })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const create = async (req: Request, res: Response) => {
  try {
    const { name, description, imageName } = req.body
    if (!name) {
      res.status(400).json({ success: false, message: 'Name is required' })
      return
    }
    const id = await categoryService.createCategory(name, description || '', imageName || '')
    res.status(201).json({ success: true, data: { id }, message: 'Category created' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const { name, description, imageName } = req.body
    const updated = await categoryService.updateCategory(
      Number(req.params.id), name, description || '', imageName || ''
    )
    if (!updated) {
      res.status(404).json({ success: false, message: 'Category not found' })
      return
    }
    res.json({ success: true, message: 'Category updated' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    const deleted = await categoryService.deleteCategory(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Category not found' })
      return
    }
    res.json({ success: true, message: 'Category deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}