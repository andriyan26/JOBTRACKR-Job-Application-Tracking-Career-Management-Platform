import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react';

export default function MobileBottomNav({ activeTab, onNavigate, onOpenSettings }) {
  return (
    <nav className="mobile-bottom-nav">
      <button
        className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onNavigate('dashboard')}
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </button>

      <button
        className={`mobile-nav-item ${activeTab === 'applications' ? 'active' : ''}`}
        onClick={() => onNavigate('applications')}
      >
        <Briefcase size={20} />
        <span>Applications</span>
      </button>

      <button
        className={`mobile-nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
        onClick={() => onNavigate('calendar')}
      >
        <Calendar size={20} />
        <span>Calendar</span>
      </button>

      <button
        className={`mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => onNavigate('analytics')}
      >
        <BarChart3 size={20} />
        <span>Analytics</span>
      </button>

      <button
        className="mobile-nav-item"
        onClick={onOpenSettings}
        title="Settings"
      >
        <Settings size={20} />
        <span>Settings</span>
      </button>
    </nav>
  );
}
