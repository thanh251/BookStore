import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { authStore } from '../store/authStore'
import api from '../services/api'

export default function Profile() {
  const user = authStore.getUser()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'info' | 'password'>('info')
  const [form, setForm] = useState({
    fullname: user?.fullname || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
  })
  const [passwords, setPasswords] = useState({
    current: '', newPass: '', confirm: ''
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/auth/profile', form)
      authStore.setAuth(authStore.getToken()!, { ...user!, ...form })
      showMsg('success', 'Cập nhật thông tin thành công!')
    } catch (err: any) {
      showMsg('error', err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPass !== passwords.confirm) {
      showMsg('error', 'Mật khẩu xác nhận không khớp')
      return
    }
    setSaving(true)
    try {
      await api.put('/auth/password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass
      })
      showMsg('success', 'Đổi mật khẩu thành công!')
      setPasswords({ current: '', newPass: '', confirm: '' })
    } catch (err: any) {
      showMsg('error', err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    authStore.logout()
    navigate('/')
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '0.5px solid #e8e0d4', borderRadius: '8px',
    fontSize: '14px', color: '#1a1a1a', outline: 'none',
    background: '#fff', fontFamily: "'Be Vietnam Pro', sans-serif",
    transition: 'border 0.2s'
  }

  const labelStyle = {
    display: 'block' as const, fontSize: '11px',
    letterSpacing: '0.08em', color: '#8B6914',
    textTransform: 'uppercase' as const, marginBottom: '7px'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      <Navbar />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '6rem 2rem 4rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: '#1a1a1a', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '24px', fontWeight: 600,
            color: '#f5f0e8', flexShrink: 0,
            fontFamily: "'Playfair Display', serif"
          }}>
            {user?.fullname?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{
              fontSize: '1.6rem', fontFamily: "'Playfair Display', serif",
              color: '#1a1a1a', fontWeight: 400
            }}>{user?.fullname}</h1>
            <div style={{ fontSize: '13px', color: '#999', marginTop: '3px' }}>
              @{user?.username}
              {user?.role !== 'CUSTOMER' && (
                <span style={{
                  marginLeft: '8px', background: '#1a1a1a', color: '#f5f0e8',
                  fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
                  letterSpacing: '0.08em'
                }}>{user?.role}</span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '2px', marginBottom: '1.5rem',
          background: '#fff', padding: '4px', borderRadius: '10px',
          border: '0.5px solid #e8e0d4', width: 'fit-content'
        }}>
          {[
            { key: 'info', label: 'Thông tin cá nhân' },
            { key: 'password', label: 'Đổi mật khẩu' }
          ].map(t => (
            <button key={t.key}
              onClick={() => setTab(t.key as any)}
              style={{
                padding: '8px 20px', borderRadius: '7px', border: 'none',
                fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                background: tab === t.key ? '#1a1a1a' : 'transparent',
                color: tab === t.key ? '#f5f0e8' : '#666',
                fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 500
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Message */}
        {msg && (
          <div style={{
            padding: '12px 16px', borderRadius: '10px', marginBottom: '1.2rem',
            fontSize: '13px', fontWeight: 500,
            background: msg.type === 'success' ? '#f0fef4' : '#fef0f0',
            color: msg.type === 'success' ? '#166534' : '#8B1A1A',
            border: `0.5px solid ${msg.type === 'success' ? '#86efac' : '#fca5a5'}`
          }}>{msg.text}</div>
        )}

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '0.5px solid #e8e0d4', padding: '2rem'
        }}>
          {tab === 'info' ? (
            <form onSubmit={handleSaveInfo}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                {[
                  { key: 'fullname', label: 'Họ và tên', type: 'text', col: 2 },
                  { key: 'email', label: 'Email', type: 'email', col: 1 },
                  { key: 'phoneNumber', label: 'Số điện thoại', type: 'tel', col: 1 },
                  { key: 'address', label: 'Địa chỉ', type: 'text', col: 2 },
                ].map(f => (
                  <div key={f.key} style={{ gridColumn: `span ${f.col}` }}>
                    <label style={labelStyle}>{f.label}</label>
                    <input
                      type={f.type}
                      value={(form as any)[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#8B6914'}
                      onBlur={e => e.target.style.borderColor = '#e8e0d4'}
                    />
                  </div>
                ))}

                {/* Username (readonly) */}
                <div>
                  <label style={labelStyle}>Tên đăng nhập</label>
                  <input value={user?.username || ''} readOnly style={{
                    ...inputStyle, background: '#faf9f7', color: '#999', cursor: 'not-allowed'
                  }} />
                </div>

                {/* Role (readonly) */}
                <div>
                  <label style={labelStyle}>Vai trò</label>
                  <input value={user?.role || ''} readOnly style={{
                    ...inputStyle, background: '#faf9f7', color: '#999', cursor: 'not-allowed'
                  }} />
                </div>
              </div>

              <div style={{
                display: 'flex', justifyContent: 'flex-end',
                gap: '10px', marginTop: '1.8rem'
              }}>
                <button type="submit" disabled={saving} style={{
                  padding: '10px 28px', background: saving ? '#555' : '#1a1a1a',
                  color: '#f5f0e8', border: 'none', borderRadius: '8px',
                  fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: "'Be Vietnam Pro', sans-serif"
                }}>
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {[
                  { key: 'current', label: 'Mật khẩu hiện tại', placeholder: 'Nhập mật khẩu hiện tại' },
                  { key: 'newPass', label: 'Mật khẩu mới', placeholder: 'Ít nhất 6 ký tự' },
                  { key: 'confirm', label: 'Xác nhận mật khẩu mới', placeholder: 'Nhập lại mật khẩu mới' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input
                      type="password"
                      value={(passwords as any)[f.key]}
                      onChange={e => setPasswords(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      required
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#8B6914'}
                      onBlur={e => e.target.style.borderColor = '#e8e0d4'}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.8rem' }}>
                <button type="submit" disabled={saving} style={{
                  padding: '10px 28px', background: saving ? '#555' : '#1a1a1a',
                  color: '#f5f0e8', border: 'none', borderRadius: '8px',
                  fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: "'Be Vietnam Pro', sans-serif"
                }}>
                  {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Logout */}
        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button onClick={handleLogout} style={{
            background: 'none', border: '0.5px solid #e8e0d4',
            padding: '9px 20px', borderRadius: '8px', fontSize: '13px',
            color: '#8B1A1A', cursor: 'pointer',
            fontFamily: "'Be Vietnam Pro', sans-serif"
          }}>Đăng xuất</button>
        </div>
      </div>
      <Footer />
    </div>
  )
}