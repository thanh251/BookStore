import { Router } from 'express'
import * as reviewController from '../controllers/review.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'

const router = Router()

// Public
router.get('/product/:productId', reviewController.getByProductId)

// Customer
router.post('/', authenticate, reviewController.create)
router.put('/:id', authenticate, reviewController.update)
router.delete('/:id', authenticate, reviewController.remove)

// Admin
router.get('/', authenticate, authorize('ADMIN', 'EMPLOYEE'), reviewController.getAll)
router.patch('/:id/toggle', authenticate, authorize('ADMIN', 'EMPLOYEE'), reviewController.toggleVisibility)

export default router