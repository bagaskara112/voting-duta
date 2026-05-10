"use client";

import { useState, useEffect } from "react";
import styles from "./Countdown.module.css";

interface CountdownProps {
  startTime: string;
  endTime: string;
  isOpen: boolean;
  theme?: "light" | "dark"; // dark for light backgrounds, light for dark backgrounds (glassmorphism)
}

export default function Countdown({
  startTime,
  endTime,
  isOpen,
  theme = "light",
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const [status, setStatus] = useState<"waiting" | "open" | "closed">("waiting");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();

      let target = start;

      if (now < start) {
        setStatus("waiting");
        target = start;
      } else if (now >= start && now <= end && isOpen) {
        setStatus("open");
        target = end;
      } else {
        setStatus("closed");
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        // Trigger a re-evaluation
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime, isOpen]);

  if (!timeLeft) {
    return null; // Don't render until mounted to avoid hydration mismatch
  }

  if (status === "closed") {
    return (
      <div className={`${styles.statusMessage} ${styles.statusClosed}`}>
        Sesi Pemilihan Telah Ditutup
      </div>
    );
  }

  const boxClass = `${styles.timeBox} ${theme === "dark" ? styles.darkBox : ""}`;

  return (
    <div>
      {status === "waiting" && (
        <p className={theme === "dark" ? styles.labelDark : styles.label}>
          Pemilihan akan dimulai dalam:
        </p>
      )}
      {status === "open" && (
        <p className={theme === "dark" ? styles.labelDark : styles.label}>
          Sisa Waktu Pemilihan:
        </p>
      )}

      <div className={styles.countdownContainer}>
        <div className={boxClass}>
          <span className={styles.number}>
            {timeLeft.days.toString().padStart(2, "0")}
          </span>
          <span className={styles.label}>Hari</span>
        </div>
        <div className={boxClass}>
          <span className={styles.number}>
            {timeLeft.hours.toString().padStart(2, "0")}
          </span>
          <span className={styles.label}>Jam</span>
        </div>
        <div className={boxClass}>
          <span className={styles.number}>
            {timeLeft.minutes.toString().padStart(2, "0")}
          </span>
          <span className={styles.label}>Menit</span>
        </div>
        <div className={boxClass}>
          <span className={styles.number}>
            {timeLeft.seconds.toString().padStart(2, "0")}
          </span>
          <span className={styles.label}>Detik</span>
        </div>
      </div>
    </div>
  );
}
