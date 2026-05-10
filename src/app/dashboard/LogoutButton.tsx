"use client";

import { signOut } from "next-auth/react";
import styles from "./dashboard.module.css";

export default function LogoutButton() {
  return (
    <button 
      className={styles.logoutButton}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Keluar
    </button>
  );
}
