import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import styles from "./dashboard.module.css";
import Countdown from "@/components/Countdown/Countdown";
import LogoutButton from "./LogoutButton";
import CandidateGrid from "./CandidateGrid";
import Image from "next/image";

export const revalidate = 0; // Don't cache this page (dynamic per user)

async function getDashboardData(userId: string) {
  const [user, settings, candidates] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.votingSetting.findFirst(),
    prisma.candidate.findMany({
      orderBy: { order: "asc" },
      where: { isActive: true },
    }),
  ]);

  return { user, settings, candidates };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Admins should probably have a separate dashboard, but for now we handle them here
  if (session.user.role === "ADMIN") {
    // Phase 5 will handle real admin panel. For now, just show a message.
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.mainContent}>
          <div className="container">
            <div className={styles.statusBanner}>
              <h2 className={styles.statusTitle}>Selamat Datang, Admin</h2>
              <p className={styles.statusText}>Panel Admin sedang dalam tahap pengembangan (Phase 5).</p>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { user, settings, candidates } = await getDashboardData(session.user.id);

  if (!user) {
    // Edge case: session exists but user deleted from DB
    redirect("/login");
  }

  if (user.hasVoted) {
    redirect("/results");
  }

  const fallbackDate = new Date();
  const fallbackEndDate = new Date(fallbackDate.getTime() + 86400000);
  const startTime = settings?.startTime ? new Date(settings.startTime).toISOString() : fallbackDate.toISOString();
  const endTime = settings?.endTime ? new Date(settings.endTime).toISOString() : fallbackEndDate.toISOString();
  const isOpen = settings?.isOpen || false;
   
  // Use a combination of DB isOpen and time to determine actual logic
  const now = new Date();
  const isTimeOpen = now >= new Date(startTime) && now <= new Date(endTime);
  const isActuallyOpen = isOpen && isTimeOpen;

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div className={`container ${styles.headerContent}`}>
          <div className={styles.logo}>
            <Image 
              src="https://splytgbmvhobfvyidovq.supabase.co/storage/v1/object/public/voting-duta/logo_duta_kampus.jpeg" 
              alt="Logo Duta" 
              width={40}
              height={40}
              style={{ borderRadius: "50%", objectFit: "cover", marginRight: "10px" }}
            />
            DUTA UNISBA BLITAR 2026
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className="container">
          {/* Status Banner */}
          <div className={`${styles.statusBanner} ${user.hasVoted ? styles.votedBanner : ""}`}>
            <h2 className={styles.statusTitle}>
              {user.hasVoted ? "Terima Kasih Telah Memilih!" : "Status Akun: Belum Memilih"}
            </h2>
            <p className={styles.statusText}>
              {user.hasVoted 
                ? "Hak suara Anda telah terekam di dalam sistem secara rahasia dan aman."
                : "Anda memiliki hak untuk memberikan satu (1) suara. Pilihlah dengan bijak."}
            </p>
            
            {!user.hasVoted && (
              <Countdown 
                startTime={startTime} 
                endTime={endTime} 
                isOpen={isOpen} 
                theme="dark"
              />
            )}
          </div>

          {/* Candidate Grid */}
          <div className={styles.candidateSection}>
            <div className={styles.sectionHeader}>
              <h3 style={{ fontSize: "1.5rem", color: "var(--color-primary-dark)" }}>
                Daftar Kandidat Duta UNISBA Blitar
              </h3>
              <span style={{ color: "var(--color-text-light)" }}>
                Total: {candidates.length} Kandidat
              </span>
            </div>

            <CandidateGrid 
              candidates={candidates} 
              hasVoted={user.hasVoted} 
              isOpen={isActuallyOpen} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}
