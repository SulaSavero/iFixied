'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Username atau password salah. (Untuk member: gunakan No. HP sebagai user & pass)');
        setLoading(false);
      }
    } catch (err) {
      console.error('Gagal login:', err);
      setError('Terjadi kesalahan. Coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f2f7] px-4 relative overflow-hidden">
      <div className="ios-blob w-[380px] h-[380px] bg-blue-400 -top-24 -left-24" />
      <div className="ios-blob delay-2 w-[340px] h-[340px] bg-purple-300 bottom-0 -right-24" />
      <div className="ios-blob delay-3 w-[280px] h-[280px] bg-amber-200 top-1/2 left-1/2" />

      <div className="animate-pop glass-card max-w-md w-full p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">sFixied</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
            <input
              type="text"
              className="ios-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              className="ios-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center flex disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>

          <div className="pt-4 border-t border-slate-200/60 text-center">
            <a href="/scan" className="text-blue-600 font-medium text-sm hover:underline">
              Cek Status Gadaian (Scan QR)
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}