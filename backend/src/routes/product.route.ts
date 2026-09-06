import { Router } from 'express'
import * as productController from '../controllers/product.controller'

const router = Router()

router.get('/', productController.getAll)
router.get('/bestsellers', productController.getBestsellers)
router.get('/new', productController.getNewProducts)
router.get('/promotions', productController.getPromotions)
router.get('/:id', productController.getById)
router.post('/', productController.create)
router.put('/:id', productController.update)
router.delete('/:id', productController.remove)

export default router