import mysql2 from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql2.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bookstore',
  waitForConnections: true,
  connectionLimit: 10,
})

// Test kết nối
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected!')
    conn.release()
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message)
  })

export default pool