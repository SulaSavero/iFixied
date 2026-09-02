'use client';

import { useEffect, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Smartphone, Calendar, User, ShieldCheck, CheckCircle, RotateCcw } from 'lucide-react';

interface Pawn {
  id: number; date: string; name: string; phoneBrand: string;
  loanAmount: string; interestReduction: string; penalty: string;
  accessCode: string; status: string; createdAt: number; memberId?: string;
}

export default function AdminScanner() {
  const [foundPawn, setFoundPawn] = useState<Pawn | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [manualCode, setManualCode] = useState('');

  const lookupCode = useCallback(async (code: string) => {
    try {
      const res = await fetch('/api/pawns');
      const allPawns: Pawn[] = await res.json();
      const found = allPawns.find(p => p.accessCode === code.toUpperCase());
      if (found) {
        setFoundPawn({ ...found, status: found.status || 'active' });
        setNotFound(false);
      } else {
        setNotFound(true);
        setFoundPawn(null);
      }
    } catch (err) {
      console.error('Gagal ambil data pawns:', err);
      setNotFound(true);
      setFoundPawn(null);
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    if (!scanning) return;

    const qrCode = new Html5Qrcode('admin-reader');
    let isStarted = false;
    let isStopping = false;
    let cancelled = false;

    const handleSuccess = (decodedText: string) => {
      let code = decodedText;
      if (decodedText.includes('/view/')) {
        code = decodedText.split('/view/').pop() || decodedText;
      }
      if (isStarted && !isStopping) {
        isStopping = true;
        qrCode
          .stop()
          .then(() => lookupCode(code))
          .catch(() => lookupCode(code));
      }
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };

    const startScanner = async () => {
      try {
        await qrCode.start({ facingMode: 'environment' }, config, handleSuccess, () => {});
        if (cancelled) {
          await qrCode.stop().catch(() => {});
          return;
        }
        isStarted = true;
      } catch (err) {
        if (cancelled) return;
        try {
          await qrCode.start({ facingMode: 'user' }, config, handleSuccess, () => {});
          if (cancelled) {
            await qrCode.stop().catch(() => {});
            return;
          }
          isStarted = true;
        } catch (e) {
          console.error('Gagal membuka kamera:', e);
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      if (isStarted && !isStopping) {
        isStopping = true;
        qrCode.stop().catch(() => {});
      }
    };
  }, [scanning, lookupCode]);

  const toggleStatus = async () => {
    if (!foundPawn) return;
    const newStatus = foundPawn.status === 'redeemed' ? 'active' : 'redeemed';
    try {
      const res = await fetch('/api/pawns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: foundPawn.id, status: newStatus }),
      });
      const updated = await res.json();
      setFoundPawn(updated);
    } catch (err) {
      console.error('Gagal update status:', err);
      alert('Gagal update status. Coba lagi.');
    }
  };

  const total = (p: Pawn) => parseFloat(p.loanAmount) * 1.1 - parseFloat(p.interestReduction) + parseFloat(p.penalty);

  const resetScan = () => {
    setFoundPawn(null);
    setNotFound(false);
    setManualCode('');
    setScanning(true);
  };

  const handleManual = () => {
    if (manualCode.trim().length > 0) lookupCode(manualCode.trim());
  };

  return (
    <div className="flex flex-col items-center">
      <div className="animate-pop glass-card w-full max-w-sm overflow-hidden">

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white text-center">
          <Camera className="mx-auto mb-2" size={32} />
          <h2 className="text-xl font-bold">Admin Scanner</h2>
          <p className="text-slate-300 text-sm">Scan untuk cek & tandai penebusan</p>
        </div>

        {/* Scanner aktif */}
        {scanning && (
          <>
            <div className="p-4">
              <div className="relative overflow-hidden rounded-2xl border-4 border-white shadow-inner">
                <div id="admin-reader"></div>
                <div className="scan-beam" />
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase font-bold">Atau Ketik Kode</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: A1B2C3D4"
                  className="ios-input flex-1 uppercase font-mono text-sm"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleManual(); }}
                />
                <button onClick={handleManual} className="btn-primary px-5">Cari</button>
              </div>
            </div>
          </>
        )}

        {/* Tidak ditemukan */}
        {notFound && !scanning && (
          <div className="animate-pop p-8 text-center">
            <X className="mx-auto text-red-400 mb-3" size={48} />
            <p className="text-sm font-bold text-slate-800 mb-1">Data Tidak Ditemukan</p>
            <p className="text-xs text-slate-400 mb-6">Kode QR tidak cocok dengan data gadaian manapun.</p>
            <button onClick={resetScan} className="btn-primary w-full justify-center flex">
              <RotateCcw size={16} /> Scan Ulang
            </button>
          </div>
        )}

        {/* Detail gadai ditemukan */}
        {foundPawn && !scanning && (
          <div className="animate-pop p-5">
            {/* Status Badge Besar */}
            <div className={`text-center p-4 rounded-2xl mb-5 backdrop-blur-md ${foundPawn.status === 'redeemed' ? 'bg-emerald-50/80 border border-emerald-200' : 'bg-amber-50/80 border border-amber-200'}`}>
              {foundPawn.status === 'redeemed' ? (
                <CheckCircle className="mx-auto text-emerald-500 mb-2" size={36} />
              ) : (
                <ShieldCheck className="mx-auto text-amber-500 mb-2" size={36} />
              )}
              <p className={`text-lg font-black ${foundPawn.status === 'redeemed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {foundPawn.status === 'redeemed' ? 'SUDAH DITEBUS' : 'AKTIF / BELUM DIAMBIL'}
              </p>
            </div>

            {/* Info detail */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md p-3 rounded-2xl border border-white/50">
                <User size={16} className="text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Pelanggan</p>
                  <p className="text-sm font-bold text-slate-800">{foundPawn.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md p-3 rounded-2xl border border-white/50">
                <Smartphone size={16} className="text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Gadget</p>
                  <p className="text-sm font-bold text-slate-800">{foundPawn.phoneBrand}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md p-3 rounded-2xl border border-white/50">
                <Calendar size={16} className="text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Tanggal Gadai</p>
                  <p className="text-sm font-bold text-slate-800">{foundPawn.date}</p>
                </div>
              </div>
            </div>

            {/* Rincian */}
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl mb-5 space-y-2 border border-white/50">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Pinjaman</span>
                <span className="font-bold text-slate-700">Rp {parseFloat(foundPawn.loanAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Bunga (10%)</span>
                <span className="font-bold text-emerald-600">+ Rp {(parseFloat(foundPawn.loanAmount) * 0.1).toLocaleString()}</span>
              </div>
              {parseFloat(foundPawn.interestReduction) > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Potongan</span>
                  <span className="font-bold text-red-500">- Rp {parseFloat(foundPawn.interestReduction).toLocaleString()}</span>
                </div>
              )}
              {parseFloat(foundPawn.penalty) > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Denda</span>
                  <span className="font-bold text-red-500">+ Rp {parseFloat(foundPawn.penalty).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-700">Total</span>
                <span className="font-black text-blue-600">Rp {total(foundPawn).toLocaleString()}</span>
              </div>
            </div>

            {/* Kode */}
            <div className="bg-slate-100/80 backdrop-blur-md text-center p-3 rounded-2xl mb-5">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Kode Akses</p>
              <p className="font-mono text-lg font-black text-slate-800 tracking-widest">{foundPawn.accessCode}</p>
            </div>

            {/* Tombol Aksi */}
            <div className="space-y-3">
              <button
                onClick={toggleStatus}
                className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 text-sm spring ${
                  foundPawn.status === 'redeemed'
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                    : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                }`}
              >
                {foundPawn.status === 'redeemed' ? (
                  <><RotateCcw size={18} /> Kembalikan ke Aktif</>
                ) : (
                  <><CheckCircle size={18} /> Tandai Sudah Ditebus</>
                )}
              </button>
              <button onClick={resetScan} className="btn-secondary w-full justify-center flex">
                <Camera size={16} /> Scan Lagi
              </button>
            </div>
          </div>
        )}

        <div className="p-4 text-center border-t border-white/40">
          <a href="/dashboard" className="text-slate-400 text-xs font-semibold hover:text-slate-600 transition-colors">
            ← Kembali ke Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}