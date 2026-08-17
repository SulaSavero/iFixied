import Link from 'next/link';
import { Smartphone, ShieldCheck, Clock, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <header className="bg-white border-b border-slate-100">
        <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">sFixied</span>
          </div>
          <Link 
            href="/login" 
            className="btn-primary"
          >
            Login
          </Link>
        </nav>
      </header>

      <main>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            Solusi Gadai <span className="text-blue-600">Modern</span> & <span className="text-blue-600">Transparan</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Platform penggadaian gadget terpercaya dengan sistem pencatatan digital otomatis, transparansi bunga, dan akses QR code untuk pelanggan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/scan" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              <Smartphone className="w-6 h-6" /> Scan QR Gadaian
            </Link>
            <Link 
              href="/login" 
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <ShieldCheck className="w-6 h-6 text-blue-600" /> Login
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 text-left">
              <div className="bg-green-100 p-3 rounded-xl"><CheckCircle className="text-green-600" /></div>
              <div>
                <h3 className="font-bold">Bunga Rendah</h3>
                <p className="text-sm text-slate-500">Bersahabat & Transparan</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 text-left">
              <div className="bg-blue-100 p-3 rounded-xl"><Smartphone className="text-blue-600" /></div>
              <div>
                <h3 className="font-bold">All Gadgets</h3>
                <p className="text-sm text-slate-500">Support semua merk HP</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 text-left">
              <div className="bg-amber-100 p-3 rounded-xl"><Clock className="text-amber-600" /></div>
              <div>
                <h3 className="font-bold">Cepat & Mudah</h3>
                <p className="text-sm text-slate-500">Proses kurang dari 5 menit</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-600 py-20 text-white">
          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Kenapa Memilih sFixied?</h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="bg-blue-500/50 p-1 rounded-full"><CheckCircle size={20} /></div>
                  <p>Kwitansi digital dengan akses QR Code unik.</p>
                </li>
                <li className="flex gap-3">
                  <div className="bg-blue-500/50 p-1 rounded-full"><CheckCircle size={20} /></div>
                  <p>Perhitungan bunga transparan tanpa biaya tersembunyi.</p>
                </li>
                <li className="flex gap-3">
                  <div className="bg-blue-500/50 p-1 rounded-full"><CheckCircle size={20} /></div>
                  <p>Keamanan data dan barang terjamin 100%.</p>
                </li>
                <li className="flex gap-3">
                  <div className="bg-blue-500/50 p-1 rounded-full"><CheckCircle size={20} /></div>
                  <p>Dashboard admin yang memudahkan pengelolaan inventaris.</p>
                </li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <div className="aspect-video bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                 <ShieldCheck className="w-24 h-24 text-blue-600 opacity-20" />
              </div>
              <p className="mt-4 text-center text-blue-100 italic">"Sistem gadai paling transparan yang pernah saya gunakan." - Pelanggan Setia</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 px-4 text-center">
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
