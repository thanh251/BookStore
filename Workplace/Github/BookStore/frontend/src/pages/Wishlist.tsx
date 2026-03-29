import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { wishlistAPI, cartAPI, getImageUrl } from '../services/api'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

// Component ảnh sản phẩm — hiện ảnh thật nếu có, fallback về placeholder màu
function BookImage({ imageName, productId }: { imageName?: string | null; productId: number }) {
  const [imgError, setImgError] = useState(false)
  const url = getImageUrl(imageName ?? null)

  if (url && !imgError) {
    return (
      <img
        src={url}
        alt=""
        onError={() => setImgError(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    )
  }

  // Fallback: placeholder màu + icon sách
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f5f0e8', position: 'relative'
    }}>
      <div style={{
        width: '42%', height: '76%',
        background: `hsl(${(productId * 47) % 360}, 35%, 45%)`,
        borderRadius: '3px 8px 8px 3px',
        boxShadow: '3px 0 8px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontSize: '20px' }}>📖</span>
      </div>
    </div>
  )
}

export default function Wishlist() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<number | null>(null)
  const [removing, setRemoving] = useState<number | null>(null)
  const [addedMap, setAddedMap] = useState<Record<number, boolean>>({})

  const fetchWishlist = async () => {
    try {
      const res = await wishlistAPI.get()
      setItems(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWishlist() }, [])

  const handleRemove = async (productId: number) => {
    setRemoving(productId)
    try {
      await wishlistAPI.remove(productId)
      setItems(prev => prev.filter(i => i.productId !== productId))
    } catch (err) {
      console.error(err)
    } finally {
      setRemoving(null)
    }
  }

  const handleAddToCart = async (productId: number) => {
    setAdding(productId)
    try {
      await cartAPI.addItem(productId, 1)
      // Hiện tick xanh tạm thời
      setAddedMap(prev => ({ ...prev, [productId]: true }))
      setTimeout(() => setAddedMap(prev => ({ ...prev, [productId]: false })), 2000)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setAdding(null)
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
          }}>Tài khoản</div>
          <h1 style={{
            fontSize: '2rem', fontFamily: "'Playfair Display', serif",
            color: '#1a1a1a', fontWeight: 400
          }}>Danh sách yêu thích
            {items.length > 0 && (
              <span style={{
                fontSize: '14px', color: '#999', fontFamily: 'sans-serif',
                fontWeight: 400, marginLeft: '12px'
              }}>{items.length} sản phẩm</span>
            )}
          </h1>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#999' }}>Đang tải...</div>

        ) : items.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '6rem',
            background: '#fff', borderRadius: '16px', border: '0.5px solid #e8e0d4'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🤍</div>
            <h2 style={{
              fontSize: '1.2rem', fontFamily: "'Playfair Display', serif",
              color: '#1a1a1a', fontWeight: 400, marginBottom: '0.5rem'
            }}>Chưa có sách yêu thích</h2>
            <p style={{ color: '#999', fontSize: '14px', marginBottom: '2rem' }}>
              Nhấn vào biểu tượng trái tim trên các sản phẩm để lưu lại
            </p>
            <Link to="/shop" style={{
              background: '#1a1a1a', color: '#f5f0e8',
              padding: '12px 28px', borderRadius: '8px',
              textDecoration: 'none', fontSize: '14px'
            }}>Khám phá cửa hàng</Link>
          </div>

        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.2rem'
          }}>
            {items.map(item => {
              const discountedPrice = item.discount > 0
                ? item.price * (1 - item.discount / 100)
                : item.price
              const isAdding = adding === item.productId
              const isRemoving = removing === item.productId
              const justAdded = addedMap[item.productId]

              return (
                <div key={item.id} style={{
                  background: '#fff', borderRadius: '12px',
                  border: '0.5px solid #e8e0d4', overflow: 'hidden',
                  transition: 'all 0.25s',
                  opacity: isRemoving ? 0.4 : 1
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                  }}
                >
                  {/* Image */}
                  <Link to={`/product/${item.productId}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{
                      aspectRatio: '3/2', position: 'relative', overflow: 'hidden'
                    }}>
                      <BookImage imageName={item.imageName} productId={item.productId} />

                      {/* Discount badge */}
                      {item.discount > 0 && (
                        <div style={{
                          position: 'absolute', top: '10px', left: '10px',
                          background: '#8B1A1A', color: '#fff',
                          fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
                          fontWeight: 500, zIndex: 1
                        }}>-{item.discount}%</div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div style={{ padding: '14px' }}>
                    <div style={{
                      fontSize: '10px', color: '#999',
                      letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px'
                    }}>{item.author}</div>

                    <Link to={`/product/${item.productId}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        fontSize: '14px', fontWeight: 500, color: '#1a1a1a',
                        marginBottom: '10px', lineHeight: 1.4,
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                      }}>{item.name}</div>
                    </Link>

                    {/* Price */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', marginBottom: '10px'
                    }}>
                      <div>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }}>
                          {formatPrice(discountedPrice)}
                        </span>
                        {item.discount > 0 && (
                          <span style={{
                            fontSize: '11px', color: '#bbb',
                            textDecoration: 'line-through', marginLeft: '6px'
                          }}>{formatPrice(item.price)}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleAddToCart(item.productId)}
                        disabled={isAdding || isRemoving}
                        style={{
                          flex: 1, padding: '9px',
                          background: justAdded ? '#166534' : '#1a1a1a',
                          color: '#f5f0e8',
                          border: 'none', borderRadius: '7px', fontSize: '12px',
                          fontWeight: 500, cursor: isAdding ? 'not-allowed' : 'pointer',
                          opacity: isAdding ? 0.7 : 1,
                          transition: 'background 0.3s'
                        }}
                      >
                        {isAdding ? '...' : justAdded ? '✓ Đã thêm' : '+ Thêm vào giỏ'}
                      </button>

                      <button
                        onClick={() => handleRemove(item.productId)}
                        disabled={isRemoving}
                        title="Xóa khỏi yêu thích"
                        style={{
                          width: '36px', height: '36px', borderRadius: '7px',
                          border: '0.5px solid #e8e0d4', background: '#fff',
                          cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          color: '#ccc', fontSize: '16px', transition: 'all 0.2s',
                          flexShrink: 0
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#8B1A1A'
                          ;(e.currentTarget as HTMLButtonElement).style.color = '#8B1A1A'
                          ;(e.currentTarget as HTMLButtonElement).style.background = '#fef0f0'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = '#e8e0d4'
                          ;(e.currentTarget as HTMLButtonElement).style.color = '#ccc'
                          ;(e.currentTarget as HTMLButtonElement).style.background = '#fff'
                        }}
                      >
                        {isRemoving ? '...' : '×'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
