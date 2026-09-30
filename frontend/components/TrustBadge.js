export default function TrustBadge({ isVerified, score }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      {isVerified && (
        <span className="badge-verified">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Verified Student
        </span>
      )}
      {score && (
        <span style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          padding: '4px 8px', borderRadius: '20px', fontSize: '0.75rem',
          fontWeight: '700', color: 'var(--yellow)'
        }}>
          ⭐️ {score.toFixed(1)}
        </span>
      )}
    </div>
  );
}
