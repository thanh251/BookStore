import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderAPI } from '../../services/api'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

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

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<number | undefined>()
  const [updating, setUpdating] = useState<number | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await orderAPI.getAll({ page, limit: 10, status: filterStatus })
      setOrders(res.data.data)
      setPagination(res.data.pagination)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [page, filterStatus])

  const handleUpdateStatus = async (id: number, status: number) => {
    setUpdating(id)
    try {
      await orderAPI.updateStatus(id, status)
      await fetchOrders()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#faf9f7' }}>
      <aside style={{
        width: '220px', background: '#1a1a1a', flexShrink: 0,
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10
      }}>
        <div style={{ padding: '1.8rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          <Link to="/" style={{
            color: '#f5f0e8', fontSize: '16px', fontWeight: 600,
            letterSpacing: '0.15em', textDecoration: 'none',
            fontFamily: "'Playfair Display', serif"
          }}>BOOKSTORE</Link>
          <div style={{ fontSize: '11px', color: '#8B6914', marginTop: '4px' }}>ADMIN PANEL</div>
        </div>
        <nav style={{ padding: '1rem 0', flex: 1 }}>
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '11px 1.5rem', textDecoration: 'none', fontSize: '13px',
              color: '#c8c0b0', transition: 'color 0.2s',
              borderLeft: location.pathname === link.path ? '2px solid #8B6914' : '2px solid transparent',
              background: location.pathname === link.path ? 'rgba(139,105,20,0.1)' : 'transparent',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f5f0e8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#c8c0b0')}
            ><span>{link.icon}</span><span>{link.label}</span></Link>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.5rem', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
          <Link to="/" style={{ fontSize: '12px', color: '#c8c0b0', textDecoration: 'none' }}>
            ← Về trang chủ
          </Link>
        </div>
      </aside>

      <main style={{ marginLeft: '220px', flex: 1, padding: '2.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.15em',
            color: '#8B6914', textTransform: 'uppercase', marginBottom: '6px'
          }}>Quản lý</div>
          <h1 style={{
            fontSize: '1.8rem', fontFamily: "'Playfair Display', serif",
            color: '#1a1a1a', fontWeight: 400
          }}>Đơn hàng</h1>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
          {[
            { value: undefined, label: 'Tất cả' },
            { value: 1, label: 'Chờ xác nhận' },
            { value: 2, label: 'Đang xử lý' },
            { value: 3, label: 'Đã giao' },
          ].map(opt => (
            <button key={String(opt.value)}
              onClick={() => { setFilterStatus(opt.value); setPage(1) }}
              style={{
                padding: '7px 16px', borderRadius: '20px', fontSize: '12px',
                cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                background: filterStatus === opt.value ? '#1a1a1a' : '#fff',
                color: filterStatus === opt.value ? '#f5f0e8' : '#666',
                boxShadow: '0 0 0 0.5px #e8e0d4',
                fontFamily: "'Be Vietnam Pro', sans-serif"
              }}
            >{opt.label}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '0.5px solid #e8e0d4', overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#faf9f7' }}>
                {['Mã đơn', 'Khách hàng', 'Ngày đặt', 'Tổng tiền', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: '11px', letterSpacing: '0.08em', color: '#999',
                    textTransform: 'uppercase', fontWeight: 500,
                    borderBottom: '0.5px solid #e8e0d4'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
                  Đang tải...
                </td></tr>
              ) : orders.map((order: any, idx: number) => {
                const status = STATUS[order.status as 1 | 2 | 3]
                return (
                  <tr key={order.id} style={{
                    borderBottom: idx < orders.length - 1 ? '0.5px solid #f0ebe0' : 'none',
                    opacity: updating === order.id ? 0.5 : 1, transition: 'opacity 0.2s'
                  }}>
                    <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
                      #{order.id}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>
                        {order.fullname || '—'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999' }}>{order.email}</div>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: '#666' }}>
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
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
                    <td style={{ padding: '13px 16px' }}>
                      <select
                        value={order.status}
                        onChange={e => handleUpdateStatus(order.id, Number(e.target.value))}
                        disabled={updating === order.id}
                        style={{
                          padding: '6px 10px', borderRadius: '6px', fontSize: '12px',
                          border: '0.5px solid #e8e0d4', background: '#fff',
                          cursor: 'pointer', outline: 'none',
                          fontFamily: "'Be Vietnam Pro', sans-serif"
                        }}
                      >
                        <option value={1}>Chờ xác nhận</option>
                        <option value={2}>Đang xử lý</option>
                        <option value={3}>Đã giao</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{
              padding: '7px 14px', borderRadius: '6px', border: '0.5px solid #e8e0d4',
              background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.4 : 1, fontSize: '13px'
            }}>← Trước</button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                padding: '7px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
                border: page === p ? 'none' : '0.5px solid #e8e0d4',
                background: page === p ? '#1a1a1a' : '#fff',
                color: page === p ? '#f5f0e8' : '#1a1a1a'
              }}>{p}</button>
            ))}
            <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)} style={{
              padding: '7px 14px', borderRadius: '6px', border: '0.5px solid #e8e0d4',
              background: '#fff', cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer',
              opacity: page === pagination.totalPages ? 0.4 : 1, fontSize: '13px'
            }}>Sau →</button>
          </div>
        )}
      </main>
    </div>
  )
}