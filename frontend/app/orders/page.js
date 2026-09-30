'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fetchOrders, cancelOrder } from '../../lib/api';

function OrdersContent() {
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';

  const [phone, setPhone] = useState(phoneParam);
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (phoneParam) {
      handleFetch(phoneParam);
    }
  }, [phoneParam]);

  const handleFetch = async (p) => {
    if (!/^\d{10}$/.test(p)) { alert('Enter a valid 10-digit phone number.'); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrders(p);
      setOrders(data);
    } catch (err) {
      setError('Cannot reach server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const doCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await cancelOrder(cancelTarget);
      setCancelTarget(null);
      handleFetch(phone);
    } catch (err) {
      alert('Cancel failed. Try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const timeAgo = (d) => {
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return ~~(s / 60) + 'm ago';
    if (s < 86400) return ~~(s / 3600) + 'h ago';
    return ~~(s / 86400) + 'd ago';
  };

  const catEmoji = (c) => {
    return { Mechanical: '⚙️', Electrical: '⚡', Electronics: '🔌', 'Study Materials': '📚', 'Safety Gear': '🦺' }[c] || '📦';
  };

  return (
    <>
      <div style={{ background: 'var(--hero-bg)', borderBottom: '1px solid var(--border)', padding: '48px 24px 36px', position: 'relative', overflow: 'hidden', transition: 'background 0.3s' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', position: 'relative', zIndex: 1, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}>
          🛒 My <span style={{ color: 'var(--text)', fontWeight: '300' }}>Orders</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: '12px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          Track all your purchases. Enter your phone number to view your orders.
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '28px auto', padding: '0 24px', display: 'flex', gap: '10px' }}>
        <input 
          type="tel" 
          placeholder="Enter your 10-digit phone number…" 
          maxLength="10"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={{ flex: 1, padding: '11px 16px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '9px', color: 'var(--text)', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", outline: 'none', transition: 'border 0.2s' }}
        />
        <button 
          onClick={() => handleFetch(phone)}
          style={{ padding: '11px 22px', borderRadius: '9px', background: 'linear-gradient(135deg, var(--accent), var(--blue))', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s' }}
        >
          View My Orders
        </button>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 64px' }}>
        {loading ? (
          <div className="state-wrap"><div className="spinner"></div></div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
            <p style={{ marginBottom: '20px' }}>{error}</p>
          </div>
        ) : orders && orders.length > 0 ? (
          <>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '4px', height: '20px', borderRadius: '4px', background: 'linear-gradient(180deg, var(--accent), var(--cyan))' }}></div>
              📦 {orders.length} Order{orders.length !== 1 ? 's' : ''} Found
            </div>
            {orders.map(o => {
              const sClass = o.status === 'confirmed' ? 's-confirmed' : o.status === 'completed' ? 's-completed' : 's-cancelled';
              const sLabel = o.status.charAt(0).toUpperCase() + o.status.slice(1);
              const waMsg = encodeURIComponent(`Hi ${o.seller}! I placed an order for "${o.productName}" (Order #${o._id}). Please confirm pickup details.`);
              const waLink = o.sellerPhone ? `https://wa.me/91${o.sellerPhone}?text=${waMsg}` : null;
              
              return (
                <div key={o._id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px', display: 'flex', gap: '20px', alignItems: 'flex-start', transition: 'all 0.3s' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '10px', flexShrink: 0, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', overflow: 'hidden' }}>
                    {o.productImage ? <img src={o.productImage} alt={o.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : catEmoji(o.category)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px' }}>{o.productName}</div>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 12px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.4px',
                        background: o.status === 'confirmed' ? 'rgba(0,194,255,0.12)' : o.status === 'completed' ? 'rgba(0,216,127,0.12)' : 'rgba(255,59,92,0.12)',
                        color: o.status === 'confirmed' ? 'var(--cyan)' : o.status === 'completed' ? 'var(--green)' : '#ff7090',
                        border: `1px solid ${o.status === 'confirmed' ? 'rgba(0,194,255,0.25)' : o.status === 'completed' ? 'rgba(0,216,127,0.25)' : 'rgba(255,59,92,0.25)'}`
                      }}>● {sLabel}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '10px' }}>
                      <span>🏷️ {o.category}</span>
                      <span>👤 Seller: {o.seller}</span>
                      <span>🕒 {timeAgo(o.orderedAt)}</span>
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--green)' }}>₹{Number(o.price).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontFamily: 'monospace', marginTop: '4px' }}>Order ID: {o._id}</div>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
                      {waLink && o.status === 'confirmed' && (
                        <a href={waLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#25d366', color: 'white', padding: '6px 14px', borderRadius: '7px', fontSize: '0.78rem', fontWeight: '700', transition: 'opacity 0.2s' }}>
                          💬 Contact Seller
                        </a>
                      )}
                      {o.status === 'confirmed' && (
                        <button onClick={() => setCancelTarget(o._id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '7px', background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.3)', color: '#ff7090', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
                          ✕ Cancel
                        </button>
                      )}
                      <Link href={`/products/${o.productId}`} className="btn-outline btn" style={{ fontSize: '0.78rem', padding: '6px 14px' }}>View Item</Link>
                    </div>
                    {o.note && <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--muted)' }}>📝 Note: {o.note}</div>}
                  </div>
                </div>
              );
            })}
          </>
        ) : orders && orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div>
            <p style={{ marginBottom: '20px' }}>No orders found for this number.</p>
            <Link href="/" className="btn btn-primary">Browse Marketplace</Link>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
            <p style={{ marginBottom: '20px' }}>Enter your phone number above to see your order history.</p>
            <Link href="/" className="btn btn-primary">Browse Marketplace</Link>
          </div>
        )}
      </div>

      {cancelTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', maxWidth: '380px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '8px' }}>❌ Cancel Order?</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '20px' }}>The item will be re-listed on the marketplace. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setCancelTarget(null)}>Keep Order</button>
              <button className="btn" style={{ background: 'var(--red)', color: 'white' }} onClick={doCancel} disabled={isCancelling}>
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Orders() {
  return (
    <Suspense fallback={<div className="state-wrap"><div className="spinner"></div></div>}>
      <OrdersContent />
    </Suspense>
  );
}
