'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      
      if (data.success) {
        login(data.user, data.token);
        router.push('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '70vh',
      padding: '20px'
    }}>
      <form onSubmit={handleLogin} style={{
        background: 'var(--surface)',
        padding: '40px',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h1 style={{ margin: 0, textAlign: 'center', color: 'var(--text)' }}>Welcome Back</h1>
        
        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)' }}>Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--input-bg)',
              color: 'var(--text)'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)' }}>Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--input-bg)',
              color: 'var(--text)'
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            background: 'var(--accent)',
            color: '#000',
            padding: '14px',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginTop: '10px'
          }}
        >
          {loading ? 'Logging in...' : 'Login / Register'}
        </button>
      </form>
    </div>
  );
}
