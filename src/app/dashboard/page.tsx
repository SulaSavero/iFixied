import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import PawnDashboard from '@/components/PawnDashboard';
import MemberDashboard from '@/components/MemberDashboard';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {session.role === 'admin' ? <PawnDashboard /> : <MemberDashboard />}
    </div>
  );
}