'use client';

import { useEffect, useState } from 'react';
import PawnDashboard from '@/components/PawnDashboard';
import MemberDashboard from '@/components/MemberDashboard';

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    setRole(userRole);
  }, []);

  if (!role) return <div className="p-8 text-center">Checking access...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {role === 'admin' ? <PawnDashboard /> : <MemberDashboard />}
    </div>
  );
}
