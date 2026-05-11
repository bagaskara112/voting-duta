"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";
import Modal from "@/components/Modal/Modal";
import { Candidate } from "@/generated/prisma";

interface CandidateGridProps {
  candidates: Candidate[];
  hasVoted: boolean;
  isOpen: boolean; // Is the election currently open based on VotingSetting?
}

export default function CandidateGrid({ candidates, hasVoted, isOpen }: CandidateGridProps) {
  const router = useRouter();
  
  // Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState<{ message: string; type: "error" | "success" } | null>(null);

  const handleSelectClick = (candidate: Candidate) => {
    if (hasVoted || !isOpen) return;
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
    setNotification(null);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;
    
    setIsSubmitting(true);
    setNotification(null);

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: selectedCandidate.id }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsModalOpen(false);
        // Redirect to the public results page after a successful vote
        // Using replace so they can't hit the 'back' button to return to the voting page
        router.replace("/results");
        router.refresh(); // Refresh the router cache
      } else {
        setNotification({ message: data.message || "Gagal merekam suara.", type: "error" });
        setIsSubmitting(false);
      }
    } catch (error) {
      setNotification({ message: "Terjadi kesalahan jaringan. Silakan coba lagi.", type: "error" });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.grid}>
        {candidates.map((candidate) => (
          <div key={candidate.id} className={styles.card}>
            {/* Photo Placeholder */}
            <div className={styles.photoPlaceholder}>
              {candidate.order.toString().padStart(2, "0")}
            </div>
            
            <div className={styles.cardContent}>
              <h4 className={styles.candidateName}>{candidate.name}</h4>
              <p className={styles.candidateInfo}>
                {candidate.faculty} <br />
                {candidate.major}
              </p>
              
              <button 
                className={styles.viewButton} 
                disabled={hasVoted || !isOpen}
                onClick={() => handleSelectClick(candidate)}
                style={{ 
                  cursor: (hasVoted || !isOpen) ? "not-allowed" : "pointer",
                  opacity: (hasVoted || !isOpen) ? 0.6 : 1
                }}
              >
                {hasVoted ? "Anda Sudah Memilih" : !isOpen ? "Pemilihan Ditutup" : "Pilih Kandidat"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmVote}
        title="Konfirmasi Pilihan Anda"
        isLoading={isSubmitting}
        confirmText="Ya, Saya Yakin"
        cancelText="Batal"
      >
        {selectedCandidate && (
          <div>
            {notification && (
              <div style={{ 
                padding: "10px", 
                marginBottom: "20px", 
                borderRadius: "4px",
                backgroundColor: notification.type === "error" ? "rgba(231,76,60,0.1)" : "rgba(39,174,96,0.1)",
                color: notification.type === "error" ? "var(--color-error)" : "var(--color-success)",
                border: `1px solid ${notification.type === "error" ? "rgba(231,76,60,0.3)" : "rgba(39,174,96,0.3)"}`
              }}>
                {notification.message}
              </div>
            )}
            
            <p style={{ marginBottom: "20px", fontSize: "1.1rem" }}>
              Anda akan memberikan suara untuk:
            </p>
            
            <div style={{ 
              background: "var(--color-bg)", 
              padding: "20px", 
              borderRadius: "8px", 
              borderLeft: "4px solid var(--color-primary)",
              marginBottom: "20px"
            }}>
              <h3 style={{ color: "var(--color-primary-dark)", marginBottom: "5px" }}>
                {selectedCandidate.order.toString().padStart(2, "0")} - {selectedCandidate.name}
              </h3>
              <p style={{ color: "var(--color-text-light)", fontSize: "0.9rem", marginBottom: "15px" }}>
                {selectedCandidate.faculty} | {selectedCandidate.major}
              </p>
              
              <div style={{ marginBottom: "15px" }}>
                <strong>Visi:</strong>
                <p style={{ fontSize: "0.95rem", fontStyle: "italic", marginTop: "5px" }}>"{selectedCandidate.vision}"</p>
              </div>
              
              <div>
                <strong>Misi Utama:</strong>
                <p style={{ fontSize: "0.95rem", whiteSpace: "pre-wrap", marginTop: "5px" }}>{selectedCandidate.mission.split("\n")[0]}</p>
              </div>
            </div>

            <div style={{ 
              padding: "15px", 
              backgroundColor: "rgba(242, 201, 76, 0.1)", 
              borderLeft: "4px solid var(--color-accent)",
              borderRadius: "0 4px 4px 0"
            }}>
              <p style={{ margin: 0, fontWeight: 600, color: "var(--color-text)" }}>
                Peringatan:
              </p>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-text-light)" }}>
                Pilihan ini bersifat final. Anda hanya memiliki satu kali kesempatan untuk memilih dan tidak dapat diubah setelah dikonfirmasi.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
