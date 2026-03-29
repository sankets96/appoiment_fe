'use client';

import { Sidebar } from '@/components/layout/Sidebar';

export function DashboardLayout({ children, user }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar user={user} />
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 32,
          background: 'var(--bg)',
        }}
      >
        {children}
      </main>
    </div>
  );
}
