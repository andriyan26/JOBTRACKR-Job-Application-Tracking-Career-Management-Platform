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
  Briefcase,
  Mail,
  Sparkles,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJob } from '../../context/JobContext';
import { useTheme } from '../../context/ThemeContext';
import { formatRelativeDate } from '../../services/dateUtils';

export default function TopNavbar({ activeTab, onNavigate, onOpenSettings, onOpenGmailSync, onSelectApp }) {
  const { currentUser, logout } = useAuth();
  const {
    stats,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    applications
  } = useJob();
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

  const totalNotifCount =
    stats.attentionList.length +
    stats.upcomingInterviews.length +
    (stats.unreadNotificationsCount || 0);

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

      {/* Right: Gmail Sync, Theme Switcher, Settings, Notifications & Profile */}
      <div className="navbar-right">
        {/* Smart Gmail Sync Quick Action */}
        <button
          className="sync-top-nav-btn"
          onClick={onOpenGmailSync}
          title="Smart Gmail Sync & AI Job Scanner"
        >
          <span className="sync-dot"></span>
          <Mail size={15} />
          <span>Sync Gmail</span>
        </button>

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
            {totalNotifCount > 0 && (
              <span className="notif-badge-count">{totalNotifCount}</span>
            )}
          </button>

          {showNotifMenu && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h4>Alerts & Email Sync</h4>
                  <span className="season-pill" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                    {totalNotifCount} Items
                  </span>
                </div>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllNotifications}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    title="Clear All Notifications"
                  >
                    <CheckCheck size={14} />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className="notif-list">
                {totalNotifCount === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    ✓ All caught up! No urgent updates or unread sync items.
                  </div>
                ) : (
                  <>
                    {/* Synced in-app Gmail notifications */}
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="notif-item"
                        style={{ background: notif.read ? 'transparent' : 'rgba(37, 99, 235, 0.08)' }}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.link_app_id) {
                            const app = applications.find((a) => a.id === notif.link_app_id);
                            if (app) {
                              setShowNotifMenu(false);
                              onSelectApp(app);
                            }
                          }
                        }}
                      >
                        <div
                          className="notif-icon-box"
                          style={{
                            background:
                              notif.type === 'interview'
                                ? 'rgba(245, 158, 11, 0.15)'
                                : notif.type === 'rejection'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(16, 185, 129, 0.15)',
                            color:
                              notif.type === 'interview'
                                ? '#f59e0b'
                                : notif.type === 'rejection'
                                ? '#ef4444'
                                : '#10b981'
                          }}
                        >
                          <Mail size={16} />
                        </div>
                        <div className="notif-content">
                          <div className="notif-title">{notif.title}</div>
                          <div className="notif-desc">{notif.message}</div>
                          <div className="notif-time">
                            {formatRelativeDate(notif.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}

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
