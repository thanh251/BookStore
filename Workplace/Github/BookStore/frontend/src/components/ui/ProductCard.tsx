import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { cartAPI, wishlistAPI, getImageUrl } from '../../services/api'
import { authStore } from '../../store/authStore'

interface Props {
  product: Product
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

export default function ProductCard({ product }: Props) {
  const [adding, setAdding] = useState(false)
  const [wished, setWished] = useState(false)
  const [imgError, setImgError] = useState(false)

  const discountedPrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price

  const imageUrl = getImageUrl(product.imageName)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!authStore.isLoggedIn()) {
      window.location.href = '/login'
      return
    }
    setAdding(true)
    try {
      await cartAPI.addItem(product.id, 1)
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!authStore.isLoggedIn()) {
      window.location.href = '/login'
      return
    }
    try {
      if (wished) {
        await wishlistAPI.remove(product.id)
        setWished(false)
      } else {
        await wishlistAPI.add(product.id)
        setWished(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          borderRadius: '10px',
          border: '0.5px solid #e8e0d4',
          overflow: 'hidden',
          background: '#fff',
          transition: 'all 0.25s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = '#c8c0b0'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
          ;(e.currentTarget as HTMLDivElement).style.borderColor = '#e8e0d4'
        }}
      >
        {/* Image */}
        <div style={{
          aspectRatio: '3/4',
          background: '#f5f0e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Discount badge */}
          {product.discount > 0 && (
            <div style={{
              position: 'absolute', top: '10px', left: '10px',
              background: '#8B1A1A', color: '#fff',
              fontSize: '11px', padding: '3px 8px',
              borderRadius: '4px', letterSpacing: '0.04em',
              fontWeight: 500, zIndex: 1,
            }}>-{product.discount}%</div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            style={{
              position: 'absolute', top: '10px', right: '10px',
              background: 'rgba(255,255,255,0.9)', border: 'none',
              borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 1, transition: 'all 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill={wished ? '#8B1A1A' : 'none'}
              stroke={wished ? '#8B1A1A' : '#666'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>

          {/* Ảnh thật hoặc placeholder */}
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ) : (
            // Placeholder màu khi chưa có ảnh
            <div style={{
              width: '55%', height: '72%',
              background: `hsl(${(product.id * 47) % 360}, 35%, 45%)`,
              borderRadius: '3px 8px 8px 3px',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center',
              gap: '6px', padding: '12px',
              boxShadow: '3px 0 8px rgba(0,0,0,0.2)',
            }}>
              <div style={{
                fontSize: '10px', fontWeight: 600,
                color: 'rgba(255,255,255,0.9)',
                textAlign: 'center', lineHeight: 1.3,
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
              }}>
                {product.name.replace('Sách ', '')}
              </div>
              <div style={{ width: '24px', height: '0.5px', background: 'rgba(255,255,255,0.4)' }} />
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                {product.author}
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '12px' }}>
          <div style={{
            fontSize: '10px', color: '#999', letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: '4px',
          }}>{product.author}</div>

          <div style={{
            fontSize: '13px', color: '#1a1a1a', lineHeight: 1.4,
            marginBottom: '10px', fontWeight: 500,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{product.name}</div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                {formatPrice(discountedPrice)}
              </span>
              {product.discount > 0 && (
                <span style={{
                  fontSize: '11px', color: '#999',
                  textDecoration: 'line-through', marginLeft: '6px',
                }}>{formatPrice(product.price)}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding}
              style={{
                background: '#1a1a1a', color: '#f5f0e8',
                border: 'none', borderRadius: '6px',
                padding: '6px 12px', fontSize: '11px',
                letterSpacing: '0.04em', cursor: 'pointer',
                transition: 'all 0.2s', opacity: adding ? 0.7 : 1,
              }}
              onMouseEnter={e => !adding && ((e.currentTarget as HTMLButtonElement).style.background = '#333')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a')}
            >
              {adding ? '...' : '+ Giỏ'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
