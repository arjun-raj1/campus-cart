import Link from 'next/link';

export default function Topbar() {
  return (
    <div className="topbar" style={{
      background: 'var(--topbar-bg)',
      borderBottom: '1px solid var(--border)',
      padding: '6px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: 'var(--muted)',
      transition: 'background 0.3s'
    }}>
      <span>🎓 Free for BTech Students &nbsp;|&nbsp; <Link href="#">Register Now</Link></span>
      <span>📞 Support &nbsp;|&nbsp; <Link href="/sell">Sell</Link> &nbsp;|&nbsp; <Link href="#">FAQs</Link></span>
    </div>
  );
}
