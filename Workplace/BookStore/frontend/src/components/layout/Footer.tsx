import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      background: '#1a1a1a', color: '#c8c0b0',
      padding: '3rem 2rem 1.5rem'
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
        gap: '3rem', paddingBottom: '2rem',
        borderBottom: '0.5px solid rgba(255,255,255,0.1)'
      }}>
        <div>
          <div style={{
            color: '#f5f0e8', fontSize: '18px', fontWeight: 600,
            letterSpacing: '0.12em', fontFamily: "'Playfair Display', serif",
            marginBottom: '1rem'
          }}>BOOKSTORE</div>
          <p style={{ fontSize: '13px', lineHeight: 1.8, maxWidth: '280px' }}>
            Nơi mỗi cuốn sách là một cánh cửa dẫn đến thế giới mới.
            Khám phá hàng nghìn đầu sách chất lượng cao.
          </p>
        </div>
        <div>
          <div style={{ color: '#f5f0e8', fontSize: '12px', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            DANH MỤC
          </div>
          {[
            { label: 'Trang chủ', path: '/' },
            { label: 'Cửa hàng', path: '/shop' },
            { label: 'Sách mới', path: '/shop?sort=newest' },
            { label: 'Khuyến mãi', path: '/shop?sort=promotions' },
          ].map(item => (
            <Link key={item.path} to={item.path} style={{
              display: 'block', color: '#c8c0b0', fontSize: '13px',
              textDecoration: 'none', marginBottom: '8px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f5f0e8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#c8c0b0')}
            >{item.label}</Link>
          ))}
        </div>
        <div>
          <div style={{ color: '#f5f0e8', fontSize: '12px', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            TÀI KHOẢN
          </div>
          {[
            { label: 'Đăng nhập', path: '/login' },
            { label: 'Đăng ký', path: '/register' },
            { label: 'Đơn hàng', path: '/orders' },
            { label: 'Yêu thích', path: '/wishlist' },
          ].map(item => (
            <Link key={item.path} to={item.path} style={{
              display: 'block', color: '#c8c0b0', fontSize: '13px',
              textDecoration: 'none', marginBottom: '8px'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f5f0e8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#c8c0b0')}
            >{item.label}</Link>
          ))}
        </div>
      </div>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        paddingTop: '1.5rem', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center'
      }}>
        <p style={{ fontSize: '12px' }}>© 2024 Bookstore. All rights reserved.</p>
        <p style={{ fontSize: '12px' }}>Made with ♥ in Vietnam</p>
      </div>
    </footer>
  )
}