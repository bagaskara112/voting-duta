"use client";

import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import CandidateManager from "./CandidateManager";
import { Candidate } from "@/generated/prisma";
import { updateVotingSchedule, toggleVotingStatus, updateMaintenanceSettings, toggleMaintenanceStatus } from "./actions";

interface LogEntry {
  id: string;
  createdAt: string;
  action: string;
  description: string;
  user?: { name: string; email: string } | null;
}

interface ResultEntry {
  id: string;
  name: string;
  voteCount: number;
  percentage: number;
}

interface AdminDashboardProps {
  candidates: Candidate[];
  isVotingOpen: boolean;
  totalVoters: number;
  totalVotes: number;
  logs: LogEntry[];
  results: ResultEntry[];
  settings?: {
    startTime: string;
    endTime: string;
    isMaintenance?: boolean;
    maintenanceTitle?: string | null;
    maintenanceMessage?: string | null;
    maintenanceSecret?: string | null;
  };
}

export default function AdminDashboard({
  candidates,
  isVotingOpen,
  totalVoters,
  totalVotes,
  logs,
  results,
  settings
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // State for Schedule CRUD
  const [startTime, setStartTime] = useState(
    settings?.startTime ? new Date(settings.startTime).toISOString().slice(0, 16) : ""
  );
  const [endTime, setEndTime] = useState(
    settings?.endTime ? new Date(settings.endTime).toISOString().slice(0, 16) : ""
  );
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);

  // State for Maintenance Mode
  const [isMaintenance, setIsMaintenance] = useState(settings?.isMaintenance ?? false);
  const [maintenanceTitle, setMaintenanceTitle] = useState(settings?.maintenanceTitle || "Akses Ditutup");
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    settings?.maintenanceMessage ||
    "Terima kasih atas partisipasi Anda. Sesi aplikasi telah berakhir dan sistem saat ini ditutup untuk mencegah penyalahgunaan data."
  );
  const [maintenanceSecret, setMaintenanceSecret] = useState(settings?.maintenanceSecret || "panitia2026");
  const [isUpdatingMaintenance, setIsUpdatingMaintenance] = useState(false);
  const [copiedBypass, setCopiedBypass] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleUpdateSchedule = async () => {
    if (!startTime || !endTime) return alert("Pilih tanggal mulai dan selesai!");
    setIsUpdatingSchedule(true);
    try {
      const res = await updateVotingSchedule(new Date(startTime).toISOString(), new Date(endTime).toISOString());
      if (res.success) alert("Jadwal pemilihan berhasil diperbarui!");
    } catch {
      alert("Terjadi kesalahan saat memperbarui jadwal.");
    }
    setIsUpdatingSchedule(false);
  };

  const handleQuickToggleMaintenance = async () => {
    const nextState = !isMaintenance;
    const confirmMsg = nextState
      ? "Apakah Anda yakin ingin MENGAKTIFKAN mode pemeliharaan?\n\nSitus publik akan dialihkan ke halaman 'Akses Ditutup', kecuali bagi yang memiliki link/kode akses khusus."
      : "Apakah Anda yakin ingin MENONAKTIFKAN mode pemeliharaan?\n\nSitus akan kembali dibuka dan dapat diakses publik.";
    
    if (!confirm(confirmMsg)) return;

    setIsUpdatingMaintenance(true);
    try {
      const res = await toggleMaintenanceStatus(nextState);
      if (res.success) {
        setIsMaintenance(nextState);
        alert(nextState ? "Mode Pemeliharaan AKTIF! Situs ditutup untuk publik." : "Mode Pemeliharaan DINONAKTIFKAN! Situs dibuka kembali.");
      }
    } catch {
      alert("Gagal mengubah status pemeliharaan.");
    } finally {
      setIsUpdatingMaintenance(false);
    }
  };

  const handleSaveMaintenanceSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceSecret.trim()) {
      return alert("Kode rahasia bypass tidak boleh kosong!");
    }

    setIsUpdatingMaintenance(true);
    try {
      const res = await updateMaintenanceSettings({
        isMaintenance,
        maintenanceTitle: maintenanceTitle.trim() || "Akses Ditutup",
        maintenanceMessage: maintenanceMessage.trim(),
        maintenanceSecret: maintenanceSecret.trim(),
      });
      if (res.success) {
        alert("Pengaturan mode pemeliharaan berhasil disimpan!");
      }
    } catch {
      alert("Terjadi kesalahan saat menyimpan pengaturan pemeliharaan.");
    } finally {
      setIsUpdatingMaintenance(false);
    }
  };

  const bypassUrl = `${origin || ""}/api/maintenance/bypass?key=${encodeURIComponent(maintenanceSecret)}`;

  const handleCopyBypassLink = () => {
    navigator.clipboard.writeText(bypassUrl);
    setCopiedBypass(true);
    setTimeout(() => setCopiedBypass(false), 2500);
  };

  // Calculate Pie Chart logic
  const votedPercentage = totalVoters > 0 ? (totalVotes / totalVoters) * 100 : 0;
  const pieConicGradient = `conic-gradient(var(--color-primary) 0% ${votedPercentage}%, #e0e0e0 ${votedPercentage}% 100%)`;

  return (
    <>
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === "overview" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Ringkasan & Grafik
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === "candidates" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("candidates")}
        >
          Manajemen Kandidat
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === "logs" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          Audit Log
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === "export" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("export")}
        >
          Laporan & Ekspor
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === "maintenance" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("maintenance")}
        >
          Mode Pemeliharaan {isMaintenance && <span style={{ marginLeft: "6px", color: "#ef4444", fontWeight: "bold" }}>● ON</span>}
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="animate-fade-in">
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Perolehan Suara Saat Ini</h3>
              <div style={{ marginTop: "20px" }}>
                {results.length === 0 ? (
                  <p style={{ color: "var(--color-text-light)", textAlign: "center" }}>Belum ada data suara</p>
                ) : (
                  results.map((r) => (
                    <div key={r.id} style={{ marginBottom: "15px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "0.9rem", fontWeight: "bold" }}>
                        <span>{r.name}</span>
                        <span>{r.voteCount} Suara ({r.percentage}%)</span>
                      </div>
                      <div style={{ width: "100%", height: "10px", backgroundColor: "#f0f0f0", borderRadius: "5px", overflow: "hidden" }}>
                        <div style={{ width: `${r.percentage}%`, height: "100%", backgroundColor: "var(--color-primary)", transition: "width 1s" }}></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Tingkat Partisipasi</h3>
              <div className={styles.pieContainer}>
                <div className={styles.pieChart} style={{ background: pieConicGradient }}></div>
                <div className={styles.pieLegend}>
                  <div className={styles.legendItem}>
                    <div>
                      <span className={styles.legendColor} style={{ backgroundColor: "var(--color-primary)" }}></span>
                      Sudah Memilih
                    </div>
                    <strong>{totalVotes}</strong>
                  </div>
                  <div className={styles.legendItem}>
                    <div>
                      <span className={styles.legendColor} style={{ backgroundColor: "#e0e0e0" }}></span>
                      Belum Memilih
                    </div>
                    <strong>{totalVoters - totalVotes}</strong>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.chartCard} style={{ gridColumn: "1 / -1" }}>
              <h3 className={styles.chartTitle}>Atur Jadwal Pemilihan</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem" }}>Waktu Mulai</label>
                  <input 
                    type="datetime-local" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={styles.inputField} 
                  />
                </div>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem" }}>Waktu Berakhir</label>
                  <input 
                    type="datetime-local" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={styles.inputField} 
                  />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button 
                    onClick={handleUpdateSchedule}
                    disabled={isUpdatingSchedule}
                    className={styles.primaryBtn}
                    style={{ height: "42px", padding: "0 20px" }}
                  >
                    {isUpdatingSchedule ? "Menyimpan..." : "Simpan Jadwal"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "candidates" && (
        <div className="animate-fade-in">
          <CandidateManager initialCandidates={candidates} isVotingOpen={isVotingOpen} />
        </div>
      )}

      {activeTab === "logs" && (
        <div className="animate-fade-in">
          <div className={styles.logsCard}>
            <h3 className={styles.chartTitle}>Sistem Audit Log</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--color-text-light)", marginBottom: "20px" }}>
              Menampilkan 50 aktivitas terakhir di sistem. Log ini mencatat kapan pemilih masuk dan memberikan suara, tanpa merekam pilihan mereka.
            </p>
            <table className={styles.logsTable}>
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>User / Email</th>
                  <th>Tindakan</th>
                  <th>Deskripsi Lengkap</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: "center" }}>Belum ada log aktivitas.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.createdAt).toLocaleString("id-ID")}</td>
                      <td>{log.user ? `${log.user.name} (${log.user.email})` : "Sistem"}</td>
                      <td>
                        <span className={`${styles.badgeLog} ${
                          log.action === "login" ? styles.badgeLogin : 
                          log.action === "vote" ? styles.badgeVote : styles.badgeAdmin
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td>{log.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "export" && (
        <div className="animate-fade-in" style={{ display: "flex", justifyContent: "center" }}>
          <div className={styles.exportCard} style={{ maxWidth: "500px", width: "100%" }}>
            <h3 className={styles.chartTitle}>Laporan Rekapitulasi</h3>
            <p style={{ color: "var(--color-text-light)", marginBottom: "30px", lineHeight: "1.5" }}>
              Unduh laporan rekapitulasi pemilihan dalam format CSV. Laporan ini mencakup perolehan suara akhir tiap kandidat dan daftar kehadiran pemilih (siapa saja yang sudah menggunakan hak suaranya).
            </p>
            <a href="/api/export" target="_blank" rel="noopener noreferrer" className={styles.exportBtn}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Laporan CSV
            </a>
          </div>
        </div>
      )}

      {activeTab === "maintenance" && (
        <div className="animate-fade-in">
          <div className={styles.maintenanceCard}>
            {/* Status Banner */}
            <div className={`${styles.maintenanceStatusBanner} ${isMaintenance ? styles.maintenanceActiveBanner : styles.maintenanceInactiveBanner}`}>
              <div>
                <h3 style={{ margin: "0 0 5px 0", fontSize: "1.1rem" }}>
                  Status Mode Pemeliharaan: <strong>{isMaintenance ? "AKTIF (Situs Ditutup)" : "NONAKTIF (Situs Terbuka)"}</strong>
                </h3>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  {isMaintenance 
                    ? "Pengunjung umum dialihkan ke halaman Akses Ditutup. Hanya pengguna dengan izin/link bypass yang bisa mengakses web."
                    : "Situs web beroperasi normal dan dapat diakses oleh publik."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickToggleMaintenance}
                disabled={isUpdatingMaintenance}
                className={`${styles.maintenanceToggleBtn} ${isMaintenance ? styles.maintenanceToggleBtnOn : styles.maintenanceToggleBtnOff}`}
              >
                {isUpdatingMaintenance ? "Memproses..." : isMaintenance ? "Matikan Maintenance" : "Aktifkan Maintenance"}
              </button>
            </div>

            {/* Bypass Link Box */}
            <div className={styles.bypassBox}>
              <h4 style={{ margin: "0 0 8px 0", color: "var(--color-primary-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🔑</span> Akses Khusus untuk Panitia / Orang Tertentu
              </h4>
              <p style={{ fontSize: "0.9rem", color: "var(--color-text-light)", margin: "0 0 12px 0", lineHeight: "1.5" }}>
                Bagikan tautan ini ke orang tertentu (panitia, rektorat, tester). Ketika mereka membuka tautan ini, browser mereka otomatis diberikan akses bypass tanpa harus mendaftarkan akun satu per satu.
              </p>
              <div className={styles.bypassUrlDisplay}>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {bypassUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyBypassLink}
                  className={styles.copyBtn}
                >
                  {copiedBypass ? "✓ Tersalin!" : "Salin Link Akses"}
                </button>
              </div>
            </div>

            {/* Form Settings */}
            <form onSubmit={handleSaveMaintenanceSettings}>
              <h4 style={{ margin: "25px 0 15px 0", color: "var(--color-primary-dark)" }}>
                Kustomisasi Halaman Pemeliharaan
              </h4>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "0.9rem" }}>
                  Kode Rahasia Bypass (Passcode)
                </label>
                <input
                  type="text"
                  value={maintenanceSecret}
                  onChange={(e) => setMaintenanceSecret(e.target.value)}
                  placeholder="Contoh: panitia2026"
                  required
                  className={styles.inputField}
                  style={{ width: "100%", maxWidth: "400px" }}
                />
                <small style={{ display: "block", color: "var(--color-text-light)", marginTop: "4px" }}>
                  Kode ini dipakai pada tautan bypass dan juga bisa diketik manual di halaman pemeliharaan.
                </small>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "0.9rem" }}>
                  Judul Halaman Pemeliharaan
                </label>
                <input
                  type="text"
                  value={maintenanceTitle}
                  onChange={(e) => setMaintenanceTitle(e.target.value)}
                  placeholder="Akses Ditutup"
                  required
                  className={styles.inputField}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", fontSize: "0.9rem" }}>
                  Pesan / Penjelasan untuk Pengunjung
                </label>
                <textarea
                  rows={4}
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="Tulis pesan alasan penutupan akses di sini..."
                  required
                  className={styles.inputField}
                  style={{ width: "100%", resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <button
                  type="submit"
                  disabled={isUpdatingMaintenance}
                  className={styles.primaryBtn}
                  style={{ padding: "12px 25px" }}
                >
                  {isUpdatingMaintenance ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
