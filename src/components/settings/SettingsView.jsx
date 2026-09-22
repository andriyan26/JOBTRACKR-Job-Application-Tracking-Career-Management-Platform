import React, { useState } from 'react';
import {
  User,
  Moon,
  Sun,
  Download,
  RotateCcw,
  Save,
  Check,
  Shield,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useJob } from '../../context/JobContext';

export default function SettingsView() {
  const { currentUser, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { resetAllData, applications } = useJob();

  const [name, setName] = useState(currentUser?.name || '');
  const [roleTitle, setRoleTitle] = useState(currentUser?.role_title || '');
  const [location, setLocation] = useState(currentUser?.location || 'Jakarta, Indonesia');
  const [targetSalary, setTargetSalary] = useState(currentUser?.target_salary || '15.000.000 - 25.000.000 IDR');
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
      {/* Profile Form Card */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="brand-icon" style={{ width: '38px', height: '38px' }}>
            <User size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Profile & Career Targets</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Customize your personal job hunting profile and salary targets.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              <label className="form-label">Primary Career Title</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Backend Developer / Junior IT Support"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Preferred Location</label>
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            {savedSuccess ? (
              <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Check size={16} />
                <span>Profile updated successfully!</span>
              </span>
            ) : <span />}

            <button type="submit" className="btn-dash-action primary">
              <Save size={16} />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Appearance & Dark Mode (PRD Section 31) */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Interface Theme (Dark / Light)
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Choose your visual preference. Preference is stored automatically.
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            className={`btn-dash-action ${theme === 'dark' ? 'primary' : ''}`}
            onClick={() => setTheme('dark')}
            style={{ flex: 1, padding: '1rem', justifyContent: 'center' }}
          >
            <Moon size={18} />
            <span>Dark Command Center (Image 1)</span>
          </button>

          <button
            type="button"
            className={`btn-dash-action ${theme === 'light' ? 'primary' : ''}`}
            onClick={() => setTheme('light')}
            style={{ flex: 1, padding: '1rem', justifyContent: 'center' }}
          >
            <Sun size={18} />
            <span>Light Professional Mode</span>
          </button>
        </div>
      </div>

      {/* Data Management Card */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Data Backup & Demo Reset
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Export your current applications as JSON backup or restore realistic demo applications.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-dash-action"
            onClick={handleExportData}
          >
            <Download size={16} />
            <span>Export Data (JSON)</span>
          </button>

          <button
            type="button"
            className="btn-dash-action"
            onClick={handleResetData}
            style={{ color: '#ef4444' }}
          >
            <RotateCcw size={16} />
            <span>Reset Demo Applications</span>
          </button>
        </div>
      </div>
    </div>
  );
}
