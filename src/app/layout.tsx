import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pemilihan Duta Universitas 2026",
  description: "Sistem E-Voting Resmi Pemilihan Duta Universitas 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
