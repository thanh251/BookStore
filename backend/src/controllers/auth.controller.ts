import { Request, Response } from 'express'
import * as authService from '../services/auth.service'

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, fullname, email, phoneNumber, gender, address } = req.body

    if (!username || !password || !fullname || !email || !phoneNumber || !address) {
      res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' })
      return
    }

    if (username.length < 3 || username.length > 25) {
      res.status(400).json({ success: false, message: 'Username phải từ 3-25 ký tự' })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password phải ít nhất 6 ký tự' })
      return
    }

    const existingUsername = await authService.findByUsername(username)
    if (existingUsername) {
      res.status(409).json({ success: false, message: 'Username đã tồn tại' })
      return
    }

    const existingEmail = await authService.findByEmail(email)
    if (existingEmail) {
      res.status(409).json({ success: false, message: 'Email đã được sử dụng' })
      return
    }

    const existingPhone = await authService.findByPhone(phoneNumber)
    if (existingPhone) {
      res.status(409).json({ success: false, message: 'Số điện thoại đã được sử dụng' })
      return
    }

    const id = await authService.createUser({
      username, password, fullname, email,
      phoneNumber, gender: gender ?? false, address
    })

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: { id }
    })
  } catch (error: any) {
    console.error('❌ Register error:', error.message)  // ← thêm dòng này
    res.status(500).json({ success: false, message: 'Server error: ' + error.message })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập username và password' })
      return
    }

    const user = await authService.findByUsername(username)
    if (!user) {
      res.status(401).json({ success: false, message: 'Username hoặc password không đúng' })
      return
    }

    const isValid = await authService.verifyPassword(password, user.password)
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Username hoặc password không đúng' })
      return
    }

    const token = authService.generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    })

    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: userWithoutPassword
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    res.json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}