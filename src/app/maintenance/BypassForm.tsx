"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BypassForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/maintenance/bypass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: passcode.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Successfully verified bypass!
        router.push("/?access=granted");
        router.refresh();
      } else {
        setError(data.message || "Kode akses tidak sesuai.");
      }
    } catch {
      setError("Terjadi kesalahan saat memverifikasi kode.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "32px", borderTop: "1px solid #e5e7eb", paddingTop: "24px" }}>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            background: "none",
            border: "none",
            color: "#6b7280",
            fontSize: "14px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "6px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1f2937")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
        >
          <span>🔑</span> Punya Kode Akses Khusus?
        </button>
      ) : (
        <form onSubmit={handleSubmit} style={{ animation: "fadeIn 0.3s ease-in-out" }}>
          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px", marginTop: 0 }}>
            Masukkan kode akses khusus untuk panitia atau penguji:
          </p>

          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            <input
              type="text"
              placeholder="Masukkan kode rahasia..."
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (error) setError(null);
              }}
              required
              autoFocus
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
                fontSize: "14px",
                outline: "none",
                width: "200px",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "#1f2937",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Memeriksa..." : "Buka Akses"}
            </button>
          </div>

          {error && (
            <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "8px", marginBottom: 0 }}>
              {error}
            </p>
          )}

          <div style={{ marginTop: "12px" }}>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError(null);
                setPasscode("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "#9ca3af",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

