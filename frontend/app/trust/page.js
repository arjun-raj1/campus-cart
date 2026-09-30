'use client';
import Link from 'next/link';

export default function TrustPage() {
  return (
    <>
      <div style={{
        background: 'var(--hero-bg)', borderBottom: '1px solid var(--border)',
        padding: '60px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        color: '#fff'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛡️</div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
          Trust & Safety
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          CampusCart is a verified marketplace exclusively for students. We've built an ecosystem where you can buy, sell, and rent with complete peace of mind.
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '64px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* Section 1 */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text)' }}>
              1. Verified Campus Identities ✅
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: '1.6' }}>
              We don't allow just anyone on CampusCart. Every single user is verified using their official college email or Student ID. When you see the <strong>Verified Student</strong> badge, you know you're dealing with a peer.
            </p>
          </div>
          <div className="glass-card" style={{ flex: '1', padding: '24px', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🎓</div>
            <div style={{ fontWeight: '800', color: 'var(--accent)', fontSize: '1.2rem' }}>Only College Students</div>
          </div>
        </div>

        {/* Section 2 */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', flexDirection: 'row-reverse' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text)' }}>
              2. Student Reputation System ⭐️
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: '1.6' }}>
              Our transparent reputation dashboard shows you exactly who you are dealing with. Check a user's transaction history, active rentals, and average rating before ever agreeing to a meetup. Bad actors are swiftly removed.
            </p>
          </div>
          <div className="glass-card" style={{ flex: '1', padding: '24px', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '12px' }}>📊</div>
            <div style={{ fontWeight: '800', color: 'var(--blue)', fontSize: '1.2rem' }}>Transparent History</div>
          </div>
        </div>

        {/* Section 3 */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text)' }}>
              3. Secure Campus Pickup Zones 📍
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: '1.6' }}>
              Never meet strangers in weird places. We've defined safe, well-lit, and CCTV-monitored handover locations around the campus (like the Main Library or Student Center) to ensure every transaction is secure.
            </p>
          </div>
          <div className="glass-card" style={{ flex: '1', padding: '24px', background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🏫</div>
            <div style={{ fontWeight: '800', color: 'var(--yellow)', fontSize: '1.2rem' }}>Safe Meetups</div>
          </div>
        </div>

        {/* Section 4 */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', flexDirection: 'row-reverse' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text)' }}>
              4. Rental Protection & Disputes ⚖️
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: '1.6' }}>
              Renting out your expensive calculator? We support <strong>Refundable Security Deposits</strong> to protect your items. If anything goes wrong—like a damaged item or a no-show—our active admin moderation team is one click away via the <strong>Report Issue</strong> button.
            </p>
          </div>
          <div className="glass-card" style={{ flex: '1', padding: '24px', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🚨</div>
            <div style={{ fontWeight: '800', color: 'var(--red)', fontSize: '1.2rem' }}>Active Moderation</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '64px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px' }}>Ready to join the safest student marketplace?</h3>
          <Link href="/" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            Start Exploring CampusCart
          </Link>
        </div>

      </div>
    </>
  );
}
