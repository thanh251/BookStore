import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import './config/db'
import categoryRoute from './routes/category.route'
import productRoute from './routes/product.route'
import authRoute from './routes/auth.route'
import cartRoute from './routes/cart.route'
import orderRoute from './routes/order.route'
import wishlistRoute from './routes/wishlist.route'
import reviewRoute from './routes/review.route'
import userRoute from './routes/user.route'
import uploadRoute from './routes/upload.route'
import chatRoute from './routes/chat.routes'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve ảnh tĩnh
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Routes
app.use('/api/categories', categoryRoute)
app.use('/api/products', productRoute)
app.use('/api/auth', authRoute)
app.use('/api/cart', cartRoute)
app.use('/api/orders', orderRoute)
app.use('/api/wishlist', wishlistRoute)
app.use('/api/reviews', reviewRoute)
app.use('/api/users', userRoute)
app.use('/api/upload', uploadRoute)
app.use('/api/chat', chatRoute)

app.get('/', (req, res) => {
  res.json({ message: 'Bookstore API is running! 🚀' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

