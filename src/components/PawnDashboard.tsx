'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  QrCode, Edit, Trash2, Plus, LogOut, Search, Download,
  Smartphone, TrendingUp, Users, Star, LayoutDashboard,
  Menu, X, PieChart, Calendar, DollarSign, Wallet, Save, Package,
  Settings, Lock, Store, Percent, Gift, Database, Upload, Trash, Eye, EyeOff,
  ScanLine
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Pawn {
  id: number; date: string; name: string; phoneBrand: string;
  loanAmount: string; interestReduction: string; penalty: string;
  accessCode: string; status: string; createdAt: number; memberId?: string;
}
interface Member {
  id: string; name: string; phone: string; points: number; password?: string;
}

export default function PawnDashboard() {
  const [pawns, setPawns] = useState<Pawn[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'pawns' | 'members' | 'settings'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPawn, setSelectedPawn] = useState<Pawn | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const emptyPawnForm = { date: new Date().toISOString().split('T')[0], name: '', phoneBrand: '', loanAmount: '', interestReduction: '0', penalty: '0', memberId: '', status: 'active' };
  const emptyMemberForm = { name: '', phone: '', points: 0, password: '' };
  const [formData, setFormData] = useState(emptyPawnForm);
  const [memberForm, setMemberForm] = useState(emptyMemberForm);

  // Settings state
  const [showPassword, setShowPassword] = useState(false);
  const [settingsData, setSettingsData] = useState({
    adminPassword: 'sula7852',
    storeName: 'sFixied',
    storeAddress: '',
    storePhone: '',
    interestRate: '10',
    pointsPerLoan: '2',
    pointLoanThreshold: '100000',
    pointValue: '1000',
  });

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) { window.location.href = '/login'; return; }
    fetch('/api/pawns')
      .then(res => res.json())
      .then((data: Pawn[]) => setPawns(data.map((pawn) => ({ ...pawn, status: pawn.status || 'active' }))))
      .catch(err => console.error('Gagal ambil data pawns:', err));
    fetch('/api/members')
  .then(res => res.json())
  .then((data: Member[]) => setMembers(data))
  .catch(err => console.error('Gagal ambil data members:', err));
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) setSettingsData(JSON.parse(savedSettings));
    setLoading(false);
  }, []);


 const savePawn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (selectedPawn) {
        const res = await fetch('/api/pawns', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedPawn.id, ...formData }),
        });
        const updated = await res.json();
        setPawns(pawns.map(p => p.id === selectedPawn.id ? updated : p));
      } else {
        const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const res = await fetch('/api/pawns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, accessCode }),
        });
        const newPawn = await res.json();
        if (formData.memberId) {
  const pts = Math.floor(parseFloat(formData.loanAmount) / 100000);
  if (pts > 0) {
    const targetMember = members.find(m => m.id === formData.memberId);
    if (targetMember) {
      const memberRes = await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetMember.id, points: (targetMember.points || 0) + pts }),
      });
      const updatedMember = await memberRes.json();
      setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m));
    }
  }
}
        setPawns([newPawn, ...pawns]);
      }
    } catch (err) {
      console.error('Gagal menyimpan data pawn:', err);
      setIsSaving(false);
      alert('Gagal menyimpan data. Coba lagi.');
    }
    setIsSaving(false);
    setIsModalOpen(false); setSelectedPawn(null); setFormData(emptyPawnForm);
  };

  const saveMember = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    if (selectedMember) {
      const res = await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedMember.id, ...memberForm }),
      });
      const updated = await res.json();
      setMembers(members.map(m => m.id === selectedMember.id ? updated : m));
    } else {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'M-' + Date.now().toString().slice(-6), ...memberForm }),
      });
      const newMember = await res.json();
      setMembers([...members, newMember]);
    }
    setIsMemberModalOpen(false); setSelectedMember(null); setMemberForm(emptyMemberForm);
  } catch (err) {
    console.error('Gagal simpan member:', err);
    alert('Gagal menyimpan data. Coba lagi.');
  }
};

  const togglePawnStatus = async (id: number) => {
    const pawn = pawns.find(p => p.id === id);
    if (!pawn) return;
    const newStatus = pawn.status === 'redeemed' ? 'active' : 'redeemed';
    try {
      const res = await fetch('/api/pawns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const updated = await res.json();
      setPawns(pawns.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      console.error('Gagal update status:', err);
      alert('Gagal update status. Coba lagi.');
    }
  };

  const interestRate = parseFloat(settingsData.interestRate) / 100;
  const total = (p: Pawn) => parseFloat(p.loanAmount) * (1 + interestRate) - parseFloat(p.interestReduction) + parseFloat(p.penalty);

  const saveSettings = () => {
    localStorage.setItem('app_settings', JSON.stringify(settingsData));
    alert('Pengaturan berhasil disimpan!');
  };

  const exportAllData = () => {
    const data = {
      pawns: localStorage.getItem('pawns_data'),
      members: localStorage.getItem('members_data'),
      settings: localStorage.getItem('app_settings'),
      redemptions: localStorage.getItem('redemptions_data'),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_gadaimart_${format(new Date(), 'yyyyMMdd_HHmmss')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.pawns) localStorage.setItem('pawns_data', data.pawns);
        if (data.members) localStorage.setItem('members_data', data.members);
        if (data.settings) localStorage.setItem('app_settings', data.settings);
        if (data.redemptions) localStorage.setItem('redemptions_data', data.redemptions);
        alert('Data berhasil diimpor! Halaman akan dimuat ulang.');
        window.location.reload();
      } catch (err) {
        alert('File tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('PERINGATAN: Semua data akan dihapus permanen! Lanjutkan?')) {
      if (confirm('Anda yakin? Tindakan ini tidak bisa dibatalkan!')) {
        localStorage.removeItem('pawns_data');
        localStorage.removeItem('members_data');
        localStorage.removeItem('redemptions_data');
        alert('Semua data telah dihapus. Halaman akan dimuat ulang.');
        window.location.reload();
      }
    }
  };

  const exportCSV = () => {
    const h = 'No,Tanggal,Nama,Gadget,Pinjaman,Pot Bunga,Denda,Total,Status';
    const r = pawns.map((p, i) => `${i+1},${p.date},${p.name},${p.phoneBrand},${p.loanAmount},${p.interestReduction},${p.penalty},${total(p)},${p.status === 'redeemed' ? 'Sudah Ditebus' : 'Aktif'}`);
    const a = document.createElement('a');
    a.href = encodeURI('data:text/csv;charset=utf-8,' + [h, ...r].join('\n'));
    a.download = `laporan_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  const now = new Date();
  const mStart = startOfMonth(now);
  const mEnd = endOfMonth(now);
  const mPawns = pawns.filter(p => isWithinInterval(new Date(p.date), { start: mStart, end: mEnd }));
  const mLoan = mPawns.reduce((a, p) => a + parseFloat(p.loanAmount), 0);
  const mProfit = mPawns.reduce((a, p) => a + parseFloat(p.loanAmount) * 0.1, 0);
  const mPenalty = mPawns.reduce((a, p) => a + parseFloat(p.penalty), 0);
  const mReduction = mPawns.reduce((a, p) => a + parseFloat(p.interestReduction), 0);
  const mNet = mProfit + mPenalty - mReduction;

  const fPawns = pawns.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.phoneBrand.toLowerCase().includes(search.toLowerCase()));
  const fMembers = members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search));

  const navTo = (tab: typeof activeTab) => { setActiveTab(tab); setSidebarOpen(false); setSearch(''); };

  const SidebarLink = ({ id, label, icon: Icon }: { id: typeof activeTab; label: string; icon: any }) => (
    <button 
      onClick={() => navTo(id)} 
      title={label}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'} ${sidebarCollapsed ? 'md:justify-center' : ''}`}
    >
      <Icon size={18} className="flex-shrink-0" />
      <span className={`truncate ${sidebarCollapsed ? 'md:hidden' : ''}`}>{label}</span>
    </button>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-100 flex flex-col
        transition-all duration-300 ease-out
        md:static md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'md:w-[68px]' : 'md:w-60'}
        w-60
      `}>
        {/* Logo */}
        <div className={`flex items-center border-b border-slate-50 h-14 shrink-0 ${sidebarCollapsed ? 'justify-center px-2' : 'px-5 justify-between'}`}>
          {sidebarCollapsed ? (
            <div className="bg-blue-600 p-1.5 rounded-lg"><Smartphone className="text-white" size={18} /></div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg"><Smartphone className="text-white" size={18} /></div>
              <span className="font-black text-slate-800 text-sm">sFixied</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 p-1"><X size={20} /></button>
        </div>

        {/* Nav */}
        <nav className={`flex-1 space-y-1 overflow-y-auto ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
          <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 ${sidebarCollapsed ? 'md:hidden' : ''}`}>Menu</p>
          <SidebarLink id="overview" label="Dashboard" icon={LayoutDashboard} />
          <SidebarLink id="pawns" label="Data Gadaian" icon={Wallet} />
          <SidebarLink id="members" label="Kelola Member" icon={Users} />
          <SidebarLink id="settings" label="Pengaturan" icon={Settings} />
          <div className="pt-4 mt-4 border-t border-slate-100">
            <a 
              href="/admin-scan"
              title="Scan & Tebus"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all mb-1 ${sidebarCollapsed ? 'md:justify-center' : ''}`}
            >
              <ScanLine size={18} className="flex-shrink-0" />
              <span className={`truncate ${sidebarCollapsed ? 'md:hidden' : ''}`}>Scan & Tebus</span>
            </a>
            <button 
              onClick={exportCSV} 
              title="Download CSV"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all ${sidebarCollapsed ? 'md:justify-center' : ''}`}
            >
              <Download size={18} className="flex-shrink-0" />
              <span className={`truncate ${sidebarCollapsed ? 'md:hidden' : ''}`}>Download CSV</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className={`border-t border-slate-100 ${sidebarCollapsed ? 'md:p-2 p-4' : 'p-4'}`}>
          <div className={`flex items-center gap-3 mb-3 ${sidebarCollapsed ? 'md:justify-center' : ''}`}>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-xs">A</div>
            <div className={`${sidebarCollapsed ? 'md:hidden' : ''}`}><p className="text-xs font-bold text-slate-800">Admin</p><p className="text-[10px] text-slate-400">Online</p></div>
          </div>
          <button onClick={async () => { await fetch('/api/logout', { method: 'POST' }); localStorage.clear(); window.location.href = '/login'; }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 text-sm font-semibold ${sidebarCollapsed ? 'md:justify-center' : ''}`}>
            <LogOut size={16} className="flex-shrink-0" />
            <span className={`${sidebarCollapsed ? 'md:hidden' : ''}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-100 px-4 h-14 flex items-center gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg md:hidden"><Menu size={20} /></button>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg hidden md:flex"><Menu size={20} /></button>
          <span className="text-sm font-bold text-slate-800 capitalize">{activeTab === 'overview' ? 'Dashboard' : activeTab === 'pawns' ? 'Data Gadaian' : activeTab === 'members' ? 'Kelola Member' : 'Pengaturan'}</span>
          <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full hidden sm:block">{format(now, 'dd MMM yyyy')}</span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

          {/* === DASHBOARD === */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900">Dashboard Bulan {format(now, 'MMMM yyyy')}</h1>
                <p className="text-slate-400 text-xs">Ringkasan performa penggadaian bulan ini</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: 'Pinjaman', value: `Rp ${mLoan.toLocaleString()}`, icon: DollarSign, color: 'blue' },
                  { label: 'Laba Bersih', value: `Rp ${mNet.toLocaleString()}`, icon: TrendingUp, color: 'emerald' },
                  { label: 'Item Masuk', value: `${mPawns.length} Unit`, icon: Smartphone, color: 'indigo' },
                  { label: 'Member', value: `${members.length} Orang`, icon: Users, color: 'amber' },
                ].map((c, i) => (
                  <div key={i} className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className={`bg-${c.color}-100 w-9 h-9 rounded-xl flex items-center justify-center text-${c.color}-600 mb-3`}>
                      <c.icon size={18} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.label}</p>
                    <p className="text-base md:text-lg font-black text-slate-900 mt-1 truncate">{c.value}</p>
                  </div>
                ))}
              </div>

              {/* Profit Breakdown + Recent */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-slate-900 p-2.5 rounded-xl text-white"><PieChart size={20} /></div>
                    <h4 className="text-base md:text-lg font-black text-slate-900">Rincian Laba</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs font-semibold text-slate-600">Bunga 10%</span>
                      <span className="text-sm font-black text-emerald-600">+ Rp {mProfit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs font-semibold text-slate-600">Denda</span>
                      <span className="text-sm font-black text-emerald-600">+ Rp {mPenalty.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="text-xs font-semibold text-slate-600">Potongan</span>
                      <span className="text-sm font-black text-red-500">- Rp {mReduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-600 text-white rounded-2xl mt-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Total Bersih</span>
                      <span className="text-xl font-black">Rp {mNet.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 p-2.5 rounded-xl text-white"><Calendar size={20} /></div>
                      <h4 className="text-base md:text-lg font-black text-slate-900">Transaksi Terbaru</h4>
                    </div>
                    <button onClick={() => navTo('pawns')} className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline">Semua</button>
                  </div>
                  <div className="space-y-2">
                    {pawns.length === 0 && (
                      <div className="text-center py-10">
                        <Package className="mx-auto text-slate-200 mb-3" size={40} />
                        <p className="text-xs text-slate-400 font-semibold">Belum ada transaksi</p>
                      </div>
                    )}
                    {pawns.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="bg-slate-100 w-9 h-9 rounded-lg flex items-center justify-center text-slate-400"><Smartphone size={16} /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{p.phoneBrand}</p>
                          <p className="text-[10px] text-slate-400">{p.name} • {p.date}</p>
                        </div>
                        <p className="text-xs font-black text-slate-800 whitespace-nowrap">Rp {parseFloat(p.loanAmount).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === DATA GADAIAN === */}
          {activeTab === 'pawns' && (
            <div className="max-w-6xl mx-auto space-y-3 md:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h1 className="text-lg md:text-2xl font-black text-slate-900">Data Gadaian</h1>
                <button onClick={() => { setSelectedPawn(null); setFormData(emptyPawnForm); setIsModalOpen(true); }} className="btn-primary flex items-center justify-center gap-1.5 text-xs md:text-sm py-2.5 md:py-3">
                  <Plus size={16} /> Tambah
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-2.5 md:p-4 border-b border-slate-50">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input type="text" placeholder="Cari nama atau gadget..." className="w-full pl-7 pr-3 py-1.5 md:py-2 bg-slate-50 rounded-xl text-[10px] md:text-sm outline-none focus:ring-2 focus:ring-blue-500" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                </div>
                <div className="md:hidden p-2.5 space-y-2.5 bg-slate-50/40">
                  {fPawns.length === 0 && (
                    <div className="rounded-xl bg-white border border-slate-100 p-6 text-center text-[11px] text-slate-400">
                      Tidak ada data
                    </div>
                  )}
                  {fPawns.map((p) => (
                    <div key={p.id} className="rounded-xl bg-white border border-slate-100 p-3 shadow-sm space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-slate-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{p.phoneBrand}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-bold whitespace-nowrap ${p.status === 'redeemed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {p.status === 'redeemed' ? 'Ditebus' : 'Aktif'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] leading-tight">
                        <div>
                          <p className="text-slate-400 font-semibold uppercase">Tanggal</p>
                          <p className="text-slate-700 font-bold">{p.date}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase">Pinjaman</p>
                          <p className="text-slate-700 font-bold">Rp {parseFloat(p.loanAmount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase">Total</p>
                          <p className="text-blue-600 font-black">Rp {total(p).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase">Penebusan</p>
                          <button
                            onClick={() => togglePawnStatus(p.id)}
                            className={`mt-0.5 rounded-md px-2 py-1 text-[9px] font-bold whitespace-nowrap transition-colors ${p.status === 'redeemed' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                          >
                            {p.status === 'redeemed' ? 'Set Aktif' : 'Tandai Tebus'}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-50">
                        <div className="flex gap-1.5">
                          <button onClick={() => { setSelectedPawn(p); setIsQRModalOpen(true); }} className="p-1.5 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"><QrCode size={13} /></button>
                          <button onClick={() => { setSelectedPawn(p); setFormData({ date: p.date, name: p.name, phoneBrand: p.phoneBrand, loanAmount: p.loanAmount, interestReduction: p.interestReduction, penalty: p.penalty, memberId: p.memberId || '', status: p.status || 'active' }); setIsModalOpen(true); }} className="p-1.5 text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100"><Edit size={13} /></button>
                          <button onClick={async () => { 
                            if (!confirm('Hapus data ini?')) return;  
                            await fetch('/api/pawns', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id }) });  
                            setPawns(pawns.filter(x => x.id !== p.id)); 
                            }} className="p-1.5 text-red-600 bg-red-50 rounded-md hover:bg-red-100"><Trash2 size={13} /></button>
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium">{p.accessCode}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block overflow-x-auto touch-pan-x [scrollbar-width:thin]">
                  <table className="min-w-[760px] w-full text-[9px] md:text-sm leading-tight">
                    <thead><tr className="bg-slate-50 text-slate-500 text-[8px] md:text-xs">
                      <th className="text-left px-1.5 py-2 md:p-3 font-semibold whitespace-nowrap">Tgl</th>
                      <th className="text-left px-1.5 py-2 md:p-3 font-semibold whitespace-nowrap">Nama</th>
                      <th className="text-left px-1.5 py-2 md:p-3 font-semibold whitespace-nowrap">Gadget</th>
                      <th className="text-left px-1.5 py-2 md:p-3 font-semibold whitespace-nowrap">Pinjaman</th>
                      <th className="text-left px-1.5 py-2 md:p-3 font-semibold whitespace-nowrap">Total</th>
                      <th className="text-left px-1.5 py-2 md:p-3 font-semibold whitespace-nowrap">Status</th>
                      <th className="text-left px-1.5 py-2 md:p-3 font-semibold whitespace-nowrap">Penebusan</th>
                      <th className="text-left px-1.5 py-2 md:p-3 font-semibold whitespace-nowrap">Aksi</th>
                    </tr></thead>
                    <tbody>
                      {fPawns.map((p, index) => (
                        <tr key={p.id} className={`border-t border-slate-50 hover:bg-slate-50/60 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                          <td className="px-1.5 py-2 md:p-3 whitespace-nowrap text-[8px] md:text-xs text-slate-500">{p.date}</td>
                          <td className="px-1.5 py-2 md:p-3 font-bold text-slate-800 text-[9px] md:text-xs whitespace-nowrap">{p.name}</td>
                          <td className="px-1.5 py-2 md:p-3 text-[8px] md:text-xs text-slate-600 whitespace-nowrap">{p.phoneBrand}</td>
                          <td className="px-1.5 py-2 md:p-3 text-[8px] md:text-xs font-semibold whitespace-nowrap">Rp {parseFloat(p.loanAmount).toLocaleString()}</td>
                          <td className="px-1.5 py-2 md:p-3 text-[8px] md:text-xs font-black text-blue-600 whitespace-nowrap">Rp {total(p).toLocaleString()}</td>
                          <td className="px-1.5 py-2 md:p-3 whitespace-nowrap">
                            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[7px] md:text-[10px] font-bold whitespace-nowrap ${p.status === 'redeemed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {p.status === 'redeemed' ? 'Sudah Ditebus' : 'Aktif'}
                            </span>
                          </td>
                          <td className="px-1.5 py-2 md:p-3 whitespace-nowrap">
                            <button
                              onClick={() => togglePawnStatus(p.id)}
                              className={`rounded-md px-1.5 py-0.5 text-[7px] md:text-[10px] font-bold whitespace-nowrap transition-colors ${p.status === 'redeemed' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                            >
                              {p.status === 'redeemed' ? 'Set Aktif' : 'Tandai Tebus'}
                            </button>
                          </td>
                          <td className="px-1.5 py-2 md:p-3 whitespace-nowrap">
                            <div className="flex gap-0.5 md:gap-1">
                              <button onClick={() => { setSelectedPawn(p); setIsQRModalOpen(true); }} className="p-0.5 md:p-1 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"><QrCode size={12} /></button>
                              <button onClick={() => { setSelectedPawn(p); setFormData({ date: p.date, name: p.name, phoneBrand: p.phoneBrand, loanAmount: p.loanAmount, interestReduction: p.interestReduction, penalty: p.penalty, memberId: p.memberId || '', status: p.status || 'active' }); setIsModalOpen(true); }} className="p-0.5 md:p-1 text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100"><Edit size={12} /></button>
                              <button onClick={async () => {  
                                if (!confirm('Hapus data ini?')) return;  
                                await fetch('/api/pawns', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id }) });  
                                setPawns(pawns.filter(x => x.id !== p.id));
                                }} className="p-0.5 md:p-1 text-red-600 bg-red-50 rounded-md hover:bg-red-100"><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {fPawns.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-slate-400 text-xs">Tidak ada data</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* === KELOLA MEMBER === */}
          {activeTab === 'members' && (
            <div className="max-w-6xl mx-auto space-y-3 md:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h1 className="text-lg md:text-2xl font-black text-slate-900">Kelola Member</h1>
                <button onClick={() => { setSelectedMember(null); setMemberForm(emptyMemberForm); setIsMemberModalOpen(true); }} className="btn-primary flex items-center justify-center gap-1.5 text-xs md:text-sm py-2.5 md:py-3">
                  <Users size={16} /> Tambah Member
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-3 md:p-4 border-b border-slate-50">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input type="text" placeholder="Cari member..." className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl text-[11px] md:text-sm outline-none focus:ring-2 focus:ring-blue-500" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                </div>
                <div className="px-3 py-1.5 text-[9px] text-slate-400 border-b border-slate-50 md:hidden">
                  Geser tabel ke kiri / kanan untuk melihat semua data.
                </div>
                <div className="overflow-x-auto touch-pan-x [scrollbar-width:thin]">
                  <table className="min-w-[600px] w-full text-[10px] md:text-sm">
                    <thead><tr className="bg-slate-50 text-slate-500 text-[9px] md:text-xs">
                      <th className="text-left p-2 md:p-3 font-semibold whitespace-nowrap">ID</th>
                      <th className="text-left p-2 md:p-3 font-semibold whitespace-nowrap">Nama</th>
                      <th className="text-left p-2 md:p-3 font-semibold whitespace-nowrap">WhatsApp</th>
                      <th className="text-left p-2 md:p-3 font-semibold whitespace-nowrap">Poin</th>
                      <th className="text-left p-2 md:p-3 font-semibold whitespace-nowrap">Aksi</th>
                    </tr></thead>
                    <tbody>
                      {fMembers.map((m, index) => (
                        <tr key={m.id} className={`border-t border-slate-50 hover:bg-slate-50/60 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                          <td className="p-2 md:p-3 font-mono text-[9px] md:text-[10px] text-slate-400 whitespace-nowrap">{m.id}</td>
                          <td className="p-2 md:p-3 font-bold text-slate-800 text-[10px] md:text-xs whitespace-nowrap">{m.name}</td>
                          <td className="p-2 md:p-3 text-[9px] md:text-xs text-slate-600 whitespace-nowrap">{m.phone}</td>
                          <td className="p-2 md:p-3 whitespace-nowrap"><span className="flex items-center gap-1 text-emerald-600 font-bold text-[9px] md:text-xs"><Star size={11} fill="currentColor" />{m.points}</span></td>
                          <td className="p-2 md:p-3 whitespace-nowrap">
                            <div className="flex gap-1">
                              <button onClick={() => { setSelectedMember(m); setMemberForm({ name: m.name, phone: m.phone, points: m.points, password: m.password || '' }); setIsMemberModalOpen(true); }} className="p-1 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100"><Edit size={13} /></button>
                              <button onClick={async () => {
                              if (!confirm('Hapus member ini?')) return;
                              await fetch('/api/members', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: m.id }) });
                              setMembers(members.filter(x => x.id !== m.id));
                              }} className="p-1 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {fMembers.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-slate-400 text-xs">Tidak ada member</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* === PENGATURAN === */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900">Pengaturan</h1>
                <p className="text-xs text-slate-400">Konfigurasi sistem dan keamanan</p>
              </div>

              {/* Keamanan */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-xl"><Lock className="text-red-600" size={18} /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Keamanan</h3>
                    <p className="text-[10px] text-slate-400">Password admin dan akses sistem</p>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Password Admin</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        className="w-full bg-slate-50 p-3 pr-12 rounded-xl text-sm font-mono" 
                        value={settingsData.adminPassword} 
                        onChange={e => setSettingsData({ ...settingsData, adminPassword: e.target.value })} 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">Username tetap: admin</p>
                  </div>
                </div>
              </div>

              {/* Info Toko */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-xl"><Store className="text-blue-600" size={18} /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Informasi Toko</h3>
                    <p className="text-[10px] text-slate-400">Data usaha Anda</p>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama Toko</label>
                    <input className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={settingsData.storeName} onChange={e => setSettingsData({ ...settingsData, storeName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">No. Telepon</label>
                    <input className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={settingsData.storePhone} onChange={e => setSettingsData({ ...settingsData, storePhone: e.target.value })} placeholder="08xxxxxxxxxx" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Alamat</label>
                    <input className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={settingsData.storeAddress} onChange={e => setSettingsData({ ...settingsData, storeAddress: e.target.value })} placeholder="Jl. Contoh No. 123" />
                  </div>
                </div>
              </div>

              {/* Pengaturan Bunga & Poin */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-xl"><Percent className="text-emerald-600" size={18} /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Bunga & Poin</h3>
                    <p className="text-[10px] text-slate-400">Konfigurasi perhitungan</p>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Persentase Bunga (%)</label>
                    <input type="number" className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={settingsData.interestRate} onChange={e => setSettingsData({ ...settingsData, interestRate: e.target.value })} />
                    <p className="text-[9px] text-slate-400 mt-1">Bunga yang dikenakan per transaksi</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nilai Tukar Poin (Rp)</label>
                    <input type="number" className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={settingsData.pointValue} onChange={e => setSettingsData({ ...settingsData, pointValue: e.target.value })} />
                    <p className="text-[9px] text-slate-400 mt-1">1 Poin = Rp {parseInt(settingsData.pointValue).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Poin per Kelipatan</label>
                    <input type="number" className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={settingsData.pointsPerLoan} onChange={e => setSettingsData({ ...settingsData, pointsPerLoan: e.target.value })} />
                    <p className="text-[9px] text-slate-400 mt-1">Poin yang didapat member</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Kelipatan Pinjaman (Rp)</label>
                    <input type="number" className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={settingsData.pointLoanThreshold} onChange={e => setSettingsData({ ...settingsData, pointLoanThreshold: e.target.value })} />
                    <p className="text-[9px] text-slate-400 mt-1">Per Rp {parseInt(settingsData.pointLoanThreshold).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Backup & Restore */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-xl"><Database className="text-purple-600" size={18} /></div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Backup & Restore</h3>
                    <p className="text-[10px] text-slate-400">Cadangkan atau pulihkan data</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={exportAllData} className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform">
                      <Download size={16} /> Backup Data
                    </button>
                    <label className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-sm cursor-pointer hover:bg-slate-200 transition-colors">
                      <Upload size={16} /> Import Data
                      <input type="file" accept=".json" className="hidden" onChange={importData} />
                    </label>
                  </div>
                  <p className="text-[9px] text-slate-400 text-center">Backup akan mengunduh semua data dalam format JSON</p>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-red-100 flex items-center gap-3 bg-red-50">
                  <div className="bg-red-100 p-2 rounded-xl"><Trash className="text-red-600" size={18} /></div>
                  <div>
                    <h3 className="text-sm font-black text-red-800">Zona Berbahaya</h3>
                    <p className="text-[10px] text-red-400">Tindakan permanen</p>
                  </div>
                </div>
                <div className="p-4">
                  <button onClick={clearAllData} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform">
                    <Trash size={16} /> Hapus Semua Data
                  </button>
                  <p className="text-[9px] text-red-400 text-center mt-2">Peringatan: Tindakan ini tidak dapat dibatalkan!</p>
                </div>
              </div>

              {/* Save Button */}
              <div className="sticky bottom-4 pt-4">
                <button onClick={saveSettings} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-black py-4 rounded-2xl text-sm shadow-xl shadow-blue-200 active:scale-95 transition-transform">
                  <Save size={18} /> Simpan Pengaturan
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* === MODALS === */}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black mb-5">{selectedPawn ? 'Edit Gadaian' : 'Tambah Gadaian'}</h2>
            <form onSubmit={savePawn} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama</label>
                <input required className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tanggal</label>
                <input type="date" className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Gadget</label>
                <input required className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={formData.phoneBrand} onChange={e => setFormData({ ...formData, phoneBrand: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pinjaman (Rp)</label>
                <input type="number" required className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={formData.loanAmount} onChange={e => setFormData({ ...formData, loanAmount: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pot. Bunga (Rp)</label>
                <input type="number" className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={formData.interestReduction} onChange={e => setFormData({ ...formData, interestReduction: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Member</label>
                <select className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={formData.memberId} onChange={e => setFormData({ ...formData, memberId: e.target.value })}>
                  <option value="">Bukan Member</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status Gadai</label>
                <select className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="active">Aktif / Belum Diambil</option>
                  <option value="redeemed">Sudah Ditebus / Sudah Diambil</option>
                </select>
              </div>
              <div className="col-span-2 flex gap-2 mt-3">
                <button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"><Save size={16} /> {isSaving ? 'Menyimpan...' : 'Simpan'}</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 bg-slate-100 text-slate-600 font-semibold py-3 rounded-xl">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 shadow-2xl">
            <h2 className="text-lg font-black mb-5">{selectedMember ? 'Edit Member' : 'Tambah Member'}</h2>
            <form onSubmit={saveMember} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama Lengkap</label>
                <input required className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">No. WhatsApp</label>
                <input required type="tel" className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={memberForm.phone} onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Password</label>
                <input required type="text" className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={memberForm.password} onChange={e => setMemberForm({ ...memberForm, password: e.target.value })} />
              </div>
              {selectedMember && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Poin</label>
                  <input type="number" className="w-full bg-slate-50 p-3 rounded-xl text-sm" value={memberForm.points} onChange={e => setMemberForm({ ...memberForm, points: parseInt(e.target.value) })} />
                </div>
              )}
              <div className="flex gap-2 pt-3">
                <button type="submit" className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform">Simpan</button>
                <button type="button" onClick={() => setIsMemberModalOpen(false)} className="px-6 bg-slate-100 text-slate-600 font-semibold py-3 rounded-xl">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isQRModalOpen && selectedPawn && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xs p-8 shadow-2xl text-center">
            <h2 className="text-xl font-black mb-1">E-Kwitansi</h2>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-6">Scan QR Code</p>
            <div className="bg-white p-4 inline-block border-4 border-slate-50 rounded-2xl mb-6">
              <QRCodeSVG value={`${window.location.origin}/view/${selectedPawn.accessCode}`} size={180} />
            </div>
            <div className="bg-slate-50 p-3 rounded-xl font-mono text-lg font-black tracking-widest mb-6">{selectedPawn.accessCode}</div>
            <button onClick={() => setIsQRModalOpen(false)} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
