import { Router } from 'express'
import * as wishlistController from '../controllers/wishlist.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.use(authenticate)

router.get('/', wishlistController.getWishlist)
router.post('/', wishlistController.addToWishlist)
router.get('/check/:productId', wishlistController.checkWishlist)
router.delete('/:productId', wishlistController.removeFromWishlist)
router.delete('/', wishlistController.clearWishlist)

export default router