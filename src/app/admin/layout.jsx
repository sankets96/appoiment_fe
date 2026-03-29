'use client';

import { useAppStore } from '@/lib/store-client';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminLayout({ children }) {
  const { user, isAuthenticated } = useAppStore();

  if (!isAuthenticated || user?.role !== 'admin') {
    redirect('/auth/login');
  }

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
