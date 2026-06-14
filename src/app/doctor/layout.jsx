'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store-client';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DoctorLayout({ children }) {
  const { user, isAuthenticated, isLoading, initSession } = useAppStore();

  // Initialize session after mount
  useEffect(() => {
    initSession();
  }, [initSession]);

  // Show nothing while loading to prevent flash
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#fafaf8'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏥</div>
          <div style={{ color: 'var(--muted)' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'doctor') {
    redirect('/auth/login');
  }

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}