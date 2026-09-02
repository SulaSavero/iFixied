'use client';

import { useEffect } from 'react';

/**
 * Komponen ini meredam error "AbortError: play() request was interrupted"
 * yang muncul dari html5-qrcode saat komponen scanner di-unmount sebelum
 * proses play() kamera selesai (biasa terjadi karena React Strict Mode
 * atau navigasi cepat antar halaman). Error ini tidak berbahaya dan
 * tidak memengaruhi fungsi scan QR.
 *
 * Pendekatan lama (listener 'unhandledrejection') kalah cepat dengan
 * overlay error Next.js karena overlay-nya sudah lebih dulu "menangkap"
 * rejection tersebut. Solusinya: patch method play() milik <video> di
 * level prototype, supaya promise-nya langsung dikasih .catch() saat
 * dipanggil (oleh html5-qrcode sekalipun) — jadi rejection-nya tidak
 * pernah sempat jadi "unhandled" sama sekali.
 */
export default function SuppressBenignErrors() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const w = window as unknown as { __playPatched?: boolean };
    if (w.__playPatched) return;
    w.__playPatched = true;

    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function patchedPlay(this: HTMLMediaElement, ...args: []) {
      const result = originalPlay.apply(this, args);
      if (result && typeof (result as Promise<void>).catch === 'function') {
        (result as Promise<void>).catch((err: unknown) => {
          const name = (err as { name?: string })?.name;
          const message = String((err as { message?: string })?.message || err || '');
          const isBenignAbort =
            name === 'AbortError' &&
            (message.includes('play() request was interrupted') || message.includes('removed from the document'));
          if (!isBenignAbort) {
            // Error lain (misal izin kamera ditolak) tetap dilempar seperti biasa
            console.error(err);
          }
        });
      }
      return result;
    };

    // Jaring pengaman tambahan untuk rejection yang lolos dari patch di atas
    const handler = (event: PromiseRejectionEvent) => {
      const message = String(event.reason?.message || event.reason || '');
      if (message.includes('play() request was interrupted')) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  return null;
}