import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import MobileBottomNav from './MobileBottomNav';

export default function Layout({
  children,
  activeTab,
  onNavigate,
  onOpenSettings,
  onSelectApp
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-layout">
      {/* Left Sidebar (clean 4 main tabs) */}
      <Sidebar
        activeTab={activeTab}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content Area */}
      <div className="app-main">
        <TopNavbar
          activeTab={activeTab}
          onNavigate={onNavigate}
          onOpenSettings={onOpenSettings}
          onSelectApp={onSelectApp}
        />

        <main className="content-wrapper">
          {children}
        </main>
      </div>

      {/* Responsive Mobile Bottom Navbar */}
      <MobileBottomNav
        activeTab={activeTab}
        onNavigate={onNavigate}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
}
