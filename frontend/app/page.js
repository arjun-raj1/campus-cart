'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fetchProducts } from '../lib/api';
import ProductCard from '../components/ProductCard';

function HomeContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  
  const [allProducts, setAllProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setAllProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Server offline — make sure backend is running.');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const end = new Date(); 
    end.setHours(23, 59, 59, 0);
    
    const timer = setInterval(() => {
      const diff = end - Date.now();
      if (diff <= 0) { end.setDate(end.getDate() + 1); }
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimeLeft({ h, m, s });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const getCatEmoji = (cat) => {
    return {
      'Mechanical': '⚙️',
      'Electrical': '⚡',
      'Electronics': '🔌',
      'Study Materials': '📚',
      'Safety Gear': '🦺'
    }[cat] || '📦';
  };

  const filteredProducts = allProducts.filter(p => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const deals = allProducts.slice(0, 4);

  return (
    <div>
      {/* CATEGORIES BAR */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
      }}>
        {['All', 'Mechanical', 'Electrical', 'Electronics', 'Study Materials', 'Safety Gear'].map(cat => (
          <div 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '14px 18px',
              fontSize: '0.82rem',
              fontWeight: '600',
              color: activeCategory === cat ? 'var(--cyan)' : 'var(--muted)',
              borderBottom: `2px solid ${activeCategory === cat ? 'var(--cyan)' : 'transparent'}`,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {cat === 'All' ? '🏠' : getCatEmoji(cat)} {cat === 'All' ? 'All Items' : cat}
          </div>
        ))}
      </div>

      {/* HERO BANNER */}
      <div style={{
        background: 'var(--hero-bg)',
        padding: '80px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '260px',
        transition: 'background 0.3s'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '450px' }}>
          <div style={{
            display: 'inline-block',
            background: 'var(--yellow)',
            color: '#000',
            fontSize: '0.7rem',
            fontWeight: '800',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            padding: '4px 12px',
            borderRadius: '4px',
            marginBottom: '14px'
          }}>🎓 Student Marketplace</div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            fontWeight: '900',
            lineHeight: '1.1',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            Buy & Sell<br />
            <span style={{ fontWeight: '300', color: 'var(--text)' }}>Workshop Essentials</span><br />
            for Less
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
            Senior students selling unused lab coats, safety boots & more — at unbeatable prices.
          </p>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--green)', marginBottom: '20px' }}>
            Starting at ₹99 <del style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: '400', marginLeft: '8px' }}>₹500+</del>
          </div>
          <Link href="/sell" className="btn btn-primary" style={{ fontSize: '0.95rem', padding: '12px 26px' }}>
            List Your Item →
          </Link>
        </div>
        <div style={{
          position: 'absolute',
          right: '15%',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>
        <div style={{
          flexShrink: 0,
          maxWidth: '380px',
          width: '45%',
          position: 'relative',
          zIndex: 1,
          filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.8)) grayscale(100%)'
        }}>
          <div style={{ fontSize: '9rem', textAlign: 'center', filter: 'drop-shadow(0 0 30px rgba(0,194,255,0.5))' }}>
            🥼
          </div>
        </div>
      </div>

      {/* FEATURES STRIP */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        background: 'var(--strip-bg)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        transition: 'background 0.3s'
      }}>
        {[
          { icon: '🎓', title: 'Student Only', subtitle: 'Verified campus listings' },
          { icon: '💬', title: 'WhatsApp Contact', subtitle: 'Direct seller chat' },
          { icon: '🔒', title: 'Safe Exchange', subtitle: 'Meet on campus' },
          { icon: '💰', title: 'Best Prices', subtitle: 'Up to 80% off retail' },
          { icon: '♻️', title: 'Eco Friendly', subtitle: 'Reduce & Reuse' },
        ].map((feat, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 16px',
            borderRight: i < 4 ? '1px solid var(--border)' : 'none',
            fontSize: '0.8rem'
          }}>
            <div style={{ fontSize: '1.4rem', flexShrink: 0 }}>{feat.icon}</div>
            <div>
              <strong style={{ display: 'block', fontWeight: '700', color: 'var(--text)', fontSize: '0.82rem' }}>{feat.title}</strong>
              <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>{feat.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      {/* DEALS OF THE DAY */}
      {!loading && !error && deals.length >= 2 && (
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 0',
            marginBottom: '22px'
          }}>
            <div style={{
              fontSize: '1.15rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              🔥 Deals of the Day
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--muted)' }}>
              Ends in:
              <div style={{ background: 'var(--accent)', color: 'white', borderRadius: '6px', padding: '4px 8px', fontSize: '0.85rem', fontWeight: '700', minWidth: '32px', textAlign: 'center' }}>{timeLeft.h}</div>:
              <div style={{ background: 'var(--accent)', color: 'white', borderRadius: '6px', padding: '4px 8px', fontSize: '0.85rem', fontWeight: '700', minWidth: '32px', textAlign: 'center' }}>{timeLeft.m}</div>:
              <div style={{ background: 'var(--accent)', color: 'white', borderRadius: '6px', padding: '4px 8px', fontSize: '0.85rem', fontWeight: '700', minWidth: '32px', textAlign: 'center' }}>{timeLeft.s}</div>
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
            padding: '16px 24px 24px'
          }}>
            {deals.map(p => {
              const orig = Math.round(p.price * 1.6);
              const sold = Math.floor(Math.random() * 60) + 20;
              return (
                <Link key={p._id} href={`/products/${p._id}`} style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r)',
                  padding: '16px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                  transition: 'border-color 0.2s',
                  textDecoration: 'none',
                }}>
                  <div style={{
                    width: '90px',
                    height: '90px',
                    flexShrink: 0,
                    borderRadius: '8px',
                    objectFit: 'cover',
                    background: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem'
                  }}>
                    {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} /> : getCatEmoji(p.category)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '4px' }}>{p.name}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--green)' }}>₹{Number(p.price).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textDecoration: 'line-through' }}>₹{orig.toLocaleString('en-IN')}</div>
                    <div style={{ height: '4px', background: 'var(--border)', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, var(--green), var(--cyan))', width: `${sold}%` }}></div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '4px' }}>{sold}% sold</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN LISTINGS */}
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>📦 All Listings</div>
      </div>
      <div style={{ padding: '12px 24px', fontSize: '0.8rem', color: 'var(--muted)' }}>
        {loading ? 'Loading…' : error ? 'Server offline' : `${filteredProducts.length} listing${filteredProducts.length !== 1 ? 's' : ''} found`}
      </div>

      <div style={{ padding: '0 24px 36px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '16px'
        }}>
          {loading ? (
            <div className="state-wrap"><div className="spinner"></div></div>
          ) : error ? (
            <div className="state-wrap"><div style={{ fontSize: '3rem' }}>⚠️</div><p>{error}</p></div>
          ) : filteredProducts.length === 0 ? (
            <div className="state-wrap"><div style={{ fontSize: '3rem' }}>📦</div><p>No listings found. Be the first to sell!</p></div>
          ) : (
            filteredProducts.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="state-wrap"><div className="spinner"></div></div>}>
      <HomeContent />
    </Suspense>
  );
}
