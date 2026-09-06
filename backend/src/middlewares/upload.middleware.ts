import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Tạo thư mục uploads nếu chưa có
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = `product_${Date.now()}${ext}`
    cb(null, name)
  }
})

const fileFilter = (req: any, file: any, cb: any) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (allowed.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Chỉ chấp nhận file JPG, PNG, WEBP'))
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})