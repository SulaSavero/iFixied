'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Smartphone, Star, LogOut, Package, CreditCard, Calendar, ShieldCheck, Settings, User, Lock, Save, X, Gift, Wallet, Percent, ShoppingBag, ChevronRight, History } from 'lucide-react';

interface Pawn {
  id: number; date: string; name: string; phoneBrand: string;
  loanAmount: string; interestReduction: string; penalty: string;
  accessCode: string; status: string; createdAt: number; memberId?: string;
}

interface Member {
  id: string; name: string; phone: string; points: number;
  password?: string; balance?: number; discountCredit?: number;
}

interface Redemption {
  id: number; memberId: string; type: 'balance' | 'discount' | 'item';
  pointsUsed: number; value: number; itemName?: string; date: string;
}

export default function MemberDashboard() {
  const [member, setMember] = useState<Member | null>(null);
  const [myPawns, setMyPawns] = useState<Pawn[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'redeem' | 'history'>('home');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [redeemType, setRedeemType] = useState<'balance' | 'discount' | 'item' | null>(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [profileData, setProfileData] = useState({ name: '', password: '' });

  // Config: 1 poin = Rp 1000
  const POINT_VALUE = 1000;

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const memberId = localStorage.getItem('memberId');
    if (role !== 'member' || !memberId) { window.location.href = '/login'; return; }

    Promise.all([
  fetch('/api/members').then(res => res.json()),
  fetch('/api/pawns').then(res => res.json()),
])
  .then(([allMembers, allPawns]: [Member[], Pawn[]]) => {
    const currentMember = allMembers.find(m => m.id === memberId);
    if (currentMember) {
      setMember(currentMember);
      setProfileData({ name: currentMember.name, password: currentMember.password || currentMember.phone });
    }
    setMyPawns(allPawns.filter(p => p.memberId === memberId).map((p) => ({ ...p, status: p.status || 'active' })));
  })
  .catch(err => console.error('Gagal ambil data:', err))
  .finally(() => setLoading(false));
  }, []);

  const calculateTotal = (p: Pawn) => parseFloat(p.loanAmount) * 1.1 - parseFloat(p.interestReduction) + parseFloat(p.penalty);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('memberId');
    window.location.href = '/login';
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!member) return;
  try {
    const res = await fetch('/api/members', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: member.id, password: profileData.password }),
    });
    const updated = await res.json();
    setMember(updated);
    setIsProfileModalOpen(false);
    alert('Password berhasil diperbarui!');
  } catch (err) {
    console.error('Gagal update profil:', err);
    alert('Gagal menyimpan perubahan. Coba lagi.');
  }
};

  const openRedeemModal = (type: 'balance' | 'discount' | 'item') => {
    if (type === 'item') {
      alert('Fitur tukar barang akan segera hadir!');
      return;
    }
    setRedeemType(type);
    setRedeemAmount('');
    setIsRedeemModalOpen(true);
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !redeemType) return;

    const points = parseInt(redeemAmount);
    if (isNaN(points) || points <= 0) {
      alert('Masukkan jumlah poin yang valid');
      return;
    }
    if (points > member.points) {
      alert('Poin tidak mencukupi!');
      return;
    }

    const value = points * POINT_VALUE;
    const newRedemption: Redemption = {
      id: Date.now(),
      memberId: member.id,
      type: redeemType,
      pointsUsed: points,
      value: value,
      date: new Date().toISOString()
    };

    // Update member points and balance/discount
    const savedMembers = localStorage.getItem('members_data');
    if (savedMembers) {
      const allMembers: Member[] = JSON.parse(savedMembers);
      const updatedMembers = allMembers.map(m => {
        if (m.id === member.id) {
          const newPoints = m.points - points;
          if (redeemType === 'balance') {
            return { ...m, points: newPoints, balance: (m.balance || 0) + value };
          } else {
            return { ...m, points: newPoints, discountCredit: (m.discountCredit || 0) + value };
          }
        }
        return m;
      });
      localStorage.setItem('members_data', JSON.stringify(updatedMembers));
      
      const updatedMember = updatedMembers.find(m => m.id === member.id);
      if (updatedMember) setMember(updatedMember);
    }

    // Save redemption history
    const savedRedemptions = localStorage.getItem('redemptions_data');
    const allRedemptions: Redemption[] = savedRedemptions ? JSON.parse(savedRedemptions) : [];
    allRedemptions.unshift(newRedemption);
    localStorage.setItem('redemptions_data', JSON.stringify(allRedemptions));
    setRedemptions([newRedemption, ...redemptions]);

    setIsRedeemModalOpen(false);
    alert(`Berhasil menukar ${points} poin menjadi ${redeemType === 'balance' ? 'Saldo' : 'Potongan Pinjaman'} Rp ${value.toLocaleString()}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-slate-400">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-5 pt-6 pb-10 rounded-b-[2.5rem]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-blue-100 text-xs font-medium">Selamat datang,</p>
            <h1 className="text-xl font-black">{member?.name || 'Member'}</h1>
            <p className="text-blue-200 text-[10px] font-mono mt-0.5">{member?.id}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsProfileModalOpen(true)} className="bg-white/20 p-2 rounded-xl"><Settings size={18} /></button>
            <button onClick={handleLogout} className="bg-white/20 p-2 rounded-xl"><LogOut size={18} /></button>
          </div>
        </div>

        {/* Points Card */}
        <div className="bg-white rounded-3xl p-5 shadow-xl -mb-14 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-2xl"><Star className="text-amber-500" size={28} fill="currentColor" /></div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Poin</p>
                <h2 className="text-3xl font-black text-slate-900">{member?.points || 0}</h2>
              </div>
            </div>
            <button onClick={() => setActiveTab('redeem')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
              <Gift size={14} /> Tukar
            </button>
          </div>
          
          {/* Balance & Discount Credit */}
          <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100">
            <div className="bg-emerald-50 p-3 rounded-xl">
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Saldo</p>
              <p className="text-sm font-black text-emerald-700">Rp {(member?.balance || 0).toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-xl">
              <p className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">Kredit Potongan</p>
              <p className="text-sm font-black text-purple-700">Rp {(member?.discountCredit || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-20">

        {/* Tab: Home */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-800">Gadaian Aktif</h3>
              <span className="bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full text-[10px] font-bold">{myPawns.length} Item</span>
            </div>

            {myPawns.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-200">
                <Smartphone className="mx-auto text-slate-200 mb-3" size={48} />
                <p className="text-slate-400 text-xs font-semibold">Belum ada gadaian aktif</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myPawns.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <div>
                        <h4 className="text-sm font-black text-slate-800">{p.phoneBrand}</h4>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Calendar size={10} /> {p.date}</p>
                        <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[9px] font-bold ${p.status === 'redeemed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {p.status === 'redeemed' ? 'Sudah Ditebus' : 'Aktif'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Total</p>
                        <p className="text-sm font-black text-blue-600">Rp {calculateTotal(p).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-slate-50 p-2 rounded-lg">
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Pinjaman</p>
                        <p className="text-xs font-bold text-slate-700">Rp {parseFloat(p.loanAmount).toLocaleString()}</p>
                      </div>
                      <div className="flex-1 bg-slate-50 p-2 rounded-lg">
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Kode</p>
                        <p className="text-xs font-mono font-bold text-slate-700">{p.accessCode}</p>
                      </div>
                    </div>
                    <a href={`/view/${p.accessCode}`} className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2.5 rounded-xl text-xs font-bold">
                      <ShieldCheck size={14} /> Lihat Struk
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Redeem Points */}
        {activeTab === 'redeem' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-800">Tukar Poin</h3>
              <p className="text-xs text-slate-400">Pilih cara penukaran poin Anda</p>
            </div>

            <div className="space-y-3">
              {/* Option 1: Balance */}
              <button onClick={() => openRedeemModal('balance')} className="w-full bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 text-left active:scale-[0.98] transition-transform">
                <div className="bg-emerald-100 p-3 rounded-2xl"><Wallet className="text-emerald-600" size={24} /></div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-slate-800">Tukar ke Saldo</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Konversi poin menjadi saldo tunai</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">1 Poin = Rp {POINT_VALUE.toLocaleString()}</p>
                </div>
                <ChevronRight className="text-slate-300" size={20} />
              </button>

              {/* Option 2: Loan Discount */}
              <button onClick={() => openRedeemModal('discount')} className="w-full bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 text-left active:scale-[0.98] transition-transform">
                <div className="bg-purple-100 p-3 rounded-2xl"><Percent className="text-purple-600" size={24} /></div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-slate-800">Potongan Pinjaman</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Kredit untuk memotong pinjaman berikutnya</p>
                  <p className="text-[10px] text-purple-600 font-bold mt-1">1 Poin = Rp {POINT_VALUE.toLocaleString()}</p>
                </div>
                <ChevronRight className="text-slate-300" size={20} />
              </button>

              {/* Option 3: Items (Coming Soon) */}
              <button onClick={() => openRedeemModal('item')} className="w-full bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 text-left opacity-60">
                <div className="bg-amber-100 p-3 rounded-2xl"><ShoppingBag className="text-amber-600" size={24} /></div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-slate-800">Tukar Barang</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Voucher, Rokok, dan lainnya</p>
                  <p className="text-[10px] text-amber-600 font-bold mt-1">Segera Hadir</p>
                </div>
                <span className="bg-slate-200 text-slate-500 px-2 py-1 rounded-lg text-[9px] font-bold uppercase">Soon</span>
              </button>
            </div>

            <button onClick={() => setActiveTab('history')} className="w-full flex items-center justify-center gap-2 text-slate-500 text-xs font-semibold py-3">
              <History size={14} /> Lihat Riwayat Penukaran
            </button>
          </div>
        )}

        {/* Tab: History */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-800">Riwayat Penukaran</h3>
              <p className="text-xs text-slate-400">Semua transaksi tukar poin Anda</p>
            </div>

            {redemptions.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-200">
                <Gift className="mx-auto text-slate-200 mb-3" size={48} />
                <p className="text-slate-400 text-xs font-semibold">Belum ada riwayat penukaran</p>
              </div>
            ) : (
              <div className="space-y-3">
                {redemptions.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${r.type === 'balance' ? 'bg-emerald-100' : r.type === 'discount' ? 'bg-purple-100' : 'bg-amber-100'}`}>
                      {r.type === 'balance' ? <Wallet className="text-emerald-600" size={20} /> : r.type === 'discount' ? <Percent className="text-purple-600" size={20} /> : <ShoppingBag className="text-amber-600" size={20} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-slate-800">
                        {r.type === 'balance' ? 'Tukar ke Saldo' : r.type === 'discount' ? 'Potongan Pinjaman' : r.itemName}
                      </p>
                      <p className="text-[10px] text-slate-400">{format(new Date(r.date), 'dd MMM yyyy • HH:mm:ss')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-red-500 font-bold">-{r.pointsUsed} Poin</p>
                      <p className="text-xs font-black text-emerald-600">+Rp {r.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-around z-50">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'}`}>
          <Smartphone size={20} />
          <span className="text-[10px] font-bold">Gadaian</span>
        </button>
        <button onClick={() => setActiveTab('redeem')} className={`flex flex-col items-center gap-1 ${activeTab === 'redeem' ? 'text-blue-600' : 'text-slate-400'}`}>
          <Gift size={20} />
          <span className="text-[10px] font-bold">Tukar Poin</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400'}`}>
          <History size={20} />
          <span className="text-[10px] font-bold">Riwayat</span>
        </button>
      </div>

      {/* Redeem Modal */}
      {isRedeemModalOpen && redeemType && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center p-0 backdrop-blur-sm">
          <div className="bg-white w-full rounded-t-[2rem] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${redeemType === 'balance' ? 'bg-emerald-100' : 'bg-purple-100'}`}>
                  {redeemType === 'balance' ? <Wallet className="text-emerald-600" size={20} /> : <Percent className="text-purple-600" size={20} />}
                </div>
                <h3 className="text-lg font-black text-slate-800">
                  {redeemType === 'balance' ? 'Tukar ke Saldo' : 'Potongan Pinjaman'}
                </h3>
              </div>
              <button onClick={() => setIsRedeemModalOpen(false)} className="bg-slate-100 p-2 rounded-full"><X size={18} /></button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-semibold">Poin Tersedia</span>
                <span className="text-lg font-black text-slate-800 flex items-center gap-1"><Star size={16} className="text-amber-500" fill="currentColor" /> {member?.points || 0}</span>
              </div>
            </div>

            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Jumlah Poin yang Ditukar</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  max={member?.points || 0}
                  className="w-full bg-slate-50 p-4 rounded-xl text-lg font-bold text-center" 
                  placeholder="0"
                  value={redeemAmount}
                  onChange={e => setRedeemAmount(e.target.value)}
                />
              </div>
              
              {redeemAmount && parseInt(redeemAmount) > 0 && (
                <div className={`p-4 rounded-2xl ${redeemType === 'balance' ? 'bg-emerald-50' : 'bg-purple-50'}`}>
                  <p className="text-xs text-slate-500 font-semibold mb-1">Anda akan mendapatkan</p>
                  <p className={`text-2xl font-black ${redeemType === 'balance' ? 'text-emerald-600' : 'text-purple-600'}`}>
                    Rp {(parseInt(redeemAmount) * POINT_VALUE).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {redeemType === 'balance' ? 'Akan ditambahkan ke Saldo Anda' : 'Akan menjadi kredit potongan pinjaman'}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" className={`flex-1 text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform ${redeemType === 'balance' ? 'bg-emerald-600' : 'bg-purple-600'}`}>
                  Tukar Sekarang
                </button>
                <button type="button" onClick={() => setIsRedeemModalOpen(false)} className="px-6 bg-slate-100 text-slate-600 font-semibold py-4 rounded-2xl">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center p-0 backdrop-blur-sm">
          <div className="bg-white w-full rounded-t-[2rem] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><User className="text-blue-600" size={20} /> Profil Saya</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="bg-slate-100 p-2 rounded-full"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input readOnly className="w-full bg-slate-100 pl-10 pr-4 py-3 rounded-xl text-slate-400 font-semibold cursor-not-allowed" value={profileData.name} />
                </div>
                <p className="text-[9px] text-amber-500 mt-1 font-medium">* Hanya admin yang dapat mengubah nama</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Password Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" required className="w-full bg-slate-50 pl-10 pr-4 py-3 rounded-xl font-semibold" value={profileData.password} onChange={e => setProfileData({ ...profileData, password: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"><Save size={16} /> Simpan</button>
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-6 bg-slate-100 text-slate-600 font-semibold py-4 rounded-2xl">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
