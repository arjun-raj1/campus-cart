export default function Footer() {
  return (
    <footer style={{
      background: 'var(--navy)',
      borderTop: '1px solid var(--border)',
      padding: '32px 24px',
      textAlign: 'center',
      color: 'var(--muted)',
      fontSize: '0.8rem',
      marginTop: '24px'
    }}>
      <strong style={{ color: 'var(--text)' }}>🛒 Campus Cart</strong><br />
      The BTech Student Marketplace · Reduce · Reuse · Save Money
    </footer>
  );
}
