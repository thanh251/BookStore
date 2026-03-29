import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ProductCard from '../components/ui/ProductCard'
import { productAPI, categoryAPI } from '../services/api'
import type { Product, Category, Pagination } from '../types'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)

  const currentPage = Number(searchParams.get('page')) || 1
  const currentCategory = searchParams.get('categoryId') || ''
  const currentSort = searchParams.get('sort') || ''
  const currentSearch = searchParams.get('search') || ''

  useEffect(() => {
    categoryAPI.getAll().then(res => setCategories(res.data.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    productAPI.getAll({
      page: currentPage,
      limit: 12,
      categoryId: currentCategory || undefined,
      sort: currentSort || undefined,
      search: currentSearch || undefined
    }).then(res => {
      setProducts(res.data.data)
      setPagination(res.data.pagination)
    }).finally(() => setLoading(false))
  }, [currentPage, currentCategory, currentSort, currentSearch])

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    setSearchParams(params)
  }

  const sortOptions = [
    { value: '', label: 'Mới nhất' },
    { value: 'bestseller', label: 'Bán chạy nhất' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      <Navbar />

      {/* Header */}
      <div style={{
        background: '#1a1a1a', paddingTop: '64px',
        padding: '5rem 2rem 3rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.15em',
            color: '#8B6914', textTransform: 'uppercase', marginBottom: '0.5rem'
          }}>Cửa hàng</div>
          <h1 style={{
            fontSize: '2.5rem', fontFamily: "'Playfair Display', serif",
            color: '#f5f0e8', fontWeight: 400
          }}>Tất cả sách</h1>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Search + Filter bar */}
        <div style={{
          display: 'flex', gap: '1rem', marginBottom: '2rem',
          flexWrap: 'wrap', alignItems: 'center'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <svg style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', color: '#999'
            }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm sách, tác giả..."
              defaultValue={currentSearch}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  updateParam('search', (e.target as HTMLInputElement).value)
                }
              }}
              style={{
                width: '100%', padding: '10px 12px 10px 38px',
                border: '0.5px solid #e8e0d4', borderRadius: '8px',
                fontSize: '13px', background: '#fff', outline: 'none',
                color: '#1a1a1a'
              }}
            />
          </div>

          {/* Sort */}
          <select
            value={currentSort}
            onChange={e => updateParam('sort', e.target.value)}
            style={{
              padding: '10px 14px', border: '0.5px solid #e8e0d4',
              borderRadius: '8px', fontSize: '13px', background: '#fff',
              color: '#1a1a1a', outline: 'none', cursor: 'pointer'
            }}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Category chips */}
        <div style={{
          display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '2rem'
        }}>
          <button
            onClick={() => updateParam('categoryId', '')}
            style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '12px',
              cursor: 'pointer', letterSpacing: '0.03em', transition: 'all 0.2s',
              border: !currentCategory ? 'none' : '0.5px solid #e8e0d4',
              background: !currentCategory ? '#1a1a1a' : '#fff',
              color: !currentCategory ? '#f5f0e8' : '#666'
            }}
          >Tất cả</button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => updateParam('categoryId', String(cat.id))}
              style={{
                padding: '6px 16px', borderRadius: '20px', fontSize: '12px',
                cursor: 'pointer', letterSpacing: '0.03em', transition: 'all 0.2s',
                border: currentCategory === String(cat.id) ? 'none' : '0.5px solid #e8e0d4',
                background: currentCategory === String(cat.id) ? '#1a1a1a' : '#fff',
                color: currentCategory === String(cat.id) ? '#f5f0e8' : '#666'
              }}
            >{cat.name}</button>
          ))}
        </div>

        {/* Results info */}
        {pagination && (
          <div style={{
            fontSize: '13px', color: '#999', marginBottom: '1.5rem'
          }}>
            Hiển thị {products.length} / {pagination.total} sản phẩm
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.2rem'
          }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{
                borderRadius: '10px', overflow: 'hidden',
                border: '0.5px solid #e8e0d4', background: '#fff'
              }}>
                <div style={{
                  aspectRatio: '3/4', background: '#f0ebe0',
                  animation: 'pulse 1.5s infinite'
                }} />
                <div style={{ padding: '12px' }}>
                  <div style={{ height: '12px', background: '#f0ebe0', borderRadius: '4px', marginBottom: '8px' }} />
                  <div style={{ height: '16px', background: '#f0ebe0', borderRadius: '4px', width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#999' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <div style={{ fontSize: '16px' }}>Không tìm thấy sách phù hợp</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.2rem'
          }}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center',
            gap: '8px', marginTop: '3rem'
          }}>
            <button
              disabled={currentPage === 1}
              onClick={() => updateParam('page', String(currentPage - 1))}
              style={{
                padding: '8px 16px', borderRadius: '6px',
                border: '0.5px solid #e8e0d4', background: '#fff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.4 : 1, fontSize: '13px'
              }}
            >← Trước</button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pagination.totalPages ||
                Math.abs(p - currentPage) <= 2)
              .map((page, idx, arr) => (
                <>
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span key={`dots-${page}`} style={{ padding: '8px 4px', color: '#999' }}>...</span>
                  )}
                  <button
                    key={page}
                    onClick={() => updateParam('page', String(page))}
                    style={{
                      padding: '8px 14px', borderRadius: '6px', fontSize: '13px',
                      cursor: 'pointer', transition: 'all 0.2s',
                      border: currentPage === page ? 'none' : '0.5px solid #e8e0d4',
                      background: currentPage === page ? '#1a1a1a' : '#fff',
                      color: currentPage === page ? '#f5f0e8' : '#1a1a1a',
                    }}
                  >{page}</button>
                </>
              ))
            }

            <button
              disabled={currentPage === pagination.totalPages}
              onClick={() => updateParam('page', String(currentPage + 1))}
              style={{
                padding: '8px 16px', borderRadius: '6px',
                border: '0.5px solid #e8e0d4', background: '#fff',
                cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === pagination.totalPages ? 0.4 : 1, fontSize: '13px'
              }}
            >Sau →</button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}