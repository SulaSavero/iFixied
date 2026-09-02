import Link from 'next/link';
import { Smartphone, ShieldCheck, Clock, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f2f2f7] relative overflow-hidden">
      {/* Blob background */}
      <div className="ios-blob w-[420px] h-[420px] bg-blue-400 -top-32 -left-32" />
      <div className="ios-blob delay-2 w-[380px] h-[380px] bg-purple-400 top-1/3 -right-40" />
      <div className="ios-blob delay-3 w-[340px] h-[340px] bg-amber-300 bottom-0 left-1/4" />

      {/* Nav */}
      <header className="glass-nav">
        <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-xl shadow-md shadow-blue-200">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">sFixied</span>
          </div>
          <Link href="/login" className="btn-primary text-sm py-2.5 px-5">
            Login
          </Link>
        </nav>
      </header>

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="animate-fade-up text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Solusi Gadai <span className="text-blue-600">Modern</span> & <span className="text-blue-600">Transparan</span>
          </h1>
          <p className="animate-fade-up delay-100 text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Platform penggadaian gadget terpercaya dengan sistem pencatatan digital otomatis, transparansi bunga, dan akses QR code untuk pelanggan.
          </p>
          <div className="animate-fade-up delay-200 flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link
              href="/scan"
              className="btn-primary text-lg justify-center"
            >
              <Smartphone className="w-6 h-6" /> Scan QR Gadaian
            </Link>
            <Link
              href="/login"
              className="btn-secondary text-lg justify-center"
            >
              <ShieldCheck className="w-6 h-6 text-blue-600" /> Login
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="animate-pop glass-card p-6 flex items-center gap-4 text-left" style={{ animationDelay: '0.3s' }}>
              <div className="bg-emerald-100 p-3 rounded-2xl"><CheckCircle className="text-emerald-600" /></div>
              <div>
                <h3 className="font-bold text-slate-900">Bunga Rendah</h3>
                <p className="text-sm text-slate-500">Bersahabat & Transparan</p>
              </div>
            </div>
            <div className="animate-pop glass-card p-6 flex items-center gap-4 text-left" style={{ animationDelay: '0.4s' }}>
              <div className="bg-blue-100 p-3 rounded-2xl"><Smartphone className="text-blue-600" /></div>
              <div>
                <h3 className="font-bold text-slate-900">All Gadgets</h3>
                <p className="text-sm text-slate-500">Support semua merk HP</p>
              </div>
            </div>
            <div className="animate-pop glass-card p-6 flex items-center gap-4 text-left" style={{ animationDelay: '0.5s' }}>
              <div className="bg-amber-100 p-3 rounded-2xl"><Clock className="text-amber-600" /></div>
              <div>
                <h3 className="font-bold text-slate-900">Cepat & Mudah</h3>
                <p className="text-sm text-slate-500">Proses kurang dari 5 menit</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative py-20 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
          <div className="relative max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <h2 className="text-3xl font-bold mb-6">Kenapa Memilih sFixied?</h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="bg-white/20 backdrop-blur-md p-1 rounded-full"><CheckCircle size={20} /></div>
                  <p>Kwitansi digital dengan akses QR Code unik.</p>
                </li>
                <li className="flex gap-3">
                  <div className="bg-white/20 backdrop-blur-md p-1 rounded-full"><CheckCircle size={20} /></div>
                  <p>Perhitungan bunga transparan tanpa biaya tersembunyi.</p>
                </li>
                <li className="flex gap-3">
                  <div className="bg-white/20 backdrop-blur-md p-1 rounded-full"><CheckCircle size={20} /></div>
                  <p>Keamanan data dan barang terjamin 100%.</p>
                </li>
                <li className="flex gap-3">
                  <div className="bg-white/20 backdrop-blur-md p-1 rounded-full"><CheckCircle size={20} /></div>
                  <p>Dashboard admin yang memudahkan pengelolaan inventaris.</p>
                </li>
              </ul>
            </div>
            <div className="animate-pop glass-panel p-8">
              <div className="aspect-video bg-white/10 rounded-2xl overflow-hidden flex items-center justify-center backdrop-blur-md">
                <ShieldCheck className="w-24 h-24 text-white opacity-30" />
              </div>
              <p className="mt-4 text-center text-blue-100 italic">"Sistem gadai paling transparan yang pernah saya gunakan." - Pelanggan Setia</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative bg-slate-900 text-slate-400 py-12 px-4 text-center">
        <p className="mb-4">&copy; 2024 sFixied. All rights reserved.</p>
        <div className="flex justify-center gap-6">
          <a href="#" className="hover:text-white transition-colors">Tentang Kami</a>
          <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
          <a href="#" className="hover:text-white transition-colors">Hubungi Kami</a>
        </div>
      </footer>
    </div>
  );
}