import Link from 'next/link';
import TrustBadge from './TrustBadge';

export default function ProductCard({ product, index }) {
  const isNew = index % 4 === 0;
  const isHot = index % 5 === 1;
  const isSale = index % 5 === 2;
  
  const orig = Math.round(product.price * 1.5);
  
  const getBadge = () => {
    if (isNew) return <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: '2', padding: '3px 9px', borderRadius: '4px', fontSize: '0.66rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', background: 'var(--accent)', color: 'white' }}>NEW</div>;
    if (isHot) return <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: '2', padding: '3px 9px', borderRadius: '4px', fontSize: '0.66rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', background: 'var(--red)', color: 'white' }}>HOT</div>;
    if (isSale) return <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: '2', padding: '3px 9px', borderRadius: '4px', fontSize: '0.66rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', background: 'var(--yellow)', color: '#000' }}>SALE</div>;
    return null;
  };
  
  const getCatEmoji = (cat) => {
    return {
      'Mechanical': '⚙️',
      'Electrical': '⚡',
      'Electronics': '🔌',
      'Study Materials': '📚',
      'Safety Gear': '🦺'
    }[cat] || '📦';
  };

  return (
    <Link href={`/products/${product._id}`} style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '0px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      textDecoration: 'none'
    }}>
      {getBadge()}
      
      {product.image ? (
        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy" 
          style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', background: '#12121f' }} 
        />
      ) : (
        <div style={{
          width: '100%',
          aspectRatio: '1',
          background: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3.5rem'
        }}>
          {getCatEmoji(product.category)}
        </div>
      )}
      
      <div style={{ padding: '14px', flex: '1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {product.category}
        </div>
        <div style={{ fontWeight: '700', fontSize: '1rem', lineHeight: '1.4' }}>
          {product.name}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>By {product.seller}</span>
          <TrustBadge isVerified={true} score={4.8} />
        </div>

        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text)', marginTop: 'auto' }}>
          ₹{Number(product.price).toLocaleString('en-IN')}
          <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--muted)', textDecoration: 'line-through', marginLeft: '6px' }}>
            ₹{orig.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
      
      <button style={{
        width: 'calc(100% - 28px)',
        margin: '0 14px 14px',
        background: 'var(--accent)',
        border: 'none',
        borderRadius: '8px',
        color: '#ffffff',
        padding: '10px',
        fontSize: '0.85rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 0.3s'
      }}>
        View Details
      </button>
    </Link>
  );
}
