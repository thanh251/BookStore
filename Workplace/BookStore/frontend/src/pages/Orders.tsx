import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { orderAPI } from '../services/api'
import type { Order } from '../types'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const STATUS = {
  1: { label: 'Chờ xác nhận', color: '#8B6914', bg: '#fef9ec' },
  2: { label: 'Đang xử lý', color: '#1d4ed8', bg: '#eff6ff' },
  3: { label: 'Đã giao', color: '#166534', bg: '#f0fef4' }
}

const DELIVERY = { 1: 'Tiêu chuẩn', 2: 'Nhanh' }

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const successId = searchParams.get('success')

  useEffect(() => {
    orderAPI.getMy().then(res => setOrders(res.data.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      <Navbar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '6rem 2rem 4rem' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.15em',
            color: '#8B6914', textTransform: 'uppercase', marginBottom: '6px'
          }}>Tài khoản</div>
          <h1 style={{
            fontSize: '2rem', fontFamily: "'Playfair Display', serif",
            color: '#1a1a1a', fontWeight: 400
          }}>Đơn hàng của tôi</h1>
        </div>

        {/* Success banner */}
        {successId && (
          <div style={{
            background: '#f0fef4', border: '0.5px solid #86efac',
            borderRadius: '12px', padding: '1rem 1.5rem',
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '2rem'
          }}>
            <span style={{ fontSize: '20px' }}>🎉</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#166534' }}>
                Đặt hàng thành công!
              </div>
              <div style={{ fontSize: '13px', color: '#16a34a' }}>
                Đơn hàng #{successId} đã được tạo. Chúng tôi sẽ xử lý sớm nhất có thể.
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#999' }}>Đang tải...</div>
        ) : orders.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '6rem',
            background: '#fff', borderRadius: '16px', border: '0.5px solid #e8e0d4'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
            <h2 style={{
              fontSize: '1.2rem', fontFamily: "'Playfair Display', serif",
              color: '#1a1a1a', fontWeight: 400, marginBottom: '0.5rem'
            }}>Chưa có đơn hàng nào</h2>
            <p style={{ color: '#999', fontSize: '14px', marginBottom: '2rem' }}>
              Hãy khám phá và đặt hàng ngay hôm nay
            </p>
            <Link to="/shop" style={{
              background: '#1a1a1a', color: '#f5f0e8',
              padding: '12px 28px', borderRadius: '8px',
              textDecoration: 'none', fontSize: '14px'
            }}>Khám phá cửa hàng</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((order: any) => {
              const status = STATUS[order.status as 1 | 2 | 3]
              return (
                <div key={order.id} style={{
                  background: '#fff', borderRadius: '14px',
                  border: '0.5px solid #e8e0d4', padding: '1.5rem',
                  transition: 'box-shadow 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: '1rem'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '15px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px'
                      }}>Đơn hàng #{order.id}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                        {' · '}
                        {DELIVERY[order.deliveryMethod as 1 | 2]}
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
                      fontWeight: 500, background: status.bg, color: status.color
                    }}>{status.label}</span>
                  </div>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', paddingTop: '1rem',
                    borderTop: '0.5px solid #f0ebe0'
                  }}>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {order.totalItems} sản phẩm
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }}>
                        {formatPrice((order.subtotal || 0) + order.deliveryPrice)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999' }}>
                        (bao gồm phí vận chuyển)
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}