"use client";

import { useState } from "react";
import styles from "./admin.module.css";
import CandidateManager from "./CandidateManager";
import { Candidate } from "@prisma/client";
import Link from "next/link";

interface AdminDashboardProps {
  candidates: Candidate[];
  isVotingOpen: boolean;
  totalVoters: number;
  totalVotes: number;
  logs: any[];
  results: any[];
}

export default function AdminDashboard({
  candidates,
  isVotingOpen,
  totalVoters,
  totalVotes,
  logs,
  results
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate Pie Chart logic
  const votedPercentage = totalVoters > 0 ? (totalVotes / totalVoters) * 100 : 0;
  const notVotedPercentage = 100 - votedPercentage;
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
                  results.map((r: any) => (
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
                  logs.map((log: any) => (
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
    </>
  );
}
