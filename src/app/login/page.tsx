'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">sFixied</h1>
          <p className="text-slate-500 mt-2">Masuk ke sistem penggadaian (Offline Mode)</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <a 
              href="/scan"
              className="w-full flex items-center justify-center gap-2 text-blue-600 font-medium py-2 hover:underline transition-all"
            >
              Cek Status Gadaian (Scan QR)
            </a>
          </div>
        </form>
        
        <div className="mt-8 text-center">
           <p className="text-xs text-slate-400">Data disimpan secara lokal di browser/aplikasi ini.</p>
        </div>
      </div>
    </div>
  );
}
