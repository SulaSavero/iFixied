import QRScanner from '@/components/QRScanner';

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="ios-blob w-[380px] h-[380px] bg-blue-400 -top-24 -left-24" />
      <div className="ios-blob delay-3 w-[320px] h-[320px] bg-emerald-300 bottom-0 -right-20" />
      <div className="relative z-10">
        <QRScanner />
      </div>
    </div>
  );
}