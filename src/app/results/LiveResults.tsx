"use client";

import { useState, useEffect } from "react";
import styles from "./results.module.css";
import { Candidate } from "@prisma/client";

interface CandidateResult extends Candidate {
  voteCount: number;
  percentage: number;
}

interface VoteLog {
  id: string;
  action: string;
  description: string;
  createdAt: string;
}

export default function LiveResults() {
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [logs, setLogs] = useState<VoteLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [resResults, resLogs] = await Promise.all([
        fetch("/api/results"),
        fetch("/api/logs")
      ]);

      const dataResults = await resResults.json();
      const dataLogs = await resLogs.json();

      if (dataResults.success) {
        setResults(dataResults.data);
        setTotalVotes(dataResults.totalVotesAll);
      }
      
      if (dataLogs.success) {
        setLogs(dataLogs.data);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching live data:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Poll every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "var(--color-text-light)" }}>
        <h2>Memuat Data Live...</h2>
      </div>
    );
  }

  // Find the highest vote count to determine who is "winning" (gets the gold bar/avatar)
  const highestVotes = results.length > 0 ? results[0].voteCount : 0;

  return (
    <div className={styles.contentWrapper}>
      {/* Chart Section */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h2 style={{ color: "var(--color-primary-dark)" }}>Perolehan Suara</h2>
          <div className={styles.totalVotes}>
            Total Suara Masuk: <span>{totalVotes}</span>
          </div>
        </div>

        <div>
          {results.map((candidate, index) => {
            const isLeading = candidate.voteCount === highestVotes && highestVotes > 0;
            
            return (
              <div key={candidate.id} className={styles.candidateRow}>
                <div className={`${styles.candidateAvatar} ${isLeading ? styles.goldAvatar : ''}`}>
                  {candidate.order.toString().padStart(2, "0")}
                </div>
                
                <div className={styles.barWrapper}>
                  <div className={styles.barHeader}>
                    <div className={styles.barName}>{candidate.name}</div>
                    <div className={styles.barStats}>
                      {candidate.voteCount} Suara (<span>{candidate.percentage}%</span>)
                    </div>
                  </div>
                  
                  <div className={styles.barTrack}>
                    <div 
                      className={`${styles.barFill} ${isLeading ? styles.barFillGold : ''}`}
                      style={{ width: `${candidate.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticker Section */}
      <div className={styles.tickerCard}>
        <div className={styles.tickerHeader}>
          <div className={styles.liveIndicator}></div>
          <h3 style={{ margin: 0, color: "var(--color-primary-dark)" }}>Log Transparansi</h3>
        </div>
        
        <div className={styles.tickerList}>
          {logs.length === 0 ? (
            <p style={{ color: "var(--color-text-light)", textAlign: "center", marginTop: "20px" }}>
              Belum ada suara yang masuk.
            </p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={styles.logItem}>
                <div className={styles.logTime}>
                  {new Date(log.createdAt).toLocaleTimeString("id-ID", { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  })}
                </div>
                <div className={styles.logDesc}>{log.description}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
