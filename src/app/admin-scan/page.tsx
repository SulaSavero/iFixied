'use client';

import { useEffect, useState } from 'react';
import AdminScanner from '@/components/AdminScanner';

export default function AdminScanPage() {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      window.location.href = '/login';
    } else {
      setAuthorized(true);
    }
  }, []);

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <AdminScanner />
    </div>
  );
}
