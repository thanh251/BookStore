import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { authStore } from '../store/authStore'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.login(username, password)
      authStore.setAuth(res.data.data.token, res.data.data.user)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#1a1a1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem'
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.04,
        backgroundImage: `repeating-linear-gradient(45deg, #f5f0e8 0px, #f5f0e8 1px, transparent 0px, transparent 50%)`,
        backgroundSize: '20px 20px', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{
            color: '#f5f0e8', fontSize: '22px', fontWeight: 600,
            letterSpacing: '0.15em', textDecoration: 'none',
            fontFamily: "'Playfair Display', serif"
          }}>BOOKSTORE</Link>
          <p style={{ color: '#c8c0b0', fontSize: '13px', marginTop: '8px' }}>
            Chào mừng trở lại
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '0.5px solid rgba(255,255,255,0.12)',
          borderRadius: '16px', padding: '2.5rem',
          backdropFilter: 'blur(12px)'
        }}>
          <h1 style={{
            fontSize: '1.6rem', fontFamily: "'Playfair Display', serif",
            color: '#f5f0e8', fontWeight: 400, marginBottom: '1.8rem'
          }}>Đăng nhập</h1>

          {error && (
            <div style={{
              background: 'rgba(139,26,26,0.15)', border: '0.5px solid rgba(139,26,26,0.4)',
              borderRadius: '8px', padding: '10px 14px',
              color: '#fca5a5', fontSize: '13px', marginBottom: '1.2rem'
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{
                display: 'block', fontSize: '11px', letterSpacing: '0.1em',
                color: '#8B6914', textTransform: 'uppercase', marginBottom: '8px'
              }}>Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="Nhập username"
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '0.5px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px', color: '#f5f0e8', fontSize: '14px',
                  outline: 'none', transition: 'border 0.2s',
                  fontFamily: "'Be Vietnam Pro', sans-serif"
                }}
                onFocus={e => e.target.style.borderColor = '#8B6914'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>

            <div style={{ marginBottom: '1.8rem' }}>
              <label style={{
                display: 'block', fontSize: '11px', letterSpacing: '0.1em',
                color: '#8B6914', textTransform: 'uppercase', marginBottom: '8px'
              }}>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Nhập mật khẩu"
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '0.5px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px', color: '#f5f0e8', fontSize: '14px',
                  outline: 'none', transition: 'border 0.2s',
                  fontFamily: "'Be Vietnam Pro', sans-serif"
                }}
                onFocus={e => e.target.style.borderColor = '#8B6914'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? '#555' : '#f5f0e8',
              color: '#1a1a1a', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: 600, letterSpacing: '0.06em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', fontFamily: "'Be Vietnam Pro', sans-serif"
            }}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: '1.5rem',
            fontSize: '13px', color: '#c8c0b0'
          }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ color: '#8B6914', textDecoration: 'none', fontWeight: 500 }}>
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}