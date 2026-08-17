# Gadai Mart - Sistem Penggadaian Modern

Aplikasi manajemen toko penggadaian modern dengan Next.js, PostgreSQL, dan Drizzle ORM.

## Persyaratan
- Node.js 18.x atau lebih baru
- PostgreSQL (Lokal atau Cloud seperti Supabase/Neon)

## Langkah Instalasi

### 1. Clone Project & Instalasi Library
Buka terminal di VS Code dan jalankan:
```bash
npm install
```

### 2. Konfigurasi Database
Buat file `.env` di root folder dan masukkan koneksi database Anda:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/nama_db"
```

### 3. Setup Database Schema
Sinkronkan skema database ke PostgreSQL Anda:
```bash
npx drizzle-kit push
```

### 4. Tambahkan User Admin (Opsional via psql)
Jalankan perintah SQL ini di database Anda untuk login pertama kali:
```sql
INSERT INTO users (username, password, role) VALUES ('admin', 'password123', 'admin');
```

### 5. Jalankan Aplikasi
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## Fitur Utama
- **Dashboard Admin**: Kelola data gadget, pinjaman, dan bunga.
- **Auto Kalkulasi**: Bunga 10% otomatis dihitung dari pinjaman.
- **QR Code**: Setiap transaksi memiliki QR Code unik.
- **Customer View**: Pelanggan bisa scan QR untuk melihat detail gadaian tanpa login.

## Struktur Folder Penting
- `src/app`: Route dan halaman utama.
- `src/db/schema.ts`: Definisi tabel database.
- `src/components`: Komponen UI dashboard.
- `src/api`: Endpoint backend untuk data.
