"use client";

import { useState } from "react";
import styles from "./admin.module.css";
import Modal from "@/components/Modal/Modal";
import { Candidate } from "@prisma/client";
import { addCandidate, updateCandidate, deleteCandidate, toggleVotingStatus } from "./actions";

interface CandidateManagerProps {
  initialCandidates: Candidate[];
  isVotingOpen: boolean;
}

export default function CandidateManager({ initialCandidates, isVotingOpen }: CandidateManagerProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [isOpen, setIsOpen] = useState(isVotingOpen);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "error" | "success" } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    order: "",
    name: "",
    faculty: "",
    major: "",
    vision: "",
    mission: "",
    photoUrl: "",
    isActive: true
  });

  const handleToggleVoting = async () => {
    setIsLoading(true);
    try {
      const res = await toggleVotingStatus(!isOpen);
      if (res.success) setIsOpen(res.isOpen);
    } catch (e) {
      alert("Gagal mengubah status voting.");
    }
    setIsLoading(false);
  };

  const openAddModal = () => {
    setSelectedCandidate(null);
    setFormData({
      order: (candidates.length + 1).toString(),
      name: "",
      faculty: "",
      major: "",
      vision: "",
      mission: "",
      photoUrl: "",
      isActive: true
    });
    setNotification(null);
    setIsModalOpen(true);
  };

  const openEditModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setFormData({
      order: candidate.order.toString(),
      name: candidate.name,
      faculty: candidate.faculty,
      major: candidate.major,
      vision: candidate.vision,
      mission: candidate.mission,
      photoUrl: candidate.photoUrl || "",
      isActive: candidate.isActive
    });
    setNotification(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setNotification(null);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCandidate = async () => {
    setIsLoading(true);
    setNotification(null);
    
    try {
      if (selectedCandidate) {
        // Edit
        const res = await updateCandidate(selectedCandidate.id, formData);
        if (res.success && res.candidate) {
          setCandidates(candidates.map(c => c.id === selectedCandidate.id ? res.candidate : c));
          setIsModalOpen(false);
        }
      } else {
        // Add
        const res = await addCandidate(formData);
        if (res.success && res.candidate) {
          setCandidates([...candidates, res.candidate].sort((a, b) => a.order - b.order));
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      setNotification({ message: "Terjadi kesalahan saat menyimpan data.", type: "error" });
    }
    setIsLoading(false);
  };

  const handleDeleteCandidate = async () => {
    if (!selectedCandidate) return;
    setIsLoading(true);
    setNotification(null);
    
    try {
      const res = await deleteCandidate(selectedCandidate.id);
      if (res.success) {
        setCandidates(candidates.filter(c => c.id !== selectedCandidate.id));
        setIsDeleteModalOpen(false);
      } else {
        setNotification({ message: res.message || "Gagal menghapus.", type: "error" });
      }
    } catch (error) {
      setNotification({ message: "Terjadi kesalahan server.", type: "error" });
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className={styles.controlsSection}>
        <div className={styles.controlInfo}>
          <h3>Status Sistem Pemilihan</h3>
          <p>
            Saat ini sistem dalam keadaan: 
            <span className={`${styles.statusBadge} ${isOpen ? styles.statusOpen : styles.statusClosed}`}>
              {isOpen ? "DIBUKA" : "DITUTUP"}
            </span>
          </p>
        </div>
        <button 
          className={`${styles.toggleButton} ${isOpen ? styles.btnClose : styles.btnOpen}`}
          onClick={handleToggleVoting}
          disabled={isLoading}
        >
          {isOpen ? "Tutup Pemilihan Sekarang" : "Buka Pemilihan Sekarang"}
        </button>
      </div>

      <div className={styles.sectionHeader}>
        <h2 style={{ color: "var(--color-primary-dark)" }}>Manajemen Kandidat</h2>
        <button className={styles.addButton} onClick={openAddModal}>
          + Tambah Kandidat Baru
        </button>
      </div>

      <div className={styles.candidateGrid}>
        {candidates.map(candidate => (
          <div key={candidate.id} className={styles.candidateCard}>
            <div className={styles.candidateOrder}>{candidate.order}</div>
            <div className={styles.candidateDetails}>
              <div className={styles.candidateName}>{candidate.name}</div>
              <div className={styles.candidateFaculty}>{candidate.faculty}</div>
              <div className={styles.cardActions}>
                <button className={styles.editBtn} onClick={() => openEditModal(candidate)}>Edit</button>
                <button className={styles.deleteBtn} onClick={() => openDeleteModal(candidate)}>Hapus</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleSaveCandidate}
        title={selectedCandidate ? "Edit Kandidat" : "Tambah Kandidat Baru"}
        confirmText="Simpan"
        isLoading={isLoading}
      >
        {notification && (
          <div style={{ color: "var(--color-error)", marginBottom: "15px", padding: "10px", background: "rgba(231, 76, 60, 0.1)", borderRadius: "4px" }}>
            {notification.message}
          </div>
        )}
        
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: "15px" }}>
          <div className={styles.formGroup}>
            <label>No. Urut</label>
            <input 
              type="number" 
              className={styles.input} 
              value={formData.order} 
              onChange={e => setFormData({...formData, order: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Nama Lengkap</label>
            <input 
              type="text" 
              className={styles.input} 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <div className={styles.formGroup}>
            <label>Fakultas</label>
            <input 
              type="text" 
              className={styles.input} 
              value={formData.faculty} 
              onChange={e => setFormData({...formData, faculty: e.target.value})}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Program Studi</label>
            <input 
              type="text" 
              className={styles.input} 
              value={formData.major} 
              onChange={e => setFormData({...formData, major: e.target.value})}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>URL Foto (Opsional)</label>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="https://..."
            value={formData.photoUrl} 
            onChange={e => setFormData({...formData, photoUrl: e.target.value})}
          />
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-light)", marginTop: "4px" }}>
            Untuk saat ini, masukkan link URL gambar (misal dari Google Drive/Imgur).
          </p>
        </div>

        <div className={styles.formGroup}>
          <label>Visi</label>
          <textarea 
            className={`${styles.input} ${styles.textarea}`} 
            value={formData.vision} 
            onChange={e => setFormData({...formData, vision: e.target.value})}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Misi</label>
          <textarea 
            className={`${styles.input} ${styles.textarea}`} 
            value={formData.mission} 
            onChange={e => setFormData({...formData, mission: e.target.value})}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCandidate}
        title="Konfirmasi Hapus"
        confirmText="Ya, Hapus"
        isLoading={isLoading}
      >
        {notification && (
          <div style={{ color: "var(--color-error)", marginBottom: "15px", padding: "10px", background: "rgba(231, 76, 60, 0.1)", borderRadius: "4px" }}>
            {notification.message}
          </div>
        )}
        <p>Apakah Anda yakin ingin menghapus kandidat <strong>{selectedCandidate?.name}</strong>?</p>
        <p style={{ color: "var(--color-error)", fontSize: "0.9rem", marginTop: "10px" }}>
          Peringatan: Kandidat tidak bisa dihapus jika sudah ada pemilih yang memberikan suara kepadanya.
        </p>
      </Modal>
    </>
  );
}
