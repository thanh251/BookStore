import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productAPI, categoryAPI, uploadAPI, getImageUrl } from '../../services/api'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const navLinks = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/products', label: 'Sản phẩm', icon: '📚' },
  { path: '/admin/orders', label: 'Đơn hàng', icon: '📦' },
  { path: '/admin/users', label: 'Người dùng', icon: '👥' },
]

const emptyForm = {
  name: '', author: '', price: '', discount: '0',
  quantity: '', pages: '', publisher: '',
  yearPublishing: new Date().getFullYear().toString(),
  description: '', shop: true, imageName: ''
}

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await productAPI.getAll({ page, limit: 10, search: search || undefined })
      setProducts(res.data.data)
      setPagination(res.data.pagination)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [page, search])
  useEffect(() => { categoryAPI.getAll().then(r => setCategories(r.data.data)) }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setPreviewUrl('')
    setShowModal(true)
  }

  const openEdit = (product: any) => {
    setEditing(product)
    setForm({
      name: product.name,
      author: product.author,
      price: String(product.price),
      discount: String(product.discount),
      quantity: String(product.quantity),
      pages: String(product.pages),
      publisher: product.publisher,
      yearPublishing: String(product.yearPublishing),
      description: product.description || '',
      shop: product.shop,
      imageName: product.imageName || ''
    })
    setPreviewUrl(getImageUrl(product.imageName) || '')
    setShowModal(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadAPI.image(file)
      const fileName = res.data.data.fileName
      setForm(prev => ({ ...prev, imageName: fileName }))
      setPreviewUrl(getImageUrl(fileName) || '')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload thất bại')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        ...form,
        price: Number(form.price),
        discount: Number(form.discount),
        quantity: Number(form.quantity),
        pages: Number(form.pages),
        yearPublishing: Number(form.yearPublishing),
      }
      if (editing) await productAPI.update(editing.id, data)
      else await productAPI.create(data)
      setShowModal(false)
      await fetchProducts()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return
    try {
      await productAPI.delete(id)
      await fetchProducts()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa')
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '0.5px solid #e8e0d4', borderRadius: '8px',
    fontSize: '13px', color: '#1a1a1a', outline: 'none',
    background: '#fff', fontFamily: 'inherit',
    transition: 'border 0.2s'
  }

  const labelStyle = {
    display: 'block' as const, fontSize: '11px',
    letterSpacing: '0.08em', color: '#8B6914',
    textTransform: 'uppercase' as const, marginBottom: '6px'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#faf9f7' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', background: '#1a1a1a', flexShrink: 0,
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10
      }}>
        <div style={{ padding: '1.8rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
          <Link to="/" style={{
            color: '#f5f0e8', fontSize: '16px', fontWeight: 600,
            letterSpacing: '0.15em', textDecoration: 'none',
            fontFamily: "'Playfair Display', serif"
          }}>BOOKSTORE</Link>
          <div style={{ fontSize: '11px', color: '#8B6914', marginTop: '4px' }}>ADMIN PANEL</div>
        </div>
        <nav style={{ padding: '1rem 0' }}>
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '11px 1.5rem', textDecoration: 'none', fontSize: '13px',
              color: '#c8c0b0', transition: 'color 0.2s',
              borderLeft: location.pathname === link.path ? '2px solid #8B6914' : '2px solid transparent',
              background: location.pathname === link.path ? 'rgba(139,105,20,0.1)' : 'transparent',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f5f0e8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#c8c0b0')}
            ><span>{link.icon}</span><span>{link.label}</span></Link>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.5rem', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
          <Link to="/" style={{ fontSize: '12px', color: '#c8c0b0', textDecoration: 'none' }}>
            ← Về trang chủ
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: '220px', flex: 1, padding: '2.5rem' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', marginBottom: '2rem'
        }}>
          <div>
            <div style={{
              fontSize: '11px', letterSpacing: '0.15em',
              color: '#8B6914', textTransform: 'uppercase', marginBottom: '6px'
            }}>Quản lý</div>
            <h1 style={{
              fontSize: '1.8rem', fontFamily: "'Playfair Display', serif",
              color: '#1a1a1a', fontWeight: 400
            }}>Sản phẩm</h1>
          </div>
          <button onClick={openCreate} style={{
            background: '#1a1a1a', color: '#f5f0e8', border: 'none',
            padding: '10px 20px', borderRadius: '8px', fontSize: '13px',
            fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit'
          }}>+ Thêm sản phẩm</button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            defaultValue={search}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setSearch((e.target as HTMLInputElement).value)
                setPage(1)
              }
            }}
            style={{ ...inputStyle, paddingLeft: '36px' }}
          />
          <span style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', color: '#999', fontSize: '14px'
          }}>🔍</span>
        </div>

        {/* Table */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '0.5px solid #e8e0d4', overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#faf9f7' }}>
                {['Sản phẩm', 'Tác giả', 'Giá', 'Giảm', 'Tồn kho', 'Hiển thị', 'Thao tác'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: '11px', letterSpacing: '0.08em', color: '#999',
                    textTransform: 'uppercase', fontWeight: 500,
                    borderBottom: '0.5px solid #e8e0d4'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
                    Đang tải...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
                    Không tìm thấy sản phẩm
                  </td>
                </tr>
              ) : products.map((p: any, idx: number) => (
                <tr key={p.id} style={{
                  borderBottom: idx < products.length - 1 ? '0.5px solid #f0ebe0' : 'none',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#faf9f7')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Sản phẩm */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Thumbnail */}
                      <div style={{
                        width: '32px', height: '42px',
                        borderRadius: '3px 6px 6px 3px', flexShrink: 0,
                        overflow: 'hidden',
                        background: getImageUrl(p.imageName)
                          ? '#f5f0e8'
                          : `hsl(${(p.id * 47) % 360}, 35%, 45%)`
                      }}>
                        {getImageUrl(p.imageName) ? (
                          <img
                            src={getImageUrl(p.imageName)!}
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : null}
                      </div>
                      <div style={{
                        fontSize: '13px', fontWeight: 500, color: '#1a1a1a',
                        maxWidth: '180px', overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>{p.name}</div>
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>
                    {p.author}
                  </td>

                  <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
                    {formatPrice(p.price)}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    {p.discount > 0 ? (
                      <span style={{
                        background: '#fef0f0', color: '#8B1A1A',
                        fontSize: '11px', padding: '2px 8px', borderRadius: '4px'
                      }}>-{p.discount}%</span>
                    ) : (
                      <span style={{ color: '#ccc', fontSize: '13px' }}>—</span>
                    )}
                  </td>

                  <td style={{
                    padding: '12px 16px', fontSize: '13px', fontWeight: 500,
                    color: p.quantity < 5 ? '#8B1A1A' : '#166534'
                  }}>
                    {p.quantity}
                    {p.quantity < 5 && p.quantity > 0 && (
                      <span style={{ fontSize: '10px', color: '#8B1A1A', marginLeft: '4px' }}>
                        ⚠️
                      </span>
                    )}
                    {p.quantity === 0 && (
                      <span style={{ fontSize: '10px', color: '#8B1A1A', marginLeft: '4px' }}>
                        Hết
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                      background: p.shop ? '#f0fef4' : '#f5f5f5',
                      color: p.shop ? '#166534' : '#999'
                    }}>{p.shop ? 'Hiện' : 'Ẩn'}</span>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openEdit(p)} style={{
                        padding: '5px 12px', borderRadius: '6px', fontSize: '12px',
                        border: '0.5px solid #e8e0d4', background: '#fff',
                        cursor: 'pointer', color: '#1a1a1a', fontFamily: 'inherit',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'
                        ;(e.currentTarget as HTMLButtonElement).style.color = '#f5f0e8'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#fff'
                        ;(e.currentTarget as HTMLButtonElement).style.color = '#1a1a1a'
                      }}
                      >Sửa</button>
                      <button onClick={() => handleDelete(p.id, p.name)} style={{
                        padding: '5px 12px', borderRadius: '6px', fontSize: '12px',
                        border: '0.5px solid #fca5a5', background: '#fff',
                        cursor: 'pointer', color: '#8B1A1A', fontFamily: 'inherit',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#fef0f0'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#fff'
                      }}
                      >Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              style={{
                padding: '7px 14px', borderRadius: '6px',
                border: '0.5px solid #e8e0d4', background: '#fff',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.4 : 1, fontSize: '13px'
              }}
            >← Trước</button>

            {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                padding: '7px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
                border: page === p ? 'none' : '0.5px solid #e8e0d4',
                background: page === p ? '#1a1a1a' : '#fff',
                color: page === p ? '#f5f0e8' : '#1a1a1a',
                transition: 'all 0.15s'
              }}>{p}</button>
            ))}

            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
              style={{
                padding: '7px 14px', borderRadius: '6px',
                border: '0.5px solid #e8e0d4', background: '#fff',
                cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer',
                opacity: page === pagination.totalPages ? 0.4 : 1, fontSize: '13px'
              }}
            >Sau →</button>
          </div>
        )}
      </main>

      {/* Modal Thêm/Sửa sản phẩm */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '2rem'
          }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%',
            maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto',
            padding: '2rem'
          }}>
            {/* Modal header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.3rem', fontFamily: "'Playfair Display', serif",
                color: '#1a1a1a', fontWeight: 400
              }}>{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none', border: 'none', fontSize: '22px',
                  cursor: 'pointer', color: '#999', lineHeight: 1,
                  padding: '4px 8px', borderRadius: '6px', transition: 'all 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >×</button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                {/* Upload ảnh */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Ảnh sản phẩm</label>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    {/* Preview */}
                    <div style={{
                      width: '80px', height: '106px', borderRadius: '6px 10px 10px 6px',
                      border: '0.5px solid #e8e0d4', overflow: 'hidden',
                      flexShrink: 0, display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      background: previewUrl ? '#f5f0e8' : `hsl(${(editing?.id ?? 0 * 47) % 360}, 35%, 45%)`
                    }}>
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ fontSize: '28px' }}>📚</span>
                      )}
                    </div>

                    {/* Upload area */}
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 16px', borderRadius: '8px',
                        border: `1.5px dashed ${uploading ? '#c8c0b0' : '#e8e0d4'}`,
                        background: uploading ? '#faf9f7' : '#fff',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        fontSize: '13px', color: '#666', transition: 'all 0.2s',
                        width: 'fit-content'
                      }}
                      onMouseEnter={e => !uploading && ((e.currentTarget.style.borderColor = '#8B6914'))}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = uploading ? '#c8c0b0' : '#e8e0d4')}
                      >
                        <span style={{ fontSize: '16px' }}>{uploading ? '⏳' : '📁'}</span>
                        <span>{uploading ? 'Đang upload...' : 'Chọn ảnh'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <p style={{ fontSize: '11px', color: '#bbb', marginTop: '6px', marginBottom: 0 }}>
                        JPG, PNG, WEBP · Tối đa 5MB
                      </p>
                      {form.imageName && (
                        <p style={{
                          fontSize: '11px', color: '#166534',
                          marginTop: '4px', marginBottom: 0,
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                          <span>✓</span>
                          <span style={{
                            maxWidth: '200px', overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }}>{form.imageName}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tên sách */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Tên sách *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Nhập tên sách"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#8B6914'}
                    onBlur={e => e.target.style.borderColor = '#e8e0d4'}
                  />
                </div>

                {/* Tác giả */}
                <div>
                  <label style={labelStyle}>Tác giả *</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={e => setForm(prev => ({ ...prev, author: e.target.value }))}
                    required
                    placeholder="Tên tác giả"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#8B6914'}
                    onBlur={e => e.target.style.borderColor = '#e8e0d4'}
                  />
                </div>

                {/* NXB */}
                <div>
                  <label style={labelStyle}>Nhà xuất bản *</label>
                  <input
                    type="text"
                    value={form.publisher}
                    onChange={e => setForm(prev => ({ ...prev, publisher: e.target.value }))}
                    required
                    placeholder="Tên NXB"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#8B6914'}
                    onBlur={e => e.target.style.borderColor = '#e8e0d4'}
                  />
                </div>

                {/* Giá */}
                <div>
                  <label style={labelStyle}>Giá (VND) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                    required
                    min="0"
                    placeholder="VD: 150000"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#8B6914'}
                    onBlur={e => e.target.style.borderColor = '#e8e0d4'}
                  />
                </div>

                {/* Giảm giá */}
                <div>
                  <label style={labelStyle}>Giảm giá (%)</label>
                  <input
                    type="number"
                    value={form.discount}
                    onChange={e => setForm(prev => ({ ...prev, discount: e.target.value }))}
                    min="0"
                    max="100"
                    placeholder="0"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#8B6914'}
                    onBlur={e => e.target.style.borderColor = '#e8e0d4'}
                  />
                </div>

                {/* Số lượng */}
                <div>
                  <label style={labelStyle}>Số lượng *</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={e => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                    required
                    min="0"
                    placeholder="VD: 100"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#8B6914'}
                    onBlur={e => e.target.style.borderColor = '#e8e0d4'}
                  />
                </div>

                {/* Số trang */}
                <div>
                  <label style={labelStyle}>Số trang *</label>
                  <input
                    type="number"
                    value={form.pages}
                    onChange={e => setForm(prev => ({ ...prev, pages: e.target.value }))}
                    required
                    min="1"
                    placeholder="VD: 300"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#8B6914'}
                    onBlur={e => e.target.style.borderColor = '#e8e0d4'}
                  />
                </div>

                {/* Năm XB */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Năm xuất bản *</label>
                  <input
                    type="number"
                    value={form.yearPublishing}
                    onChange={e => setForm(prev => ({ ...prev, yearPublishing: e.target.value }))}
                    required
                    min="1900"
                    max={new Date().getFullYear()}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#8B6914'}
                    onBlur={e => e.target.style.borderColor = '#e8e0d4'}
                  />
                </div>

                {/* Mô tả */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Mô tả</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Mô tả ngắn về cuốn sách..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => e.target.style.borderColor = '#8B6914'}
                    onBlur={e => e.target.style.borderColor = '#e8e0d4'}
                  />
                </div>

                {/* Hiển thị */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Hiển thị trên cửa hàng</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[{ label: '👁 Hiển thị', value: true }, { label: '🚫 Ẩn', value: false }].map(opt => (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, shop: opt.value }))}
                        style={{
                          flex: 1, padding: '10px',
                          background: form.shop === opt.value ? '#1a1a1a' : '#fff',
                          color: form.shop === opt.value ? '#f5f0e8' : '#666',
                          border: `1.5px solid ${form.shop === opt.value ? '#1a1a1a' : '#e8e0d4'}`,
                          borderRadius: '8px', fontSize: '13px',
                          cursor: 'pointer', transition: 'all 0.2s',
                          fontFamily: 'inherit'
                        }}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{
                display: 'flex', gap: '10px',
                justifyContent: 'flex-end', marginTop: '1.5rem',
                paddingTop: '1.5rem', borderTop: '0.5px solid #e8e0d4'
              }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px', borderRadius: '8px', fontSize: '13px',
                    border: '0.5px solid #e8e0d4', background: '#fff',
                    cursor: 'pointer', fontFamily: 'inherit', color: '#666'
                  }}
                >Hủy</button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  style={{
                    padding: '10px 28px', borderRadius: '8px', fontSize: '13px',
                    background: (saving || uploading) ? '#555' : '#1a1a1a',
                    color: '#f5f0e8', border: 'none',
                    cursor: (saving || uploading) ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s'
                  }}
                >
                  {saving ? 'Đang lưu...' : uploading ? 'Chờ upload ảnh...' : editing ? '💾 Lưu thay đổi' : '+ Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
