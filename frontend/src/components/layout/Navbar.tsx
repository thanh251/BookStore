import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authStore } from '../../store/authStore'
import { cartAPI } from '../../services/api'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()
  const user = authStore.getUser()
  const isLoggedIn = authStore.isLoggedIn()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      cartAPI.get().then(res => {
        setCartCount(res.data.data.totalItems)
      }).catch(() => {})
    }
  }, [isLoggedIn])

  const handleMenuEnter = () => {
    if (menuTimeout.current) clearTimeout(menuTimeout.current)
    setMenuOpen(true)
  }

  const handleMenuLeave = () => {
    menuTimeout.current = setTimeout(() => setMenuOpen(false), 150)
  }

  const handleLogout = () => {
    authStore.logout()
    setMenuOpen(false)
    setCartCount(0)
    navigate('/')
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(26,26,26,0.97)' : '#1a1a1a',
      backdropFilter: 'blur(12px)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 2rem',
      height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      {/* Logo */}
      <Link to="/" style={{
        color: '#f5f0e8', fontSize: '20px', fontWeight: 600,
        letterSpacing: '0.12em', textDecoration: 'none',
        fontFamily: "'Playfair Display', serif"
      }}>
        BOOKSTORE
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {(['/', '/shop'] as const).map((path, i) => (
          <Link key={path} to={path} style={{
            color: '#c8c0b0', fontSize: '13px', letterSpacing: '0.06em',
            textDecoration: 'none', transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f5f0e8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#c8c0b0')}
          >
            {['Trang chủ', 'Cửa hàng'][i]}
          </Link>
        ))}
        {isLoggedIn && authStore.isAdmin() && (
          <Link to="/admin" style={{
            color: '#c8c0b0', fontSize: '13px', letterSpacing: '0.06em',
            textDecoration: 'none', transition: 'color 0.2s'
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f5f0e8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#c8c0b0')}
          >Admin</Link>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
        {isLoggedIn ? (
          <>
            {/* Wishlist */}
            <Link to="/wishlist" title="Yêu thích" style={{
              color: '#c8c0b0', textDecoration: 'none', transition: 'color 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f5f0e8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#c8c0b0')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </Link>

            {/* Cart */}
            <Link to="/cart" title="Giỏ hàng" style={{
              color: '#c8c0b0', textDecoration: 'none',
              position: 'relative', transition: 'color 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f5f0e8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#c8c0b0')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: '#8B1A1A', color: '#fff',
                  borderRadius: '50%', width: '16px', height: '16px',
                  fontSize: '9px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{cartCount}</span>
              )}
            </Link>

            {/* Avatar + Dropdown */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={handleMenuEnter}
              onMouseLeave={handleMenuLeave}
            >
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: '#8B6914', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, color: '#fff',
                letterSpacing: '0.05em'
              }}>
                {user?.fullname?.charAt(0).toUpperCase()}
              </div>

              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0,
                  background: '#fff', borderRadius: '8px', minWidth: '160px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  border: '0.5px solid rgba(0,0,0,0.08)',
                  overflow: 'hidden', marginTop: '8px'
                }}>
                  {/* User info */}
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '0.5px solid #eee',
                    background: '#faf9f7'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
                      {user?.fullname}
                    </div>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                      @{user?.username}
                    </div>
                  </div>

                  {[
                    { label: 'Tài khoản', path: '/profile' },
                    { label: 'Đơn hàng', path: '/orders' },
                    { label: 'Yêu thích', path: '/wishlist' },
                  ].map(item => (
                    <Link key={item.path} to={item.path} style={{
                      display: 'block', padding: '10px 16px',
                      fontSize: '13px', color: '#1a1a1a', textDecoration: 'none',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f5f0e8')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >{item.label}</Link>
                  ))}

                  <div style={{ borderTop: '0.5px solid #eee' }}>
                    <button onClick={handleLogout} style={{
                      width: '100%', padding: '10px 16px', textAlign: 'left',
                      fontSize: '13px', color: '#8B1A1A', background: 'none',
                      border: 'none', cursor: 'pointer', transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fef0f0')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >Đăng xuất</button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              color: '#c8c0b0', fontSize: '13px', letterSpacing: '0.04em',
              textDecoration: 'none', transition: 'color 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f5f0e8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#c8c0b0')}
            >Đăng nhập</Link>
            <Link to="/register" style={{
              background: '#f5f0e8', color: '#1a1a1a', fontSize: '13px',
              padding: '8px 18px', borderRadius: '6px', textDecoration: 'none',
              letterSpacing: '0.04em', fontWeight: 500, transition: 'opacity 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >Đăng ký</Link>
          </>
        )}
      </div>
    </nav>
  )
}
