import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  LogOut,
  User,
  Settings,
  Clock,
  Calendar,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJob } from '../../context/JobContext';
import { useTheme } from '../../context/ThemeContext';
import { formatRelativeDate } from '../../services/dateUtils';

export default function TopNavbar({ activeTab, onNavigate, onOpenSettings, onSelectApp }) {
  const { currentUser, logout } = useAuth();
  const { stats, markAppFollowedUp } = useJob();
  const { theme, toggleTheme } = useTheme();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const attentionCount = stats.attentionList.length + stats.upcomingInterviews.length;

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'OPERATIONS DASHBOARD';
      case 'applications':
        return 'JOB APPLICATIONS HUB';
      case 'calendar':
        return 'SCHEDULE & CALENDAR';
      case 'analytics':
        return 'METRICS & ANALYTICS';
      default:
        return 'DASHBOARD';
    }
  };

  return (
    <header className="top-navbar">
      {/* Left: Section Header & Status Pill */}
      <div className="navbar-left">
        <div className="page-title-group">
          <h2 className="page-main-heading">
            {getPageTitle()}
          </h2>
          <div className="page-sub-badge">
            <span className="pulse-dot" style={{ color: '#10b981' }}></span>
            <span>Current Status:</span>
            <span className="season-pill">Active Job Search • 2026 Season</span>
          </div>
        </div>
      </div>

      {/* Right: Theme Switcher, Settings, Notifications & Profile */}
      <div className="navbar-right">
        {/* Settings Button directly in Top Bar (User requirement: Setting di bagian atas aja) */}
        <button
          className="icon-action-btn"
          onClick={onOpenSettings}
          title="System & Profile Settings"
        >
          <Settings size={18} />
        </button>

        {/* Theme Switcher */}
        <button
          className="icon-action-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell (Image 1 style) */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="icon-action-btn"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            title="Notifications & Action Items"
          >
            <Bell size={18} />
            {attentionCount > 0 && (
              <span className="notif-badge-count">{attentionCount}</span>
            )}
          </button>

          {showNotifMenu && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h4>Needs Attention & Alerts</h4>
                <span className="season-pill" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                  {attentionCount} Action Items
                </span>
              </div>

              <div className="notif-list">
                {attentionCount === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    ✓ All caught up! No urgent follow-ups required.
                  </div>
                ) : (
                  <>
                    {/* Attention / Follow-up list */}
                    {stats.attentionList.map((app) => (
                      <div
                        key={app.id}
                        className="notif-item"
                        onClick={() => {
                          setShowNotifMenu(false);
                          onSelectApp(app);
                        }}
                      >
                        <div className="notif-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                          <AlertCircle size={16} />
                        </div>
                        <div className="notif-content">
                          <div className="notif-title">{app.company_name}</div>
                          <div className="notif-desc">
                            No response for 7+ days. Consider following up.
                          </div>
                          <div className="notif-time">
                            Applied {formatRelativeDate(app.application_date)}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Upcoming interviews */}
                    {stats.upcomingInterviews.map((evt) => (
                      <div
                        key={evt.id}
                        className="notif-item"
                        onClick={() => {
                          setShowNotifMenu(false);
                          onNavigate('calendar');
                        }}
                      >
                        <div className="notif-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                          <Calendar size={16} />
                        </div>
                        <div className="notif-content">
                          <div className="notif-title">{evt.title}</div>
                          <div className="notif-desc">{evt.description}</div>
                          <div className="notif-time">Date: {evt.event_date}</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip */}
        <div style={{ position: 'relative' }} ref={userRef}>
          <div
            className="user-profile-chip"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <img
              src={currentUser?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Andrian'}
              alt={currentUser?.name || 'User'}
              className="user-avatar"
            />
            <div className="user-meta">
              <span className="user-name">{currentUser?.name || 'Andrian'}</span>
              <span className="user-role">Job Seeker</span>
            </div>
          </div>

          {showUserMenu && (
            <div className="user-dropdown-menu">
              <div
                className="user-dropdown-item"
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenSettings();
                }}
              >
                <Settings size={16} />
                <span>Account Settings</span>
              </div>
              <div
                className="user-dropdown-item danger"
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
