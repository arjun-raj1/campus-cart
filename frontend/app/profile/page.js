'use client';
import { useState, useEffect } from 'react';
import TrustBadge from '../../components/TrustBadge';
import Link from 'next/link';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);

  // Mocking the data until backend endpoints are ready and tables are populated
  const mockUser = {
    name: "Alex Doe",
    department: "Computer Science",
    year: "Senior",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex",
    isVerified: true,
    memberSince: "Aug 2023",
    reputation: 4.8,
    stats: {
      sold: 12,
      rented: 5,
      reliability: "98%"
    },
    reviews: [
      { id: 1, name: "Jordan M.", rating: 5, text: "Calculus textbook was in perfect condition. Fast meetup at the library!", date: "2 weeks ago" },
      { id: 2, name: "Taylor K.", rating: 4, text: "Good seller, but was a few mins late to the canteen.", date: "1 month ago" }
    ]
  };

  useEffect(() => {
    // Simulate data fetch
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return <div className="state-wrap"><div className="spinner"></div><p>Loading Profile...</p></div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 24px' }}>
      
      {/* Profile Header Card */}
      <div className="glass-card" style={{ padding: '32px', display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '32px' }}>
        <img 
          src={mockUser.avatar} 
          alt="Avatar" 
          style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--border)' }}
        />
        <div style={{ flex: '1', minWidth: '250px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {mockUser.name}
          </h1>
          <div style={{ marginBottom: '16px' }}>
            <TrustBadge isVerified={mockUser.isVerified} score={mockUser.reputation} />
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            <strong>Department:</strong> {mockUser.department} <br/>
            <strong>Year:</strong> {mockUser.year} <br/>
            <strong>Member Since:</strong> {mockUser.memberSince}
          </p>
        </div>
        
        <div style={{ background: 'var(--bg)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center', minWidth: '150px' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent)' }}>{mockUser.stats.reliability}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Reliability Score</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        
        {/* Left Column */}
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            Transaction History
          </h2>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            <div className="glass-card" style={{ flex: '1', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{mockUser.stats.sold}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Items Sold</div>
            </div>
            <div className="glass-card" style={{ flex: '1', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{mockUser.stats.rented}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Active Rentals</div>
            </div>
          </div>

          <Link href="/sell" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            List a New Item
          </Link>
        </div>

        {/* Right Column */}
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            Recent Reviews
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mockUser.reviews.map(r => (
              <div key={r.id} className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{r.name}</strong>
                  <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{r.date}</span>
                </div>
                <div style={{ color: 'var(--yellow)', fontSize: '0.8rem', marginBottom: '8px' }}>
                  {'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: '1.5' }}>"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
