import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0, totalRevenue: 0,
    pendingOrders: 0, totalProducts: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/orders?limit=5'),
      api.get('/products?limit=1')
    ]).then(([ordersRes, productsRes]) => {
      const orders = ordersRes.data.data
      const total = ordersRes.data.pagination?.total || 0
      const revenue = orders.reduce((sum: number, o: any) =>
        sum + (Number(o.subtotal) || 0) + (Number(o.deliveryPrice) || 0), 0)
      const pending = orders.filter((o: any) => o.status === 1).length

      setStats({
        totalOrders: total,
        totalRevenue: revenue,
        pendingOrders: pending,
        totalProducts: productsRes.data.pagination?.total || 0
      })
      setRecentOrders(orders)
    }).finally(() => setLoading(false))
  }, [])

  const STATUS = {
    1: { label: 'Chờ xác nhận', color: '#8B6914', bg: '#fef9ec' },
    2: { label: 'Đang xử lý', color: '#1d4ed8', bg: '#eff6ff' },
    3: { label: 'Đã giao', color: '#166534', bg: '#f0fef4' }
  }

  const navLinks = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Sản phẩm', icon: '📚' },
    { path: '/admin/orders', label: 'Đơn hàng', icon: '📦' },
    { path: '/admin/users', label: 'Người dùng', icon: '👥' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#faf9f7' }}>

      {/* Sidebar */}
      <aside style={{
        width: '220px', background: '#1a1a1a', flexShrink: 0,
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: 0, bottom: 0, zIndex: 10
      }}>
        <div style={{
          padding: '1.8rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.08)'
        }}>
          <Link to="/" style={{
            color: '#f5f0e8', fontSize: '16px', fontWeight: 600,
            letterSpacing: '0.15em', textDecoration: 'none',
            fontFamily: "'Playfair Display', serif"
          }}>BOOKSTORE</Link>
          <div style={{ fontSize: '11px', color: '#8B6914', marginTop: '4px', letterSpacing: '0.08em' }}>
            ADMIN PANEL
          </div>
        </div>
        <nav style={{ padding: '1rem 0', flex: 1 }}>
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '11px 1.5rem', textDecoration: 'none',
              fontSize: '13px', color: '#c8c0b0', transition: 'all 0.2s',
              borderLeft: location.pathname === link.path ? '2px solid #8B6914' : '2px solid transparent',
              background: location.pathname === link.path ? 'rgba(139,105,20,0.1)' : 'transparent',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f5f0e8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#c8c0b0')}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.5rem', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
          <Link to="/" style={{
            fontSize: '12px', color: '#c8c0b0', textDecoration: 'none'
          }}>← Về trang chủ</Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: '220px', flex: 1, padding: '2.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.15em',
            color: '#8B6914', textTransform: 'uppercase', marginBottom: '6px'
          }}>Tổng quan</div>
          <h1 style={{
            fontSize: '1.8rem', fontFamily: "'Playfair Display', serif",
            color: '#1a1a1a', fontWeight: 400
          }}>Dashboard</h1>
        </div>

        {/* Stat cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem', marginBottom: '2rem'
        }}>
          {[
            { label: 'Tổng đơn hàng', value: stats.totalOrders, icon: '📦', color: '#eff6ff' },
            { label: 'Doanh thu', value: formatPrice(stats.totalRevenue), icon: '💰', color: '#f0fef4' },
            { label: 'Chờ xác nhận', value: stats.pendingOrders, icon: '⏳', color: '#fef9ec' },
            { label: 'Sản phẩm', value: stats.totalProducts, icon: '📚', color: '#fdf4ff' },
          ].map(card => (
            <div key={card.label} style={{
              background: '#fff', borderRadius: '14px',
              border: '0.5px solid #e8e0d4', padding: '1.4rem',
              transition: 'box-shadow 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: card.color, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', marginBottom: '1rem'
              }}>{card.icon}</div>
              <div style={{
                fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a',
                fontFamily: "'Playfair Display', serif", marginBottom: '4px'
              }}>{loading ? '—' : card.value}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '0.5px solid #e8e0d4', overflow: 'hidden'
        }}>
          <div style={{
            padding: '1.2rem 1.5rem', borderBottom: '0.5px solid #e8e0d4',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h2 style={{
              fontSize: '14px', fontWeight: 600, color: '#1a1a1a'
            }}>Đơn hàng gần đây</h2>
            <Link to="/admin/orders" style={{
              fontSize: '12px', color: '#8B6914', textDecoration: 'none'
            }}>Xem tất cả →</Link>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>Đang tải...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#faf9f7' }}>
                  {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Tổng tiền', 'Trạng thái'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: '11px', letterSpacing: '0.08em',
                      color: '#999', textTransform: 'uppercase',
                      fontWeight: 500, borderBottom: '0.5px solid #e8e0d4'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any, idx: number) => {
                  const status = STATUS[order.status as 1 | 2 | 3]
                  return (
                    <tr key={order.id} style={{
                      borderBottom: idx < recentOrders.length - 1 ? '0.5px solid #f0ebe0' : 'none'
                    }}>
                      <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
                        #{order.id}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '13px', color: '#444' }}>
                        {order.fullname || '—'}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '13px', color: '#666' }}>
                        {order.totalItems} sản phẩm
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
                        {formatPrice((Number(order.subtotal) || 0) + (Number(order.deliveryPrice) || 0))}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                          fontWeight: 500, background: status.bg, color: status.color
                        }}>{status.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}