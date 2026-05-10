# 🗳️ Web Vote - University Voting System

A secure, real-time web-based voting platform designed for university elections.

---

## 🚀 Fitur Utama
- **Keamanan Tinggi**: Mencegah pemungutan suara ganda menggunakan transaksi database.
- **Dashboard Admin**: Kelola kandidat, pantau log aktivitas, dan kontrol periode voting.
- **Hasil Real-time**: Dashboard publik untuk memantau hasil pemilihan secara langsung.
- **Integrasi Google**: Login mudah bagi mahasiswa menggunakan akun Google institusi.
- **Ekspor Data**: Fitur ekspor hasil voting ke format CSV/Excel untuk keperluan arsip.

## 🛠️ Tech Stack
- **Framework**: [Next.js 15+](https://nextjs.org) (App Router)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Autentikasi**: [NextAuth.js](https://next-auth.js.org/) (Google OAuth & Credentials)
- **Styling**: Vanilla CSS / CSS Modules

---

## ⚙️ Persiapan Pengembangan

### 1. Prasyarat
- Node.js (Versi LTS terbaru)
- npm atau pnpm

### 2. Konfigurasi Environment
Salin file `.env.example` menjadi `.env` dan isi kredensial yang diperlukan:
```bash
cp .env.example .env
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Sinkronisasi Database
Pastikan schema database Anda sinkron dengan Prisma:
```bash
npx prisma db push
```

### 5. Jalankan Server Lokal
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 📁 Struktur Proyek Utama
- `/src/app/admin`: Panel kontrol administrator.
- `/src/app/dashboard`: Antarmuka voting untuk mahasiswa.
- `/src/app/results`: Tampilan hasil voting publik.
- `/src/app/api`: Endpoint API untuk voting, logs, dan ekspor.
- `/prisma`: Konfigurasi schema database.

