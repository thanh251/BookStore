import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ProductCard from '../components/ui/ProductCard'
import { productAPI, categoryAPI } from '../services/api'
import type { Product, Category } from '../types'
import {
  PiBookOpenTextLight,
  PiFlaskLight,
  PiPaintBrushLight,
  PiBookmarksLight,
  PiNotebookLight,
  PiStarLight,
  PiNewspaperLight,
  PiArticleLight,
  PiFilesLight,
  PiForkKnifeLight,
  PiWrenchLight,
  PiPlantLight,
  PiBrainLight,
  PiLightbulbLight,
  PiChalkboardTeacherLight,
} from 'react-icons/pi'

const categoryIcons: Record<number, React.ReactElement> = {
  1:  <PiBookOpenTextLight      size={28} />,
  2:  <PiFlaskLight             size={28} />,
  3:  <PiPaintBrushLight        size={28} />,
  4:  <PiBookmarksLight         size={28} />,
  5:  <PiNotebookLight          size={28} />,
  6:  <PiStarLight              size={28} />,
  7:  <PiChalkboardTeacherLight size={28} />,
  8:  <PiNewspaperLight         size={28} />,
  9:  <PiArticleLight           size={28} />,
  10: <PiFilesLight             size={28} />,
  11: <PiForkKnifeLight         size={28} />,
  12: <PiWrenchLight            size={28} />,
  13: <PiPlantLight             size={28} />,
  14: <PiBrainLight             size={28} />,
  15: <PiLightbulbLight         size={28} />,
}

