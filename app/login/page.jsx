'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import Header from '@/components/Header';
import { Shield, User, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || t('invalidCredentials'));
    }

    setLoading(false);
  };

  return (
    <>
      <Header />
      <main className="container" style={{
        padding: '60px 24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
      }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #b8c0c8 0%, #d0d8e0 100%)',
              borderRadius: '50%',
              width: '64px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 15px rgba(184, 192, 200, 0.3)',
            }}>
              <Shield size={32} color="#1a1a1a" />
            </div>
            <h2 style={{ margin: 0 }}>{t('adminLogin')}</h2>
            <p style={{ color: '#a0a8b0', marginTop: '8px' }}>
              {t('enterCredentials')}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label><User size={14} style={{ marginRight: '8px' }} />{t('username')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('username')}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label><Lock size={14} style={{ marginRight: '8px' }} />{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password')}
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(255, 68, 68, 0.1)',
                border: '1px solid rgba(255, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                color: '#ff4444',
                fontSize: '0.9rem',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-search"
              disabled={loading}
            >
              {loading ? t('loggingIn') : t('login')}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

