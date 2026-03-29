import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { cartAPI, orderAPI, getImageUrl } from '../services/api'
import type { Cart as CartType, CartItem } from '../types'
import { authStore } from '../store/authStore'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const DELIVERY = {
  1: { name: 'Tiêu chuẩn', desc: '3-5 ngày làm việc', price: 15000 },
  2: { name: 'Nhanh', desc: '1-2 ngày làm việc', price: 50000 }
}

// Component ảnh sản phẩm — hiện ảnh thật nếu có, fallback về placeholder màu
function BookImage({ imageName, productId }: { imageName?: string | null; productId: number }) {
  const [imgError, setImgError] = useState(false)
  const url = getImageUrl(imageName ?? null)

  return (
    <div style={{
      width: '36px', height: '48px', flexShrink: 0,
      borderRadius: '3px 6px 6px 3px', overflow: 'hidden',
      boxShadow: '1px 0 4px rgba(0,0,0,0.12)'
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
          background: `hsl(${(productId * 47) % 360}, 35%, 45%)`
        }} />
      )}
    </div>
  )
}

export default function Checkout() {
  const [cart, setCart] = useState<CartType | null>(null)
  const [delivery, setDelivery] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vietqr'>('cod')
  const navigate = useNavigate()
  const user = authStore.getUser()

  useEffect(() => {
    cartAPI.get().then(res => setCart(res.data.data)).finally(() => setLoading(false))
  }, [])

  const handleOrder = async () => {
    setError('')
    setPlacing(true)
    try {
      const res = await orderAPI.create(delivery)
      const newOrderId = res.data.data.orderId

      if (paymentMethod === 'vietqr') {
        setOrderId(newOrderId)
      } else {
        navigate(`/orders?success=${newOrderId}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setPlacing(false)
    }
  }

  const deliveryPrice = DELIVERY[delivery].price
  const subtotal = cart?.totalPrice || 0
  const total = subtotal + deliveryPrice

  // VietQR config
  const BANK_ID = 'MB'
  const ACCOUNT_NO = '0787137906'
  const ACCOUNT_NAME = 'BOOKSTORE'
  const vietQRUrl = orderId
    ? `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${total}&addInfo=DH${orderId}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`
    : ''

  // Màn hình QR sau khi đặt hàng thành công
  if (orderId && paymentMethod === 'vietqr') {
    return (
      <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
        <Navbar />
        <div style={{
          maxWidth: '480px', margin: '0 auto',
          padding: '6rem 2rem 4rem', textAlign: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px',
            border: '0.5px solid #e8e0d4', padding: '2.5rem'
          }}>
            <div style={{
              fontSize: '11px', letterSpacing: '0.15em',
              color: '#8B6914', textTransform: 'uppercase', marginBottom: '0.5rem'
            }}>Thanh toán VietQR</div>
            <h1 style={{
              fontSize: '1.5rem', fontFamily: "'Playfair Display', serif",
              color: '#1a1a1a', fontWeight: 400, marginBottom: '0.5rem'
            }}>Quét mã để thanh toán</h1>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '1.5rem' }}>
              Đơn hàng <strong>#{orderId}</strong> · {formatPrice(total)}
            </p>

            {/* QR Code */}
            <div style={{
              background: '#f5f0e8', borderRadius: '16px',
              padding: '1.2rem', marginBottom: '1.5rem',
              display: 'inline-block'
            }}>
              <img
                src={vietQRUrl}
                alt="VietQR"
                style={{ width: '220px', height: '220px', display: 'block' }}
              />
            </div>

            {/* Bank info */}
            <div style={{
              background: '#faf9f7', borderRadius: '12px',
              border: '0.5px solid #e8e0d4', padding: '1rem',
              marginBottom: '1.5rem', textAlign: 'left'
            }}>
              {[
                { label: 'Ngân hàng', value: 'MB Bank' },
                { label: 'Số tài khoản', value: ACCOUNT_NO },
                { label: 'Chủ tài khoản', value: ACCOUNT_NAME },
                { label: 'Số tiền', value: formatPrice(total) },
                { label: 'Nội dung', value: `DH${orderId}` },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '13px', marginBottom: '6px'
                }}>
                  <span style={{ color: '#999' }}>{row.label}</span>
                  <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '12px', color: '#999', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              ⚠️ Nhập đúng nội dung chuyển khoản <strong>DH{orderId}</strong> để đơn hàng được xác nhận tự động
            </p>

            <button
              onClick={() => navigate(`/orders?success=${orderId}`)}
              style={{
                width: '100%', padding: '13px',
                background: '#1a1a1a', color: '#f5f0e8',
                border: 'none', borderRadius: '8px', fontSize: '14px',
                fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em'
              }}
            >✓ Tôi đã thanh toán</button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#999' }}>Đang tải...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      <Navbar />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '6rem 2rem 4rem' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.15em',
            color: '#8B6914', textTransform: 'uppercase', marginBottom: '6px'
          }}>Bước cuối</div>
          <h1 style={{
            fontSize: '2rem', fontFamily: "'Playfair Display', serif",
            color: '#1a1a1a', fontWeight: 400
          }}>Xác nhận đơn hàng</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

            {/* Thông tin giao hàng */}
            <div style={{
              background: '#fff', borderRadius: '14px',
              border: '0.5px solid #e8e0d4', padding: '1.8rem'
            }}>
              <h2 style={{
                fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#8B6914', marginBottom: '1.2rem'
              }}>Thông tin giao hàng</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Họ tên', value: user?.fullname },
                  { label: 'Email', value: user?.email },
                  { label: 'Điện thoại', value: user?.phoneNumber },
                  { label: 'Địa chỉ', value: user?.address },
                ].map(f => (
                  <div key={f.label} style={{ gridColumn: f.label === 'Địa chỉ' ? 'span 2' : 'span 1' }}>
                    <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>{f.label}</div>
                    <div style={{
                      padding: '10px 14px', background: '#faf9f7',
                      borderRadius: '8px', fontSize: '13px', color: '#1a1a1a',
                      border: '0.5px solid #e8e0d4'
                    }}>{f.value || '---'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phương thức vận chuyển */}
            <div style={{
              background: '#fff', borderRadius: '14px',
              border: '0.5px solid #e8e0d4', padding: '1.8rem'
            }}>
              <h2 style={{
                fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#8B6914', marginBottom: '1.2rem'
              }}>Phương thức vận chuyển</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {([1, 2] as const).map(method => (
                  <div key={method}
                    onClick={() => setDelivery(method)}
                    style={{
                      padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                      border: `1.5px solid ${delivery === method ? '#1a1a1a' : '#e8e0d4'}`,
                      background: delivery === method ? '#faf9f7' : '#fff',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%',
                        border: `2px solid ${delivery === method ? '#1a1a1a' : '#ccc'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {delivery === method && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1a1a1a' }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
                          {DELIVERY[method].name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>{DELIVERY[method].desc}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                      {formatPrice(DELIVERY[method].price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div style={{
              background: '#fff', borderRadius: '14px',
              border: '0.5px solid #e8e0d4', padding: '1.8rem'
            }}>
              <h2 style={{
                fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#8B6914', marginBottom: '1.2rem'
              }}>Phương thức thanh toán</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { key: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: '💵' },
                  { key: 'vietqr', label: 'Chuyển khoản VietQR', icon: '📱' },
                ].map(opt => (
                  <div key={opt.key}
                    onClick={() => setPaymentMethod(opt.key as 'cod' | 'vietqr')}
                    style={{
                      padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                      border: `1.5px solid ${paymentMethod === opt.key ? '#1a1a1a' : '#e8e0d4'}`,
                      background: paymentMethod === opt.key ? '#faf9f7' : '#fff',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      border: `2px solid ${paymentMethod === opt.key ? '#1a1a1a' : '#ccc'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {paymentMethod === opt.key && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1a1a1a' }} />
                      )}
                    </div>
                    <span style={{ fontSize: '16px' }}>{opt.icon}</span>
                    <span style={{ fontSize: '14px', color: '#1a1a1a' }}>{opt.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Order summary */}
          <div style={{
            background: '#fff', borderRadius: '14px',
            border: '0.5px solid #e8e0d4', padding: '1.8rem',
            position: 'sticky', top: '80px'
          }}>
            <h2 style={{
              fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#8B6914', marginBottom: '1.2rem', paddingBottom: '1rem',
              borderBottom: '0.5px solid #e8e0d4'
            }}>Đơn hàng ({cart?.totalItems} sản phẩm)</h2>

            {/* Danh sách sản phẩm với ảnh */}
            <div style={{ marginBottom: '1rem', maxHeight: '280px', overflowY: 'auto' }}>
              {cart?.items.map((item: CartItem) => (
                <div key={item.id} style={{
                  display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center'
                }}>
                  <BookImage imageName={item.imageName} productId={item.productId} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '12px', fontWeight: 500, color: '#1a1a1a',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>×{item.quantity}</div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', flexShrink: 0 }}>
                    {formatPrice(item.subtotal * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div style={{ borderTop: '0.5px solid #e8e0d4', paddingTop: '1rem' }}>
              {[
                { label: 'Tạm tính', value: formatPrice(subtotal) },
                { label: `Vận chuyển (${DELIVERY[delivery].name})`, value: formatPrice(deliveryPrice) },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '13px', color: '#666', marginBottom: '8px'
                }}>
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '16px', fontWeight: 700, color: '#1a1a1a',
                paddingTop: '10px', borderTop: '0.5px solid #e8e0d4', marginTop: '4px'
              }}>
                <span>Tổng cộng</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {error && (
              <div style={{
                marginTop: '1rem', padding: '10px 14px',
                background: '#fef0f0', border: '0.5px solid #fca5a5',
                borderRadius: '8px', fontSize: '13px', color: '#8B1A1A'
              }}>{error}</div>
            )}

            <button onClick={handleOrder} disabled={placing} style={{
              width: '100%', padding: '14px', marginTop: '1.2rem',
              background: placing ? '#555' : '#1a1a1a', color: '#f5f0e8',
              border: 'none', borderRadius: '8px', fontSize: '14px',
              fontWeight: 600, letterSpacing: '0.06em',
              cursor: placing ? 'not-allowed' : 'pointer'
            }}>
              {placing ? 'Đang đặt hàng...' : paymentMethod === 'vietqr' ? '📱 Đặt hàng & Thanh toán QR' : '✓ Đặt hàng ngay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
