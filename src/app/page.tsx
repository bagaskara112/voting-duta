import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import Countdown from "@/components/Countdown/Countdown";

import { auth } from "@/lib/auth";

export const revalidate = 60; // Revalidate every 60 seconds

const getVotingSettings = unstable_cache(
  async () => {
    try {
      const settings = await prisma.votingSetting.findFirst();
      return settings;
    } catch (error) {
      console.error("Failed to fetch voting settings:", error);
      return null;
    }
  },
  ["voting-settings"],
  { revalidate: 60, tags: ["voting-settings"] }
);

export default async function Home() {
  const settings = await getVotingSettings();
  const session = await auth();
  
  let hasVoted = false;
  if (session?.user) {
    hasVoted = session.user.hasVoted || false;
  }

  // Fallback settings if DB is empty/failing
  const fallbackDate = new Date();
  const fallbackEndDate = new Date(fallbackDate.getTime() + 86400000);
  const startTime = settings?.startTime ? new Date(settings.startTime).toISOString() : fallbackDate.toISOString();
  const endTime = settings?.endTime ? new Date(settings.endTime).toISOString() : fallbackEndDate.toISOString();
  const isOpen = settings?.isOpen || false;
 
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <Image 
          src="/images/bg/university.png"
          alt="University Background"
          fill
          priority
          sizes="100vw"
          className={styles.heroBackground}
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div className={styles.heroOverlay}></div>
        
        <div className={`${styles.heroContent} animate-fade-in`}>
          <div className={styles.logoContainer}>
            <div className={styles.logo}>
              <Image 
                src="https://splytgbmvhobfvyidovq.supabase.co/storage/v1/object/public/voting-duta/logo_duta_kampus.jpeg" 
                alt="Logo Duta" 
                width={100}
                height={100}
                className={styles.logoImage} 
                priority
              />
            </div>
          </div>
          <h1 className={styles.title}>
            Pemilihan Duta Universitas Islam Balitar Blitar 2026
          </h1>
          <p className={styles.subtitle}>
            Tentukan masa depan representasi kampus kita. Satu suara Anda sangat berarti untuk memilih Duta UNISBA Blitar yang berintegritas dan berwawasan luas.
          </p>

          <Countdown 
            startTime={startTime} 
            endTime={endTime} 
            isOpen={isOpen} 
            theme="light" 
          />

          <div style={{ marginTop: "40px", display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
            {!hasVoted && (
              <Link href="/login" className={styles.ctaButton}>
                Masuk untuk Memilih
              </Link>
            )}
            <Link href="/results" className={styles.secondaryButton}>
              Lihat Hasil Langsung
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.infoSection}>
        <div className="container">
          <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Informasi Pemilihan</h2>
          <p style={{ textAlign: "center", color: "var(--color-text-light)" }}>
            Perhatikan aturan dan tahapan sebelum memberikan suara Anda.
          </p>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🔒</div>
              <h3>Aman & Rahasia</h3>
              <p>Sistem ini menjamin kerahasiaan pilihan Anda. Gunakan akun Google kampus untuk memverifikasi identitas Anda dengan aman.</p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>1️⃣</div>
              <h3>Satu Mahasiswa, Satu Suara</h3>
              <p>Setiap mahasiswa hanya memiliki satu kesempatan untuk memilih. Pastikan Anda telah mempertimbangkan pilihan dengan matang.</p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📊</div>
              <h3>Transparan</h3>
              <p>Hasil pemilihan dan log aktivitas dapat dipantau secara langsung untuk memastikan proses demokrasi berjalan dengan jujur dan adil.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>&copy; 2026 Badan Eksekutif Mahasiswa Unisba Blitar. Hak Cipta Dilindungi.</p>
      </footer>
    </main>
  );
}
