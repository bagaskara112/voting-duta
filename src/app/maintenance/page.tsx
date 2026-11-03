import React from 'react';
import { redirect } from 'next/navigation';
import { getMaintenanceConfig } from '@/lib/maintenance';
import { cookies } from 'next/headers';
import BypassForm from './BypassForm';
import Link from 'next/link';

export const revalidate = 0; // Dynamic

interface MaintenancePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MaintenancePage(props: MaintenancePageProps) {
  const searchParams = await props.searchParams;
  const bypassParam = searchParams?.bypass;

  // If URL has ?bypass=XYZ, forward to bypass API to verify and set cookie
  if (typeof bypassParam === "string" && bypassParam) {
    redirect(`/api/maintenance/bypass?key=${encodeURIComponent(bypassParam)}`);
  }

  // Check if user already has bypass cookie
  const cookieStore = await cookies();
  const hasBypassCookie = cookieStore.get("maintenance_bypass")?.value === "true";
  if (hasBypassCookie) {
    redirect("/");
  }

  const config = await getMaintenanceConfig();

  // If maintenance is OFF, redirect visitors back to home
  if (!config.isMaintenance) {
    redirect("/");
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
          <svg style={{ width: '80px', height: '80px', color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', marginTop: 0 }}>
          {config.maintenanceTitle}
        </h1>
        <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.6', margin: '0 auto', maxWidth: '440px', whiteSpace: 'pre-line' }}>
          {config.maintenanceMessage}
        </p>

        {/* Form Akses Khusus Panitia / Bypass */}
        <BypassForm />

        <div style={{ marginTop: '20px' }}>
          <Link
            href="/login"
            style={{
              fontSize: '12px',
              color: '#9ca3af',
              textDecoration: 'none',
            }}
          >
            Masuk sebagai Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
