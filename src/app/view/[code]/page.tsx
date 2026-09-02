'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, Calendar, User, Smartphone, AlertCircle } from 'lucide-react';

interface Pawn {
  id: number;
  date: string;
  name: string;
  phoneBrand: string;
  loanAmount: string;
  interestReduction: string;
  penalty: string;
  accessCode: string;
  status: string;
}

export default function ViewPawnPage() {
  const params = useParams();
  const code = params?.code as string;
  const [pawn, setPawn] = useState<Pawn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) return;

    fetch(`/api/pawns/public/${code}`)
      .then(res => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((found: Pawn) => {
        setPawn({ ...found, status: found.status || 'active' });
      })
      .catch(err => {
        console.error('Gagal ambil data:', err);
        setError('Gagal memuat data');
      })
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f2f7]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full shimmer" />
        <div className="h-3 w-32 rounded-full shimmer" />
      </div>
    </div>
  );

  if (error || !pawn) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f2f7] p-4 relative overflow-hidden">
      <div className="ios-blob w-[320px] h-[320px] bg-red-300 -top-20 -left-20" />
      <div className="animate-pop glass-card text-center p-8 max-w-sm w-full relative z-10">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Oops!</h1>
        <p className="text-slate-500 mb-6">{error || 'Kode akses tidak valid'}</p>
        <button onClick={() => window.location.href = '/'} className="btn-primary w-full justify-center flex">Kembali</button>
      </div>
    </div>
  );

  const calculateTotal = (p: Pawn) => {
    const loan = parseFloat(p.loanAmount);
    const interest = loan * 0.1;
    const reduction = parseFloat(p.interestReduction);
    const penalty = parseFloat(p.penalty);
    return loan + interest - reduction + penalty;
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7] py-12 px-4 relative overflow-hidden">
      <div className="ios-blob w-[380px] h-[380px] bg-blue-400 -top-24 -left-24" />
      <div className="ios-blob delay-2 w-[300px] h-[300px] bg-purple-300 bottom-0 -right-20" />

      <div className="max-w-md mx-auto relative z-10">
        <div className="animate-fade-up text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Detail sFixied</h1>
          <p className="text-slate-500">Kwitansi Digital Offline</p>
        </div>

        <div className="animate-pop glass-card overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white text-center">
            <p className="text-blue-100 text-xs uppercase tracking-widest mb-1">Total Tagihan</p>
            <h2 className="text-4xl font-black">Rp {calculateTotal(pawn).toLocaleString()}</h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/60 backdrop-blur-md p-2 rounded-xl border border-white/50"><Calendar className="w-5 h-5 text-slate-500" /></div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Tanggal Gadai</p>
                <p className="font-semibold text-slate-700">{new Date(pawn.date).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/60 backdrop-blur-md p-2 rounded-xl border border-white/50"><User className="w-5 h-5 text-slate-500" /></div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Nama Pelanggan</p>
                <p className="font-semibold text-slate-700">{pawn.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-white/60 backdrop-blur-md p-2 rounded-xl border border-white/50"><Smartphone className="w-5 h-5 text-slate-500" /></div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Gadget / HP</p>
                <p className="font-semibold text-slate-700">{pawn.phoneBrand}</p>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Pinjaman Awal</span>
                <span className="font-medium">Rp {parseFloat(pawn.loanAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Bunga (10%)</span>
                <span className="font-medium text-green-600">+ Rp {(parseFloat(pawn.loanAmount) * 0.1).toLocaleString()}</span>
              </div>
              {parseFloat(pawn.interestReduction) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Potongan Bunga</span>
                  <span className="font-medium text-red-500">- Rp {parseFloat(pawn.interestReduction).toLocaleString()}</span>
                </div>
              )}
              {parseFloat(pawn.penalty) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Denda</span>
                  <span className="font-medium text-red-500">+ Rp {parseFloat(pawn.penalty).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between border border-white/50">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Status</p>
                <p className={`font-bold uppercase text-sm ${pawn.status === 'redeemed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {pawn.status === 'redeemed' ? 'SUDAH DITEBUS' : 'AKTIF'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold text-right">Kode Akses</p>
                <p className="font-mono font-bold text-slate-700">{pawn.accessCode}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/40 backdrop-blur-md border-t border-white/40 text-center">
            <p className="text-xs text-slate-400 italic">Terima kasih telah menggunakan jasa sFixied. Simpan halaman ini sebagai bukti gadai Anda.</p>
          </div>
        </div>
      </div>
    </div>
  );
}