export default function Home() {
  const [bestsellers, setBestsellers] = useState<Product[]>([])
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      productAPI.getBestsellers(8),
      productAPI.getNew(8),
      productAPI.getPromotions(8),
      categoryAPI.getAll()
    ]).then(([bs, np, pr, cats]) => {
      setBestsellers(bs.data.data)
      setNewProducts(np.data.data)
      setPromotions(pr.data.data)
      setCategories(cats.data.data)
    }).finally(() => setLoading(false))
  }, [])

  const scroll = (dir: 'left' | 'right') => {
  if (!scrollRef.current) return
  const itemWidth = scrollRef.current.scrollWidth / 15  // 15 items tổng
  scrollRef.current.scrollBy({
    left: dir === 'left' ? -(itemWidth * 5) : (itemWidth * 5),
    behavior: 'smooth'
  })
}

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        background: '#1a1a1a', minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        padding: '0 2rem', paddingTop: '64px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `repeating-linear-gradient(
            45deg, #f5f0e8 0px, #f5f0e8 1px,
            transparent 0px, transparent 50%
          )`,
          backgroundSize: '20px 20px'
        }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative' }}>
          <div style={{ maxWidth: '600px' }}>
            <div style={{
              fontSize: '11px', letterSpacing: '0.2em', color: '#8B6914',
              textTransform: 'uppercase', marginBottom: '1.5rem'
            }}>
              ✦ Khám phá thế giới qua từng trang sách
            </div>
            <h1 style={{
              fontSize: 'clamp(3rem, 6vw, 5rem)',
              fontFamily: "'Playfair Display', serif",
              color: '#f5f0e8', fontWeight: 400,
              lineHeight: 1.1, marginBottom: '1.5rem',
              letterSpacing: '-0.02em'
            }}>
              Nơi những<br />
              <span style={{ color: '#8B6914', fontStyle: 'italic' }}>câu chuyện</span><br />
              bắt đầu
            </h1>
            <p style={{
              color: '#c8c0b0', fontSize: '16px',
              lineHeight: 1.8, marginBottom: '2.5rem',
              maxWidth: '440px'
            }}>
              Khám phá hàng nghìn đầu sách chất lượng cao — từ tiểu thuyết,
              khoa học đến kỹ năng sống. Giao hàng nhanh toàn quốc.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/shop" style={{
                background: '#f5f0e8', color: '#1a1a1a',
                padding: '14px 32px', borderRadius: '8px',
                textDecoration: 'none', fontSize: '14px',
                fontWeight: 500, letterSpacing: '0.04em'
              }}>Khám phá ngay</Link>
              <Link to="/shop?sort=bestseller" style={{
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#c8c0b0', padding: '14px 32px',
                borderRadius: '8px', textDecoration: 'none',
                fontSize: '14px', letterSpacing: '0.04em'
              }}>Bestsellers</Link>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            position: 'absolute', right: 0, top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', gap: '2rem'
          }}>
            {[
              { num: '100+', label: 'Đầu sách' },
              { num: '15',   label: 'Danh mục' },
              { num: '99%',  label: 'Hài lòng'  },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem', fontWeight: 600,
                  color: '#f5f0e8', fontFamily: "'Playfair Display', serif"
                }}>{stat.num}</div>
                <div style={{ fontSize: '11px', color: '#8B6914', letterSpacing: '0.1em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Announcement bar */}
      <div style={{
        background: '#8B6914', color: '#fff',
        padding: '10px', textAlign: 'center',
        fontSize: '12px', letterSpacing: '0.08em'
      }}>
        🚚 MIỄN PHÍ VẬN CHUYỂN ĐƠN HÀNG TRÊN 200K &nbsp;·&nbsp; 📦 GIAO HÀNG TOÀN QUỐC &nbsp;·&nbsp; 🔄 ĐỔI TRẢ 30 NGÀY
      </div>

      {/* ── Categories – horizontal scroll ── */}
      <section style={{ padding: '4rem 0', background: '#faf9f7', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0 2rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{
              fontSize: '11px', letterSpacing: '0.15em',
              color: '#8B6914', textTransform: 'uppercase', marginBottom: '0.5rem'
            }}>Danh mục</div>
            <h2 style={{
              fontSize: '2rem', fontFamily: "'Playfair Display', serif",
              color: '#1a1a1a', fontWeight: 400, margin: 0
            }}>Khám phá theo thể loại</h2>
          </div>

          {/* Scroll arrows */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['left', 'right'] as const).map(dir => (
              <button
                key={dir}
                onClick={() => scroll(dir)}
                style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  border: '0.5px solid #e8e0d4', background: '#fff',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', color: '#1a1a1a'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#f5f0e8'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#1a1a1a'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#fff'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#1a1a1a'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#e8e0d4'
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {dir === 'left'
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/>
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6"/>
                  }
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable track */}
        {/* Scrollable track */}
<div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
  {/* Left fade */}
  <div style={{
    position: 'absolute', left: '2rem', top: 0, bottom: 0, width: '40px', zIndex: 1,
    background: 'linear-gradient(to right, #faf9f7, transparent)',
    pointerEvents: 'none'
  }} />
  {/* Right fade */}
  <div style={{
    position: 'absolute', right: '2rem', top: 0, bottom: 0, width: '40px', zIndex: 1,
    background: 'linear-gradient(to left, #faf9f7, transparent)',
    pointerEvents: 'none'
  }} />

  <div
    ref={scrollRef}
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(15, 1fr)',  /* tất cả 15 cột bằng nhau */
      gap: '12px',
      overflowX: 'auto',
      scrollSnapType: 'x mandatory',
      paddingBottom: '8px',
      /* Chỉ cho thấy đúng 10 cột, còn lại ẩn */
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}
  >
    <style>{`
      .cat-scroll-track::-webkit-scrollbar { display: none; }
    `}</style>

    {categories.map(cat => (
      <Link
        key={cat.id}
        to={`/shop?categoryId=${cat.id}`}
        style={{ textDecoration: 'none', scrollSnapAlign: 'start' }}
      >
        <div
          style={{
            padding: '1.2rem 0.8rem',
            borderRadius: '12px',
            border: '0.5px solid #e8e0d4', background: '#fff',
            textAlign: 'center', cursor: 'pointer',
            transition: 'all 0.22s ease',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '8px',
            minWidth: 0   /* quan trọng để grid không bị vỡ */
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.background = '#1a1a1a'
            el.style.borderColor = '#1a1a1a'
            el.style.transform = 'translateY(-3px)'
            el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
            el.querySelectorAll<HTMLElement>('.cat-icon,.cat-name').forEach(c => {
              c.style.color = '#f5f0e8'
            })
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement
            el.style.background = '#fff'
            el.style.borderColor = '#e8e0d4'
            el.style.transform = 'translateY(0)'
            el.style.boxShadow = 'none'
            el.querySelectorAll<HTMLElement>('.cat-icon,.cat-name').forEach(c => {
              c.style.color = ''
            })
          }}
        >
          <div className="cat-icon" style={{
            color: '#8B6914', transition: 'color 0.22s',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {categoryIcons[cat.id] ?? <PiBookOpenTextLight size={28} />}
          </div>
          <div className="cat-name" style={{
            fontSize: '12px', color: '#1a1a1a',
            fontWeight: 500, lineHeight: 1.3,
            transition: 'color 0.22s',
            whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis', maxWidth: '100%'
          }}>
            {cat.name}
          </div>
        </div>
      </Link>
    ))}
  </div>
</div>
      </section>

      {/* Bestsellers */}
      <section style={{ padding: '2rem 2rem 4rem', background: '#f5f0e8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-end', marginBottom: '2rem'
          }}>
            <div>
              <div style={{
                fontSize: '11px', letterSpacing: '0.15em',
                color: '#8B6914', textTransform: 'uppercase', marginBottom: '0.5rem'
              }}>Bán chạy nhất</div>
              <h2 style={{
                fontSize: '2rem', fontFamily: "'Playfair Display', serif",
                color: '#1a1a1a', fontWeight: 400
              }}>Được yêu thích nhất</h2>
            </div>
            <Link to="/shop?sort=bestseller" style={{
              color: '#1a1a1a', fontSize: '13px',
              textDecoration: 'underline', textUnderlineOffset: '3px'
            }}>Xem tất cả →</Link>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Đang tải...</div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1.2rem'
            }}>
              {bestsellers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Promotions */}
      {promotions.length > 0 && (
        <section style={{ background: '#1a1a1a', padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              fontSize: '11px', letterSpacing: '0.15em',
              color: '#8B6914', textTransform: 'uppercase', marginBottom: '0.5rem'
            }}>Khuyến mãi</div>
            <h2 style={{
              fontSize: '2rem', fontFamily: "'Playfair Display', serif",
              color: '#f5f0e8', fontWeight: 400, marginBottom: '0.5rem'
            }}>Ưu đãi hôm nay</h2>
            <p style={{ color: '#c8c0b0', fontSize: '14px', marginBottom: '2.5rem' }}>
              Giảm giá lên đến {Math.max(...promotions.map(p => p.discount))}% cho các đầu sách được chọn
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1.2rem', marginBottom: '2rem'
            }}>
              {promotions.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <Link to="/shop?discount=true" style={{
              display: 'inline-block',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#f5f0e8', padding: '12px 28px',
              borderRadius: '8px', textDecoration: 'none',
              fontSize: '13px', letterSpacing: '0.06em'
            }}>Xem tất cả khuyến mãi →</Link>
          </div>
        </section>
      )}

      {/* New Products */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-end', marginBottom: '2rem'
        }}>
          <div>
            <div style={{
              fontSize: '11px', letterSpacing: '0.15em',
              color: '#8B6914', textTransform: 'uppercase', marginBottom: '0.5rem'
            }}>Mới nhất</div>
            <h2 style={{
              fontSize: '2rem', fontFamily: "'Playfair Display', serif",
              color: '#1a1a1a', fontWeight: 400
            }}>Sách mới về</h2>
          </div>
          <Link to="/shop?sort=newest" style={{
            color: '#1a1a1a', fontSize: '13px',
            textDecoration: 'underline', textUnderlineOffset: '3px'
          }}>Xem tất cả →</Link>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Đang tải...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.2rem'
          }}>
            {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Trust bar */}
      <section style={{
        background: '#fff', borderTop: '0.5px solid #e8e0d4',
        borderBottom: '0.5px solid #e8e0d4', padding: '2.5rem 2rem'
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem', textAlign: 'center'
        }}>
          {[
            { icon: '🚚', title: 'Miễn phí vận chuyển', sub: 'Đơn hàng trên 200k' },
            { icon: '🔒', title: 'Thanh toán an toàn',  sub: 'Mã hoá SSL 256-bit'  },
            { icon: '↩️', title: 'Đổi trả dễ dàng',    sub: 'Trong vòng 30 ngày'  },
            { icon: '📦', title: 'Đóng gói cẩn thận',  sub: 'Bảo vệ sách tốt nhất'},
          ].map(item => (
            <div key={item.title}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
