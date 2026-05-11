import Link from "next/link";
import styles from "./results.module.css";
import LiveResults from "./LiveResults";

export const metadata = {
  title: "Live Results - Pemilihan Duta Universitas",
  description: "Pantau hasil perolehan suara secara langsung dan transparan.",
};

export default function ResultsPage() {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          &larr; Kembali ke Beranda
        </Link>
        <img 
          src="https://splytgbmvhobfvyidovq.supabase.co/storage/v1/object/public/voting-duta/logo_duta_kampus.jpeg" 
          alt="Logo Duta" 
          style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 20px", display: "block", border: "3px solid rgba(255,255,255,0.3)", padding: "3px", background: "white" }}
        />
        <h1 className={styles.title}>Live Quick Count</h1>
        <p className={styles.subtitle}>
          Hasil perolehan suara Pemilihan Duta Universitas 2026 yang diperbarui secara langsung.
        </p>
      </header>

      <LiveResults />
    </main>
  );
}
