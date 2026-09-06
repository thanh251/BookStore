import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { cartAPI, getImageUrl } from '../services/api'
import type { Cart as CartType, CartItem } from '../types'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

// Component ảnh sản phẩm — hiện ảnh thật nếu có, fallback về placeholder màu
function BookImage({ imageName, productId, size = 'md' }: {
  imageName?: string | null
  productId: number
  size?: 'sm' | 'md'
}) {
  const [imgError, setImgError] = useState(false)
  const url = getImageUrl(imageName ?? null)
  const w = size === 'sm' ? '36px' : '52px'
  const h = size === 'sm' ? '48px' : '68px'

  return (
    <div style={{
      width: w, height: h, flexShrink: 0,
      borderRadius: '3px 8px 8px 3px', overflow: 'hidden',
      boxShadow: '2px 0 6px rgba(0,0,0,0.15)'
    }}>
      {url && !imgError ? (
        <img
          src={url}
          alt=""
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: `hsl(${(productId * 47) % 360}, 35%, 45%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: size === 'sm' ? '10px' : '12px' }}>📖</span>
        </div>
      )}
    </div>
  )
}

export default function Cart() {
  const [cart, setCart] = useState<CartType | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const navigate = useNavigate()

  const fetchCart = async () => {
    try {
      const res = await cartAPI.get()
      setCart(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCart() }, [])

  const handleUpdate = async (itemId: number, quantity: number) => {
    setUpdating(itemId)
    try {
      await cartAPI.updateItem(itemId, quantity)
      await fetchCart()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setUpdating(null)
    }
  }

  const handleRemove = async (itemId: number) => {
    setUpdating(itemId)
    try {
      await cartAPI.removeItem(itemId)
      await fetchCart()
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '6rem 2rem 4rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.15em',
            color: '#8B6914', textTransform: 'uppercase', marginBottom: '6px'
          }}>Mua sắm</div>
          <h1 style={{
            fontSize: '2rem', fontFamily: "'Playfair Display', serif",
            color: '#1a1a1a', fontWeight: 400
          }}>Giỏ hàng của bạn</h1>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#999' }}>Đang tải...</div>

        ) : !cart || cart.items.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '6rem 2rem',
            background: '#fff', borderRadius: '16px',
            border: '0.5px solid #e8e0d4'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
            <h2 style={{
              fontSize: '1.3rem', fontFamily: "'Playfair Display', serif",
              color: '#1a1a1a', fontWeight: 400, marginBottom: '0.5rem'
            }}>Giỏ hàng trống</h2>
            <p style={{ color: '#999', fontSize: '14px', marginBottom: '2rem' }}>
              Hãy khám phá và thêm sách bạn yêu thích vào giỏ hàng
            </p>
            <Link to="/shop" style={{
              background: '#1a1a1a', color: '#f5f0e8',
              padding: '12px 28px', borderRadius: '8px',
              textDecoration: 'none', fontSize: '14px', fontWeight: 500
            }}>Khám phá cửa hàng</Link>
          </div>

        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>

            {/* Items list */}
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '0.5px solid #e8e0d4', overflow: 'hidden'
            }}>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 120px 40px',
                padding: '14px 20px', borderBottom: '0.5px solid #e8e0d4',
                fontSize: '11px', letterSpacing: '0.1em', color: '#999',
                textTransform: 'uppercase'
              }}>
                <span>Sản phẩm</span>
                <span style={{ textAlign: 'center' }}>Số lượng</span>
                <span style={{ textAlign: 'right' }}>Thành tiền</span>
                <span />
              </div>

              {cart.items.map((item: CartItem, idx: number) => (
                <div key={item.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 120px 120px 40px',
                  padding: '16px 20px', alignItems: 'center',
                  borderBottom: idx < cart.items.length - 1 ? '0.5px solid #f0ebe0' : 'none',
                  opacity: updating === item.id ? 0.5 : 1,
                  transition: 'opacity 0.2s'
                }}>

                  {/* Product info + ảnh */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <BookImage imageName={item.imageName} productId={item.productId} size="md" />
                    <div>
                      <Link to={`/product/${item.productId}`} style={{
                        fontSize: '14px', fontWeight: 500, color: '#1a1a1a',
                        textDecoration: 'none', display: 'block', marginBottom: '4px',
                        lineHeight: 1.3
                      }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#8B6914')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#1a1a1a')}
                      >{item.name}</Link>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {formatPrice(item.price)}
                        {item.discount > 0 && (
                          <span style={{
                            marginLeft: '6px', background: '#fef0f0',
                            color: '#8B1A1A', fontSize: '10px',
                            padding: '1px 6px', borderRadius: '3px'
                          }}>-{item.discount}%</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <button
                      onClick={() => item.quantity > 1 && handleUpdate(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updating === item.id}
                      style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        border: '0.5px solid #e8e0d4', background: '#fff',
                        cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '16px', color: '#666',
                        opacity: item.quantity <= 1 ? 0.4 : 1
                      }}
                    >−</button>
                    <span style={{
                      width: '32px', textAlign: 'center',
                      fontSize: '14px', fontWeight: 500, color: '#1a1a1a'
                    }}>{item.quantity}</span>
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      disabled={updating === item.id}
                      style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        border: '0.5px solid #e8e0d4', background: '#fff',
                        cursor: 'pointer', fontSize: '16px', color: '#666'
                      }}
                    >+</button>
                  </div>

                  {/* Subtotal */}
                  <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                    {formatPrice(item.subtotal * item.quantity)}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={updating === item.id}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#ccc', fontSize: '18px', padding: '4px',
                      transition: 'color 0.2s', display: 'flex',
                      alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#8B1A1A')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#ccc')}
                  >×</button>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '0.5px solid #e8e0d4', padding: '1.8rem',
              position: 'sticky', top: '80px'
            }}>
              <h2 style={{
                fontSize: '1rem', fontFamily: "'Playfair Display', serif",
                color: '#1a1a1a', fontWeight: 400, marginBottom: '1.5rem',
                paddingBottom: '1rem', borderBottom: '0.5px solid #e8e0d4'
              }}>Tóm tắt đơn hàng</h2>

              <div style={{ marginBottom: '1rem' }}>
                {cart.items.map((item: CartItem) => (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '13px', color: '#666', marginBottom: '8px',
                    alignItems: 'center', gap: '8px'
                  }}>
                    {/* Mini ảnh trong summary */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <BookImage imageName={item.imageName} productId={item.productId} size="sm" />
                      <span style={{
                        flex: 1, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {item.name} × {item.quantity}
                      </span>
                    </div>
                    <span style={{ flexShrink: 0 }}>{formatPrice(item.subtotal * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '0.5px solid #e8e0d4', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '16px', fontWeight: 600, color: '#1a1a1a'
                }}>
                  <span>Tạm tính</span>
                  <span>{formatPrice(cart.totalPrice)}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
                  Phí vận chuyển tính ở bước tiếp theo
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                style={{
                  width: '100%', padding: '14px',
                  background: '#1a1a1a', color: '#f5f0e8',
                  border: 'none', borderRadius: '8px', fontSize: '14px',
                  fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >Tiến hành thanh toán →</button>

              <Link to="/shop" style={{
                display: 'block', textAlign: 'center',
                color: '#666', fontSize: '13px', textDecoration: 'none', padding: '10px'
              }}>← Tiếp tục mua sắm</Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
