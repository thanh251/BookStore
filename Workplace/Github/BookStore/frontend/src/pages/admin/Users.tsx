import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const navLinks = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/products', label: 'Sản phẩm', icon: '📚' },
  { path: '/admin/orders', label: 'Đơn hàng', icon: '📦' },
  { path: '/admin/users', label: 'Người dùng', icon: '👥' },
]

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  ADMIN: { bg: '#1a1a1a', color: '#f5f0e8' },
  EMPLOYEE: { bg: '#eff6ff', color: '#1d4ed8' },
  CUSTOMER: { bg: '#f5f5f5', color: '#666' },
}

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/users', { params: { page, limit: 10, search: search || undefined } })
      setUsers(res.data.data)
      setPagination(res.data.pagination)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [page, search])

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
        <nav style={{ padding: '1rem 0' }}>
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
          }}>Người dùng</h1>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '1.5rem' }}>
          <input
            type="text" placeholder="Tìm theo tên, email..."
            defaultValue={search}
            onKeyDown={e => { if (e.key === 'Enter') { setSearch((e.target as HTMLInputElement).value); setPage(1) } }}
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              border: '0.5px solid #e8e0d4', borderRadius: '8px',
              fontSize: '13px', color: '#1a1a1a', outline: 'none',
              background: '#fff', fontFamily: "'Be Vietnam Pro', sans-serif"
            }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '14px' }}>🔍</span>
        </div>

        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '0.5px solid #e8e0d4', overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#faf9f7' }}>
                {['Người dùng', 'Username', 'Email', 'Điện thoại', 'Vai trò'].map(h => (
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
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
                  Đang tải...
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
                  {search ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
                </td></tr>
              ) : users.map((user: any, idx: number) => {
                const roleStyle = ROLE_STYLE[user.role] || ROLE_STYLE.CUSTOMER
                return (
                  <tr key={user.id} style={{
                    borderBottom: idx < users.length - 1 ? '0.5px solid #f0ebe0' : 'none'
                  }}>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: '#1a1a1a', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: 600, color: '#f5f0e8', flexShrink: 0
                        }}>{user.fullname?.charAt(0)?.toUpperCase()}</div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>
                          {user.fullname}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#666' }}>
                      @{user.username}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#666' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '13px', color: '#666' }}>
                      {user.phoneNumber}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                        fontWeight: 500, background: roleStyle.bg, color: roleStyle.color
                      }}>{user.role}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

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