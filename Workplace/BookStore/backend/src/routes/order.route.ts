import { Router } from 'express'
import * as orderController from '../controllers/order.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'

const router = Router()

router.use(authenticate)

// Customer routes
router.get('/my', orderController.getMyOrders)
router.get('/my/:id', orderController.getMyOrderById)
router.post('/', orderController.createOrder)

// Admin routes
router.get('/', authorize('ADMIN', 'EMPLOYEE'), orderController.getAllOrders)
router.put('/:id/status', authorize('ADMIN', 'EMPLOYEE'), orderController.updateOrderStatus)

export default router