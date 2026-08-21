'use client';

import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { Camera, X } from 'lucide-react';

export default function QRScanner() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qrCode = new Html5Qrcode('reader');
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
          .then(() => router.push(`/view/${code}`))
          .catch(() => {
            window.location.href = `/view/${code}`;
          });
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
          setError('Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.');
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
  }, [router]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
        <div className="bg-blue-600 p-6 text-white text-center">
          <Camera className="mx-auto mb-2" size={32} />
          <h2 className="text-xl font-bold">Scan QR Code</h2>
          <p className="text-blue-100 text-sm">Arahkan kamera ke kode QR pada kwitansi</p>
        </div>
        
        <div className="p-4 bg-slate-50">
          <div id="reader" className="overflow-hidden rounded-2xl border-4 border-white shadow-inner"></div>
        </div>

        {error && (
          <div className="p-4 text-red-500 text-center text-sm font-medium bg-red-50">
            {error}
          </div>
        )}

        <div className="px-6 pb-6">
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase font-bold">Atau Masukkan Kode</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Contoh: A1B2C3D4"
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
              onChange={(e) => {
                if (e.target.value.length >= 8) {
                  router.push(`/view/${e.target.value.toUpperCase()}`);
                }
              }}
            />
          </div>
        </div>

        <div className="p-6 text-center border-t border-slate-50">
          <button 
            onClick={() => router.push('/')}
            className="text-slate-500 flex items-center gap-2 mx-auto hover:text-slate-800 transition-colors"
          >
            <X size={20} /> Batal & Kembali
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-slate-400 text-sm text-center max-w-xs px-4">
        Pastikan Anda memberikan izin akses kamera pada browser/aplikasi Anda.
      </div>
    </div>
  );
}