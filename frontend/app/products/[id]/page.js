'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchProduct, fetchProducts, deleteProduct, placeOrder } from '../../../lib/api';
import ProductCard from '../../../components/ProductCard';
import TrustBadge from '../../../components/TrustBadge';
import { useAuth } from '../../../context/AuthContext';

export default function ProductPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showDelModal, setShowDelModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [orderForm, setOrderForm] = useState({
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    note: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const p = await fetchProduct(id);
        setProduct(p);
        
        try {
          const all = await fetchProducts(p.category);
          setRelated(all.filter(item => item._id !== id).slice(0, 6));
        } catch (e) {
          // ignore related err
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const catEmoji = (c) => {
    return { Mechanical: '⚙️', Electrical: '⚡', Electronics: '🔌', 'Study Materials': '📚', 'Safety Gear': '🦺' }[c] || '📦';
  };

  const timeAgo = (d) => {
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return ~~(s / 60) + 'm ago';
    if (s < 86400) return ~~(s / 3600) + 'h ago';
    return ~~(s / 86400) + 'd ago';
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(id);
      router.push('/');
    } catch (err) {
      alert('Delete failed. Try again.');
    }
  };

  const handleBuy = async () => {
    if (!orderForm.buyerName.trim()) return alert("Name required");
    if (!/^\d{10}$/.test(orderForm.buyerPhone.trim())) return alert("10-digit phone required");
    
    setIsSubmitting(true);
    try {
      const data = await placeOrder(id, orderForm);
      alert(product.listingType === 'rent' ? 'Rental Requested Successfully!' : 'Order Confirmed!');
      router.push(`/orders?phone=${orderForm.buyerPhone}`);
    } catch (err) {
      alert(err.message || 'Server error');
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="state-wrap"><div className="spinner"></div><span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Loading…</span></div>;
  if (error || !product) return <div className="state-wrap"><div style={{ fontSize: '3rem' }}>😞</div><p style={{ color: 'var(--muted)' }}>Product not found or server offline.</p><Link href="/" className="btn btn-primary">← Home</Link></div>;

  const isRent = product.listingType === 'rent';
  const price = Number(product.price) || 0;
  const deposit = Number(product.deposit) || 0;
  const pickupLocation = product.pickupLocation || 'Main Library Entrance';
  
  const orig = Math.round(price * 1.6);
  const disc = Math.round((1 - price / orig) * 100);
  const waMsg = encodeURIComponent(`Hi! I saw your ${isRent ? 'rental' : 'listing'} "${product.name}" on CampusCart. Is it still available?`);
  const waLink = product.phone ? `https://wa.me/91${product.phone}?text=${waMsg}` : null;

  return (
    <>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '16px 24px', fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link href="/" style={{ color: 'var(--accent)' }}>Home</Link> <span>›</span>
        <span>{product.category}</span> <span>›</span>
        <span style={{ color: 'var(--text)' }}>{product.name}</span>
      </div>

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }} className="product-page">
        {/* Left Column: Image */}
        <div className="img-panel">
          <div className="glass-card" style={{ padding: '8px' }}>
            {product.image ? (
              <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: '10px', aspectRatio: '1', objectFit: 'cover', background: 'var(--input-bg)' }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: '10px', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7rem' }}>
                {catEmoji(product.category)}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }} className="img-thumbs">
            <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: 'var(--surface)', border: '2px solid var(--accent)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', cursor: 'pointer' }}>{catEmoji(product.category)}</div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
              {catEmoji(product.category)} {product.category} {isRent ? '• RENTAL' : ''}
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', lineHeight: '1.2' }}>{product.name}</h1>
          </div>

          {/* Pricing Box */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--text)', lineHeight: '1' }}>
              ₹{price.toLocaleString('en-IN')} {isRent && <span style={{ fontSize: '1.2rem', color: 'var(--muted)', fontWeight: '600' }}>/ day</span>}
            </div>
            
            {!isRent && (
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', textDecoration: 'line-through', marginTop: '6px' }}>M.R.P ₹{orig.toLocaleString('en-IN')}</div>
            )}

            {isRent && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--yellow)' }}>Refundable Security Deposit</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)' }}>₹{deposit.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
          
          {/* Seller Card (Trust & Safety) */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>Seller Information</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '800', flexShrink: 0, color: '#fff' }}>
                {(product.seller || 'A')[0].toUpperCase()}
              </div>
              <div style={{ flex: '1' }}>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '4px' }}>{product.seller || 'Anonymous'}</div>
                <TrustBadge isVerified={true} score={4.8} />
              </div>
              <Link href="/profile" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>View Profile</Link>
            </div>
            <div style={{ display: 'flex', gap: '24px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <div><strong style={{ display: 'block', fontSize: '1.1rem' }}>24</strong><span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Transactions</span></div>
              <div><strong style={{ display: 'block', fontSize: '1.1rem' }}>100%</strong><span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Reliability</span></div>
            </div>
          </div>

          {/* Safe Pickup Details */}
          <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: '2rem' }}>📍</div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Campus Pickup Location</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text)', marginTop: '2px' }}>{pickupLocation}</div>
            </div>
          </div>

          {product.description && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', marginBottom: '12px' }}>Description</h4>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text)' }}>{product.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            {product.status === 'sold' ? (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--red)', padding: '16px', borderRadius: '12px', textAlign: 'center', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '1px' }}>UNAVAILABLE</div>
            ) : (
              <>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '16px', fontSize: '1.1rem', border: 'none', borderRadius: '12px', justifyContent: 'center', width: '100%' }} 
                  onClick={() => {
                    if (!user) {
                      router.push('/login');
                    } else {
                      setOrderForm(prev => ({ 
                        ...prev, 
                        buyerName: user.name || prev.buyerName, 
                        buyerEmail: user.email || prev.buyerEmail 
                      }));
                      setShowBuyModal(true);
                    }
                  }}
                >
                  {isRent ? 'Request Rental' : 'Buy Now Securely'}
                </button>
                {waLink && (
                  <a href={waLink} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'transparent', border: '2px solid #25d366', color: 'var(--text)', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', transition: 'all 0.2s' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>Ask a Question
                  </a>
                )}
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--red)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚠️ Report Issue
              </button>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowDelModal(true)}>
                🗑️ Remove (Seller Only)
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* BUY/RENT MODAL */}
      {showBuyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'var(--navy)', borderBottom: '1px solid var(--border)', padding: '24px 32px', color: '#fff', position: 'relative' }}>
              <h3 style={{ fontSize: '1.45rem', fontWeight: '900', marginBottom: '4px', letterSpacing: '-0.5px' }}>
                {isRent ? 'Confirm Rental Request' : 'Confirm Purchase'}
              </h3>
              <p style={{ fontSize: '0.85rem', fontWeight: '500', opacity: 0.9 }}>
                Pickup will be at: <strong>{pickupLocation}</strong>
              </p>
            </div>
            <div style={{ padding: '32px' }}>
              <div style={{ marginBottom: '18px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text)' }}>Your Name *</label>
                <input placeholder="e.g. Rahul Kumar" value={orderForm.buyerName} onChange={e => setOrderForm({...orderForm, buyerName: e.target.value})} style={{ width: '100%', padding: '12px 14px', background: 'var(--input-bg)', border: '1.5px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif" }} />
              </div>
              <div style={{ marginBottom: '18px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text)' }}>Phone Number *</label>
                <input type="tel" maxLength="10" placeholder="10-digit mobile number" value={orderForm.buyerPhone} onChange={e => setOrderForm({...orderForm, buyerPhone: e.target.value})} style={{ width: '100%', padding: '12px 14px', background: 'var(--input-bg)', border: '1.5px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif" }} />
              </div>
              
              {isRent && (
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.85rem', color: 'var(--yellow)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <strong>Note:</strong> You will need to pay the ₹{deposit} security deposit to the seller upon pickup.
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button className="btn btn-outline" style={{ flex: 1, padding: '14px', fontSize: '0.95rem', justifyContent: 'center', borderRadius: '10px' }} onClick={() => setShowBuyModal(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1, padding: '14px', fontSize: '0.95rem', justifyContent: 'center', borderRadius: '10px', border: 'none' }} onClick={handleBuy} disabled={isSubmitting}>
                  {isSubmitting ? 'Processing…' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEL MODAL */}
      {showDelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div className="glass-card" style={{ padding: '32px', maxWidth: '380px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>Delete Product?</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '20px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setShowDelModal(false)}>Cancel</button>
              <button className="btn" style={{ background: 'var(--red)', color: 'white', border: 'none' }} onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
