import { Router, Request, Response } from 'express'
import { upload } from '../middlewares/upload.middleware'
import { authenticate, authorize } from '../middlewares/auth.middleware'

const router = Router()

router.post(
  '/image',
  authenticate,
  authorize('ADMIN', 'EMPLOYEE'),
  upload.single('image'),
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Không có file nào được upload' })
      return
    }
    res.json({
      success: true,
      data: { fileName: req.file.filename }
    })
  }
)

export default router