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
      <div className="animate-pop glass-card w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white text-center">
          <Camera className="mx-auto mb-2" size={32} />
          <h2 className="text-xl font-bold">Scan QR Code</h2>
          <p className="text-blue-100 text-sm">Arahkan kamera ke kode QR pada kwitansi</p>
        </div>

        <div className="p-4">
          <div className="relative overflow-hidden rounded-2xl border-4 border-white shadow-inner">
            <div id="reader"></div>
            <div className="scan-beam" />
          </div>
        </div>

        {error && (
          <div className="mx-4 mb-2 p-3 text-red-600 text-center text-sm font-medium bg-red-50 rounded-xl">
            {error}
          </div>
        )}

        <div className="px-6 pb-6">
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase font-bold">Atau Masukkan Kode</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <input
            type="text"
            placeholder="Contoh: A1B2C3D4"
            className="ios-input uppercase font-mono text-sm"
            onChange={(e) => {
              if (e.target.value.length >= 8) {
                router.push(`/view/${e.target.value.toUpperCase()}`);
              }
            }}
          />
        </div>

        <div className="p-6 text-center border-t border-white/40">
          <button
            onClick={() => router.push('/')}
            className="text-slate-500 flex items-center gap-2 mx-auto hover:text-slate-800 transition-colors font-medium"
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