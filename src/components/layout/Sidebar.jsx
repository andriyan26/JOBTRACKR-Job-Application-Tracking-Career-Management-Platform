import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useJob } from '../../context/JobContext';

export default function Sidebar({ activeTab, onNavigate, onOpenAddModal, collapsed, onToggleCollapse }) {
  const { stats } = useJob();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: Briefcase,
      badge: stats.total > 0 ? stats.total : null
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      badge: stats.upcomingInterviews.length > 0 ? stats.upcomingInterviews.length : null
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-wrapper" onClick={() => onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <Briefcase size={22} strokeWidth={2.4} />
          </div>
          {!collapsed && (
            <div className="brand-text">
              <span className="brand-name">
                JOB<span>TRACKR</span>
              </span>
              <span className="brand-subtitle">Career Command</span>
            </div>
          )}
        </div>

        <button
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="nav-section-label">Main Menu</div>}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <div className="nav-item-icon">
                <Icon size={20} />
              </div>
              {!collapsed && <span className="nav-item-label">{item.label}</span>}
              {!collapsed && item.badge !== null && (
                <span className="nav-item-badge">{item.badge}</span>
              )}
            </div>
          );
        })}

        {/* Needs Attention Alert Pill in Sidebar */}
        {!collapsed && stats.attentionList.length > 0 && (
          <div
            className="nav-item"
            onClick={() => onNavigate('applications', { filter: 'attention' })}
            style={{
              marginTop: 'auto',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444'
            }}
          >
            <div className="nav-item-icon">
              <AlertTriangle size={18} />
            </div>
            <span className="nav-item-label" style={{ fontSize: '0.8rem' }}>Needs Attention</span>
            <span className="nav-item-badge alert-badge">{stats.attentionList.length}</span>
          </div>
        )}
      </nav>

      {/* Footer / Status Box */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="status-indicator-box">
            <div className="status-info-left">
              <div className="status-dot-active"></div>
              <div>
                <div className="status-title">Status: Active</div>
                <div className="status-subtitle">Command Center v1.0</div>
              </div>
            </div>
            <ShieldCheck size={16} color="var(--primary)" />
          </div>
        </div>
      )}
    </aside>
  );
}
