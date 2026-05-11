import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import styles from "./admin.module.css";
import AdminDashboard from "./AdminDashboard";
import Link from "next/link";
import LogoutButton from "../dashboard/LogoutButton";
import Image from "next/image";

export const revalidate = 0; // Don't cache admin dashboard

export default async function AdminPage() {
  const session = await auth();

  // 1. Strict Security Check
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/"); // Kick out voters or unauthenticated users
  }

  // 2. Fetch Dashboard Data
  const [candidates, settings, totalVoters, totalVotes, logs] = await Promise.all([
    prisma.candidate.findMany({ orderBy: { order: "asc" } }),
    prisma.votingSetting.findFirst(),
    prisma.user.count({ where: { role: "VOTER" } }),
    prisma.vote.count(),
    prisma.voteLog.findMany({ 
      take: 50, 
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } }
    }),
  ]);

  // Aggregate results for the chart
  const voteCounts = await prisma.vote.groupBy({
    by: ["candidateId"],
    _count: { id: true },
  });

  const results = candidates.map(candidate => {
    const voteData = voteCounts.find(v => v.candidateId === candidate.id);
    const voteCount = voteData?._count.id || 0;
    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
    
    return {
      ...candidate,
      voteCount,
      percentage: Number(percentage.toFixed(2))
    };
  }).sort((a, b) => b.voteCount - a.voteCount);

  const isOpen = settings?.isOpen || false;
  const participationRate = totalVoters > 0 ? ((totalVotes / totalVoters) * 100).toFixed(1) : 0;

  return (
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <div className={`container ${styles.headerContent}`}>
          <div className={styles.logo}>
            <Image 
              src="https://splytgbmvhobfvyidovq.supabase.co/storage/v1/object/public/voting-duta/logo_duta_kampus.jpeg" 
              alt="Logo Duta" 
              width={30}
              height={30}
              style={{ borderRadius: "50%", objectFit: "cover", marginRight: "10px" }}
            />
            DUTA UNISBA BLITAR 2026 | ADMIN PANEL
          </div>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", textDecoration: "none" }}>
              Lihat Web Publik
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container">
        <div className={styles.mainContent}>
          <h1 className={styles.pageTitle}>Dashboard Admin</h1>

          {/* Stats Overview */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statTitle}>Total Pemilih Terdaftar</div>
              <div className={styles.statValue}>{totalVoters}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statTitle}>Total Suara Masuk</div>
              <div className={styles.statValue} style={{ color: "var(--color-success)" }}>{totalVotes}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statTitle}>Tingkat Partisipasi</div>
              <div className={styles.statValue} style={{ color: "var(--color-accent)" }}>{participationRate}%</div>
            </div>
          </div>

          {/* Admin Dashboard Tabs */}
          <AdminDashboard 
            candidates={candidates} 
            isVotingOpen={isOpen} 
            totalVoters={totalVoters}
            totalVotes={totalVotes}
            logs={logs.map(log => ({
              ...log,
              createdAt: log.createdAt.toISOString(),
              description: log.description || ""
            }))}
            results={results}
          />
        </div>
      </main>
    </div>
  );
}
 