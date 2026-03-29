import pool from '../config/db'
import { Category } from '../models/category.model'

export const getAllCategories = async (): Promise<Category[]> => {
  const [rows] = await pool.query('SELECT * FROM category ORDER BY id')
  return rows as Category[]
}

export const getCategoryById = async (id: number): Promise<Category | null> => {
  const [rows] = await pool.query('SELECT * FROM category WHERE id = ?', [id]) as any
  const results = rows as Category[]
  return results.length > 0 ? results[0] : null
}

export const createCategory = async (
  name: string,
  description: string,
  imageName: string
): Promise<number> => {
  const [result] = await pool.query(
    'INSERT INTO category (name, description, imageName) VALUES (?, ?, ?)',
    [name, description, imageName]
  ) as any
  return result.insertId
}

export const updateCategory = async (
  id: number,
  name: string,
  description: string,
  imageName: string
): Promise<boolean> => {
  const [result] = await pool.query(
    'UPDATE category SET name = ?, description = ?, imageName = ? WHERE id = ?',
    [name, description, imageName, id]
  ) as any
  return result.affectedRows > 0
}

export const deleteCategory = async (id: number): Promise<boolean> => {
  const [result] = await pool.query(
    'DELETE FROM category WHERE id = ?', [id]
  ) as any
  return result.affectedRows > 0
}