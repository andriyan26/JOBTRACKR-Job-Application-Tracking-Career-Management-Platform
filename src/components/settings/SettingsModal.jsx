import React, { useState } from 'react';
import {
  X,
  User,
  Moon,
  Sun,
  Download,
  RotateCcw,
  Save,
  Check,
  Briefcase,
  Mail,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useJob } from '../../context/JobContext';

export default function SettingsModal({ isOpen, onClose, onOpenGmailSync }) {
  const { currentUser, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { resetAllData, applications } = useJob();

  const [name, setName] = useState(currentUser?.name || '');
  const [roleTitle, setRoleTitle] = useState(currentUser?.role_title || '');
  const [location, setLocation] = useState(currentUser?.location || 'Jakarta, Indonesia');
  const [targetSalary, setTargetSalary] = useState(currentUser?.target_salary || '15.000.000 - 25.000.000 IDR');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      role_title: roleTitle,
      location,
      target_salary: targetSalary
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(applications, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `jobtrackr_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetData = () => {
    if (window.confirm('Reset all applications and reminders back to the initial sample data?')) {
      resetAllData();
      alert('Sample data restored successfully!');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <SettingsIcon size={18} />
            </div>
            <h2 className="modal-title">System & Profile Settings</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Personal Career Information
            </h4>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Role Title</label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Backend Developer"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Salary Range</label>
                <input
                  type="text"
                  value={targetSalary}
                  onChange={(e) => setTargetSalary(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
              {savedSuccess ? (
                <span style={{ color: '#10b981', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Check size={16} />
                  <span>Profile updated!</span>
                </span>
              ) : <span />}
              <button type="submit" className="btn-dash-action primary" style={{ padding: '0.5rem 1rem' }}>
                <Save size={15} />
                <span>Save Profile</span>
              </button>
            </div>
          </form>

          {/* Theme Selection */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Theme Preference
            </h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className={`btn-dash-action ${theme === 'dark' ? 'primary' : ''}`}
                onClick={() => setTheme('dark')}
                style={{ flex: 1, padding: '0.85rem', justifyContent: 'center' }}
              >
                <Moon size={16} />
                <span>Dark Command Center (Image 1)</span>
              </button>
              <button
                type="button"
                className={`btn-dash-action ${theme === 'light' ? 'primary' : ''}`}
                onClick={() => setTheme('light')}
                style={{ flex: 1, padding: '0.85rem', justifyContent: 'center' }}
              >
                <Sun size={16} />
                <span>Light Professional</span>
              </button>
            </div>
          </div>

          {/* Gmail & Inbound Sync Integration */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Gmail & Email Auto-Sync
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                  Auto-detect new job applications & status updates from LinkedIn, JobStreet & recruiters.
                </p>
              </div>
              <button
                type="button"
                className="btn-dash-action primary"
                onClick={onOpenGmailSync}
                style={{ padding: '0.5rem 0.95rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
              >
                <Mail size={15} />
                <span>Open Gmail Sync Hub</span>
              </button>
            </div>
          </div>

          {/* Data Export & Reset */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Data Management & Demo Tools
            </h4>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-dash-action"
                onClick={handleExportData}
              >
                <Download size={15} />
                <span>Export Data (JSON)</span>
              </button>
              <button
                type="button"
                className="btn-dash-action"
                onClick={handleResetData}
                style={{ color: '#ef4444' }}
              >
                <RotateCcw size={15} />
                <span>Reset Demo Applications</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-dash-action primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
