'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [theme, setTheme] = useState('dark');
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    const t = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(t);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav style={{
      background: 'var(--navy)',
      borderBottom: '1px solid var(--border)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap',
      position: 'sticky',
      top: '0',
      zIndex: '200',
      transition: 'background 0.3s'
    }}>
      <Link href="/" style={{
        fontSize: '1.45rem',
        fontWeight: '900',
        letterSpacing: '2px',
        whiteSpace: 'nowrap',
        color: 'var(--text)',
        textTransform: 'uppercase',
        flexShrink: '0'
      }}>
        🛒 Campus <span style={{ fontWeight: '300', opacity: '0.7' }}>Cart</span>
      </Link>
      
      <form onSubmit={handleSearch} style={{
        flex: '1',
        display: 'flex',
        maxWidth: '500px',
        background: 'var(--surface)',
        border: '2px solid var(--border)',
        borderRadius: '10px',
        overflow: 'hidden',
        transition: 'all 0.3s'
      }}>
        <input 
          type="text" 
          placeholder="Search lab coats, safety boots, circuit kits…" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: '1',
            padding: '10px 16px',
            background: 'var(--input-bg)',
            border: 'none',
            outline: 'none',
            color: 'var(--text)',
            fontSize: '0.9rem',
            fontFamily: "'Inter', sans-serif"
          }}
        />
        <button type="submit" style={{
          background: 'var(--accent)',
          border: 'none',
          padding: '0 20px',
          cursor: 'pointer',
          color: '#000',
          fontWeight: '800',
          fontSize: '0.9rem',
          transition: 'background 0.2s'
        }}>Search</button>
      </form>
      
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        marginLeft: 'auto',
        flexShrink: '0'
      }}>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          title="Toggle Dark/Light Mode"
        >
          {theme === 'light' ? '☀️' : '🌙'}
        </button>
        <Link href="/trust" className="btn btn-outline" style={{ border: 'none', color: 'var(--accent)' }}>🛡️ Trust & Safety</Link>
        
        {!loading && (
          <>
            {user ? (
              <>
                <Link href="/profile" className="btn btn-outline" style={{ border: 'none' }}>🎓 {user.name || 'Profile'}</Link>
                <Link href="/orders" className="btn btn-outline">My Orders</Link>
                <Link href="/sell" className="btn btn-primary">+ List Item</Link>
                <button onClick={handleLogout} className="btn btn-outline" style={{ border: 'none', color: '#ff6b6b' }}>Logout</button>
              </>
            ) : (
              <Link href="/login" className="btn btn-outline" style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}>Login</Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
