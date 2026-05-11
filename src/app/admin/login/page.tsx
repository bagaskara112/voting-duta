"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "../../login/login.module.css";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("admin-login", {
        redirect: false,
        username,
        password,
      });

      if (res?.error) {
        setError("Username atau password salah");
        setIsLoading(false);
      } else {
        router.push("/admin"); // Redirect directly to /admin, NOT /dashboard
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };
 
  return (
    <div className={styles.container}>
      <div className={`${styles.loginCard} animate-fade-in`}>
        <Link href="/" className={styles.backLink}>
          ← Kembali ke Beranda
        </Link>
        <div className={styles.header}>
          <h1 className={styles.title}>Portal Admin</h1>
          <p className={styles.subtitle}>
            Area khusus panitia pemilihan
          </p>
        </div>

        <div className={styles.content}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleAdminLogin}>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>
                Username
              </label>
              <input
                type="text"
                id="username"
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
