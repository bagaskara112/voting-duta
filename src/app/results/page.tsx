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
        <h1 className={styles.title}>Live Quick Count</h1>
        <p className={styles.subtitle}>
          Hasil perolehan suara Pemilihan Duta Universitas 2026 yang diperbarui secara langsung.
        </p>
      </header>

      <LiveResults />
    </main>
  );
}
