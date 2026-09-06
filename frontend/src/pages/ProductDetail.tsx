import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { productAPI, cartAPI, wishlistAPI, reviewAPI, getImageUrl } from '../services/api'
import type { Product, Review } from '../types'
import { authStore } from '../store/authStore'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

// Component ảnh sản phẩm lớn — hiện ảnh thật nếu có, fallback về placeholder màu
function BookCover({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false)
  const url = getImageUrl(product.imageName)

  return (
    <div style={{
      aspectRatio: '3/4', background: '#f5f0e8',
      borderRadius: '12px', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'sticky', top: '80px'
    }}>
      {/* Discount badge */}
      {product.discount > 0 && (
        <div style={{
          position: 'absolute', top: '16px', left: '16px',
          background: '#8B1A1A', color: '#fff',
          fontSize: '12px', padding: '4px 10px',
          borderRadius: '4px', fontWeight: 500, zIndex: 1
        }}>-{product.discount}%</div>
      )}

      {url && !imgError ? (
        // Ảnh thật
        <img
          src={url}
          alt={product.name}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        // Fallback placeholder màu
        <div style={{
          width: '55%', height: '72%',
          background: `hsl(${(product.id * 47) % 360}, 35%, 40%)`,
          borderRadius: '4px 12px 12px 4px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          gap: '10px', padding: '20px',
          boxShadow: '6px 0 20px rgba(0,0,0,0.25)'
        }}>
          <div style={{
            fontSize: '14px', fontWeight: 600,
            color: 'rgba(255,255,255,0.95)', textAlign: 'center',
            lineHeight: 1.4
          }}>{product.name}</div>
          <div style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.4)' }} />
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
            {product.author}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [wished, setWished] = useState(false)
  const [addedMsg, setAddedMsg] = useState('')

  // Review form
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      productAPI.getById(Number(id)),
      reviewAPI.getByProduct(Number(id)),
      authStore.isLoggedIn()
        ? wishlistAPI.check(Number(id))
        : Promise.resolve(null)
    ]).then(([prod, rev, wish]) => {
      setProduct(prod.data.data)
      setReviews(rev.data.data.reviews)
      setReviewStats(rev.data.data.stats)
      if (wish) setWished(wish.data.data.isFaved)
    }).finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!authStore.isLoggedIn()) { window.location.href = '/login'; return }
    setAdding(true)
    try {
      await cartAPI.addItem(Number(id), quantity)
      setAddedMsg('Đã thêm vào giỏ hàng!')
      setTimeout(() => setAddedMsg(''), 2000)
    } catch (err: any) {
      setAddedMsg(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = async () => {
    if (!authStore.isLoggedIn()) { window.location.href = '/login'; return }
    try {
      if (wished) {
        await wishlistAPI.remove(Number(id))
        setWished(false)
      } else {
        await wishlistAPI.add(Number(id))
        setWished(true)
      }
    } catch (err) { console.error(err) }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authStore.isLoggedIn()) { window.location.href = '/login'; return }
    setSubmitting(true)
    try {
      await reviewAPI.create({ productId: Number(id), ratingScore: rating, content })
      const res = await reviewAPI.getByProduct(Number(id))
      setReviews(res.data.data.reviews)
      setReviewStats(res.data.data.stats)
      setContent('')
      setRating(5)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#999' }}>Đang tải...</div>
    </div>
  )

  if (!product) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>Không tìm thấy sản phẩm</div>
    </div>
  )

  const discountedPrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem 4rem' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: '12px', color: '#999', marginBottom: '2rem' }}>
          <Link to="/" style={{ color: '#999', textDecoration: 'none' }}>Trang chủ</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <Link to="/shop" style={{ color: '#999', textDecoration: 'none' }}>Cửa hàng</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: '#1a1a1a' }}>{product.name}</span>
        </div>

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '4rem', alignItems: 'start' }}>

          {/* Ảnh sản phẩm */}
          <BookCover product={product} />

          {/* Thông tin */}
          <div>
            {/* Categories */}
            {product.categories && product.categories.length > 0 && (
              <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
                {product.categories.map((cat: any) => (
                  <Link key={cat.id} to={`/shop?categoryId=${cat.id}`} style={{
                    fontSize: '11px', color: '#8B6914',
                    letterSpacing: '0.08em', textDecoration: 'none',
                    textTransform: 'uppercase'
                  }}>{cat.name}</Link>
                ))}
              </div>
            )}

            <h1 style={{
              fontSize: '2rem', fontFamily: "'Playfair Display', serif",
              color: '#1a1a1a', fontWeight: 400,
              lineHeight: 1.2, marginBottom: '0.5rem'
            }}>{product.name}</h1>

            <div style={{ fontSize: '14px', color: '#666', marginBottom: '1.5rem' }}>
              Tác giả: <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{product.author}</span>
            </div>

            {/* Rating */}
            {reviewStats && reviewStats.totalReviews > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                <div style={{ color: '#8B6914', fontSize: '16px' }}>
                  {'★'.repeat(Math.round(reviewStats.avgRating))}{'☆'.repeat(5 - Math.round(reviewStats.avgRating))}
                </div>
                <span style={{ fontSize: '13px', color: '#666' }}>
                  {reviewStats.avgRating} ({reviewStats.totalReviews} đánh giá)
                </span>
              </div>
            )}

            {/* Price */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                fontSize: '2rem', fontWeight: 600, color: '#1a1a1a',
                fontFamily: "'Playfair Display', serif"
              }}>{formatPrice(discountedPrice)}</div>
              {product.discount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '15px', color: '#999', textDecoration: 'line-through' }}>
                    {formatPrice(product.price)}
                  </span>
                  <span style={{
                    background: '#fef0f0', color: '#8B1A1A',
                    fontSize: '12px', padding: '2px 8px', borderRadius: '4px'
                  }}>Tiết kiệm {formatPrice(product.price - discountedPrice)}</span>
                </div>
              )}
            </div>

            {/* Meta info */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '12px', marginBottom: '2rem',
              padding: '1.5rem', background: '#fff',
              borderRadius: '10px', border: '0.5px solid #e8e0d4'
            }}>
              {[
                { label: 'NXB', value: product.publisher },
                { label: 'Năm XB', value: product.yearPublishing },
                { label: 'Số trang', value: `${product.pages} trang` },
                { label: 'Còn lại', value: `${product.quantity} cuốn` }
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: '11px', color: '#999', marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Quantity + Add to cart */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                border: '0.5px solid #e8e0d4', borderRadius: '8px', overflow: 'hidden'
              }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{
                  width: '40px', height: '44px', background: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: '18px', color: '#666'
                }}>−</button>
                <span style={{
                  width: '48px', textAlign: 'center',
                  fontSize: '15px', fontWeight: 500, color: '#1a1a1a'
                }}>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))} style={{
                  width: '40px', height: '44px', background: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: '18px', color: '#666'
                }}>+</button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || product.quantity === 0}
                style={{
                  flex: 1, background: '#1a1a1a', color: '#f5f0e8',
                  border: 'none', borderRadius: '8px', padding: '12px 24px',
                  fontSize: '14px', fontWeight: 500, letterSpacing: '0.04em',
                  cursor: product.quantity === 0 ? 'not-allowed' : 'pointer',
                  opacity: adding ? 0.7 : 1, transition: 'all 0.2s'
                }}
              >
                {product.quantity === 0 ? 'Hết hàng' : adding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
              </button>

              <button
                onClick={handleWishlist}
                title={wished ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                style={{
                  width: '44px', height: '44px', borderRadius: '8px',
                  border: `0.5px solid ${wished ? '#8B1A1A' : '#e8e0d4'}`,
                  background: wished ? '#fef0f0' : '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"
                  fill={wished ? '#8B1A1A' : 'none'}
                  stroke={wished ? '#8B1A1A' : '#666'} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* Feedback message */}
            {addedMsg && (
              <div style={{
                padding: '10px 16px', borderRadius: '8px', fontSize: '13px',
                background: addedMsg.includes('lỗi') ? '#fef0f0' : '#f0fef4',
                color: addedMsg.includes('lỗi') ? '#8B1A1A' : '#166534',
                border: `0.5px solid ${addedMsg.includes('lỗi') ? '#fca5a5' : '#86efac'}`
              }}>{addedMsg}</div>
            )}

            {/* Description */}
            {product.description && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{
                  fontSize: '14px', fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: '#1a1a1a', marginBottom: '1rem'
                }}>Mô tả sách</h3>
                <p style={{
                  fontSize: '14px', color: '#555',
                  lineHeight: 1.8, whiteSpace: 'pre-line'
                }}>{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div style={{ marginTop: '4rem', borderTop: '0.5px solid #e8e0d4', paddingTop: '3rem' }}>
          <h2 style={{
            fontSize: '1.5rem', fontFamily: "'Playfair Display', serif",
            color: '#1a1a1a', fontWeight: 400, marginBottom: '2rem'
          }}>Đánh giá từ độc giả</h2>

          {/* Review stats */}
          {reviewStats && reviewStats.totalReviews > 0 && (
            <div style={{
              display: 'flex', gap: '3rem', alignItems: 'center',
              padding: '1.5rem', background: '#fff', borderRadius: '10px',
              border: '0.5px solid #e8e0d4', marginBottom: '2rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '3rem', fontWeight: 600,
                  fontFamily: "'Playfair Display', serif", color: '#1a1a1a'
                }}>{reviewStats.avgRating}</div>
                <div style={{ color: '#8B6914', fontSize: '20px' }}>
                  {'★'.repeat(Math.round(reviewStats.avgRating))}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  {reviewStats.totalReviews} đánh giá
                </div>
              </div>
              <div style={{ flex: 1 }}>
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#666', width: '16px' }}>{star}</span>
                    <span style={{ color: '#8B6914', fontSize: '12px' }}>★</span>
                    <div style={{ flex: 1, height: '6px', background: '#f0ebe0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', background: '#8B6914', borderRadius: '3px',
                        width: `${reviewStats.totalReviews > 0
                          ? (reviewStats[`star${star}`] / reviewStats.totalReviews) * 100
                          : 0}%`
                      }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#999', width: '20px' }}>
                      {reviewStats[`star${star}`]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review form */}
          {authStore.isLoggedIn() && (
            <form onSubmit={handleSubmitReview} style={{
              padding: '1.5rem', background: '#fff', borderRadius: '10px',
              border: '0.5px solid #e8e0d4', marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '1rem', color: '#1a1a1a' }}>
                Viết đánh giá của bạn
              </h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => setRating(star)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '24px', color: star <= rating ? '#8B6914' : '#ddd',
                    transition: 'color 0.1s'
                  }}>★</button>
                ))}
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
                required
                style={{
                  width: '100%', minHeight: '100px', padding: '12px',
                  border: '0.5px solid #e8e0d4', borderRadius: '8px',
                  fontSize: '13px', color: '#1a1a1a', resize: 'vertical',
                  outline: 'none', fontFamily: 'inherit'
                }}
              />
              <button type="submit" disabled={submitting} style={{
                marginTop: '12px', background: '#1a1a1a', color: '#f5f0e8',
                border: 'none', borderRadius: '6px', padding: '10px 24px',
                fontSize: '13px', cursor: 'pointer', opacity: submitting ? 0.7 : 1
              }}>
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          )}

          {/* Review list */}
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
              Chưa có đánh giá nào. Hãy là người đầu tiên!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map(review => (
                <div key={review.id} style={{
                  padding: '1.2rem', background: '#fff', borderRadius: '10px',
                  border: '0.5px solid #e8e0d4'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: '#8B6914', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 600
                      }}>{review.fullname?.charAt(0)}</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
                          {review.fullname}
                        </div>
                        <div style={{ color: '#8B6914', fontSize: '12px' }}>
                          {'★'.repeat(review.ratingScore)}{'☆'.repeat(5 - review.ratingScore)}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.7, margin: 0 }}>
                    {review.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
