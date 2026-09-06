import { Router } from 'express'
import * as cartController from '../controllers/cart.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Tất cả cart routes đều cần đăng nhập
router.use(authenticate)

router.get('/', cartController.getCart)
router.post('/items', cartController.addToCart)
router.put('/items/:itemId', cartController.updateCartItem)
router.delete('/items/:itemId', cartController.removeCartItem)
router.delete('/', cartController.clearCart)

export default router