import QRScanner from '@/components/QRScanner';

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <QRScanner />
    </div>
  );
}
