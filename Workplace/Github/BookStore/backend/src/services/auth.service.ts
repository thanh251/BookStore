import pool from '../config/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, UserPayload } from '../models/user.model'

const formatUser = (user: any) => ({
  ...user,
  gender: user.gender?.[0] === 1 || user.gender === true
})

export const findByUsername = async (username: string): Promise<User | null> => {
  const [rows] = await pool.query(
    'SELECT * FROM user WHERE username = ?', [username]
  ) as any
  const results = rows as any[]
  return results.length > 0 ? formatUser(results[0]) : null
}

export const findByEmail = async (email: string): Promise<User | null> => {
  const [rows] = await pool.query(
    'SELECT * FROM user WHERE email = ?', [email]
  ) as any
  const results = rows as any[]
  return results.length > 0 ? formatUser(results[0]) : null
}

export const findByPhone = async (phoneNumber: string): Promise<User | null> => {
  const [rows] = await pool.query(
    'SELECT * FROM user WHERE phoneNumber = ?', [phoneNumber]
  ) as any
  const results = rows as any[]
  return results.length > 0 ? formatUser(results[0]) : null
}

export const createUser = async (data: Omit<User, 'id' | 'role'>): Promise<number> => {
  const hashedPassword = await bcrypt.hash(data.password, 10)
  
  try {
    const [result] = await pool.query(
      `INSERT INTO user (username, password, fullname, email, phoneNumber, gender, address, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'CUSTOMER')`,
      [
        data.username,
        hashedPassword,
        data.fullname,
        data.email,
        data.phoneNumber,
        data.gender ? 1 : 0,   // ← fix: boolean → 0/1 cho MySQL bit field
        data.address
      ]
    ) as any
    return result.insertId
  } catch (err: any) {
    console.error('❌ createUser error:', err.message)
    throw err
  }
}

export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  // Support cả MD5 cũ (123456) lẫn bcrypt mới
  const md5 = require('crypto').createHash('md5').update(plainPassword).digest('hex').toUpperCase()
  if (md5 === hashedPassword.toUpperCase()) return true
  return bcrypt.compare(plainPassword, hashedPassword)
}

export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  } as any)
}

export const verifyToken = (token: string): UserPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload
}