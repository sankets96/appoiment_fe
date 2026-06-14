'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { useState } from 'react';

export function DashboardLayout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }} className="dashboard-layout">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
          className="sidebar-backdrop"
        />
      )}

      {/* Sidebar - hidden on mobile/tablet */}
      <div className={`sidebar-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div style={{ height: '100%' }}>
          <Sidebar user={user} />
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'var(--sage)',
          color: '#fff',
          border: 'none',
          fontSize: 20,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 50,
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="mobile-menu-btn"
      >
        ☰
      </button>

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 32,
          background: 'var(--bg)',
        }}
        className="dashboard-main"
      >
        {children}
      </main>
    </div>
  );
}
