import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function Register() {
  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '',
    fullname: '', email: '', phoneNumber: '',
    address: '', gender: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    setLoading(true)
    try {
      await authAPI.register(form)
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.07)',
    border: '0.5px solid rgba(255,255,255,0.15)',
    borderRadius: '8px', color: '#f5f0e8', fontSize: '14px',
    outline: 'none', fontFamily: "'Be Vietnam Pro', sans-serif"
  }

  const labelStyle = {
    display: 'block' as const, fontSize: '11px', letterSpacing: '0.1em',
    color: '#8B6914', textTransform: 'uppercase' as const, marginBottom: '8px'
  }

  const fields = [
    { key: 'fullname', label: 'Họ và tên', type: 'text', placeholder: 'Nguyễn Văn A' },
    { key: 'username', label: 'Tên đăng nhập', type: 'text', placeholder: 'username' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com' },
    { key: 'phoneNumber', label: 'Số điện thoại', type: 'tel', placeholder: '0xxxxxxxxx' },
    { key: 'address', label: 'Địa chỉ', type: 'text', placeholder: 'Số nhà, đường, quận, thành phố' },
    { key: 'password', label: 'Mật khẩu', type: 'password', placeholder: 'Ít nhất 6 ký tự' },
    { key: 'confirmPassword', label: 'Xác nhận mật khẩu', type: 'password', placeholder: 'Nhập lại mật khẩu' },
  ]

  return (
    <div style={{
      minHeight: '100vh', background: '#1a1a1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.04,
        backgroundImage: `repeating-linear-gradient(45deg, #f5f0e8 0px, #f5f0e8 1px, transparent 0px, transparent 50%)`,
        backgroundSize: '20px 20px', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{
            color: '#f5f0e8', fontSize: '22px', fontWeight: 600,
            letterSpacing: '0.15em', textDecoration: 'none',
            fontFamily: "'Playfair Display', serif"
          }}>BOOKSTORE</Link>
          <p style={{ color: '#c8c0b0', fontSize: '13px', marginTop: '8px' }}>
            Tạo tài khoản mới
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '0.5px solid rgba(255,255,255,0.12)',
          borderRadius: '16px', padding: '2.5rem',
          backdropFilter: 'blur(12px)'
        }}>
          <h1 style={{
            fontSize: '1.6rem', fontFamily: "'Playfair Display', serif",
            color: '#f5f0e8', fontWeight: 400, marginBottom: '1.8rem'
          }}>Đăng ký</h1>

          {error && (
            <div style={{
              background: 'rgba(139,26,26,0.15)', border: '0.5px solid rgba(139,26,26,0.4)',
              borderRadius: '8px', padding: '10px 14px',
              color: '#fca5a5', fontSize: '13px', marginBottom: '1.2rem'
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'
            }}>
              {fields.map(f => (
                <div key={f.key} style={{
                  gridColumn: ['address', 'confirmPassword'].includes(f.key) ? 'span 2' : 'span 1',
                  marginBottom: '0.2rem'
                }}>
                  <label style={labelStyle}>{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#8B6914'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                  />
                </div>
              ))}

              {/* Gender */}
              <div style={{ gridColumn: 'span 2', marginBottom: '0.2rem' }}>
                <label style={labelStyle}>Giới tính</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {[{ label: 'Nam', value: true }, { label: 'Nữ', value: false }].map(g => (
                    <button key={String(g.value)} type="button"
                      onClick={() => set('gender', g.value)}
                      style={{
                        flex: 1, padding: '11px',
                        background: form.gender === g.value ? '#8B6914' : 'rgba(255,255,255,0.07)',
                        border: `0.5px solid ${form.gender === g.value ? '#8B6914' : 'rgba(255,255,255,0.15)'}`,
                        borderRadius: '8px', color: '#f5f0e8', fontSize: '13px',
                        cursor: 'pointer', transition: 'all 0.2s',
                        fontFamily: "'Be Vietnam Pro', sans-serif"
                      }}
                    >{g.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', marginTop: '1.2rem',
              background: loading ? '#555' : '#f5f0e8',
              color: '#1a1a1a', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: 600, letterSpacing: '0.06em',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Be Vietnam Pro', sans-serif"
            }}>
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: '1.5rem',
            fontSize: '13px', color: '#c8c0b0'
          }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ color: '#8B6914', textDecoration: 'none', fontWeight: 500 }}>
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}