import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Moon,
  Sun,
  Download,
  Upload,
  RotateCcw,
  Save,
  Check,
  Briefcase,
  Mail,
  Camera,
  Smartphone,
  Copy,
  CheckCheck,
  Sparkles,
  AlertCircle,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useJob } from '../../context/JobContext';
import { generateSyncCode, importSyncCode } from '../../services/storageService';

const PRESET_AVATARS = [
  { id: 'initial', label: 'Inisial', url: '' },
  { id: 'pro1', label: 'Tech Pro', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80' },
  { id: 'pro2', label: 'Modern Pro', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' },
  { id: 'casual', label: 'Creative', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80' },
  { id: 'bot', label: 'Cyber Tech', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AIJobHunter' }
];

export default function SettingsModal({ isOpen, onClose, onOpenGmailSync }) {
  const { currentUser, updateProfile, loginWithSyncCode } = useAuth();
  const { theme, setTheme } = useTheme();
  const { resetAllData, applications } = useJob();

  const fileInputRef = useRef(null);

  const [name, setName] = useState(currentUser?.name || '');
  const [roleTitle, setRoleTitle] = useState(currentUser?.role_title || '');
  const [location, setLocation] = useState(currentUser?.location || 'Indonesia');
  const [targetSalary, setTargetSalary] = useState(currentUser?.target_salary || '15.000.000 - 25.000.000 IDR');
  const [avatar, setAvatar] = useState(
    currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.name || 'Andrian')}`
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [photoUpdatedToast, setPhotoUpdatedToast] = useState(false);

  // Sync Code state
  const [syncCode, setSyncCode] = useState('');
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);
  const [importCodeInput, setImportCodeInput] = useState('');
  const [importStatus, setImportStatus] = useState(null);

  if (!isOpen) return null;

  const defaultInitialsAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'Andrian')}`;

  // Image Upload Handler with in-browser Canvas compression
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 220;
        const maxHeight = 220;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setAvatar(compressedDataUrl);
        updateProfile({ avatar: compressedDataUrl });
        setPhotoUpdatedToast(true);
        setTimeout(() => setPhotoUpdatedToast(false), 3000);
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (presetUrl) => {
    const finalUrl = presetUrl || defaultInitialsAvatar;
    setAvatar(finalUrl);
    updateProfile({ avatar: finalUrl });
    setPhotoUpdatedToast(true);
    setTimeout(() => setPhotoUpdatedToast(false), 3000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      role_title: roleTitle,
      location,
      target_salary: targetSalary,
      avatar
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleGenerateSyncCode = () => {
    if (!currentUser?.id) return;
    const code = generateSyncCode(currentUser.id);
    if (code) {
      setSyncCode(code);
      setCopiedSyncCode(false);
    }
  };

  const handleCopySyncCode = () => {
    if (!syncCode) return;
    navigator.clipboard.writeText(syncCode);
    setCopiedSyncCode(true);
    setTimeout(() => setCopiedSyncCode(false), 2500);
  };

  const handleImportSyncCode = (e) => {
    e.preventDefault();
    if (!importCodeInput.trim()) return;
    const res = loginWithSyncCode(importCodeInput.trim());
    if (res.success) {
      setImportStatus({ type: 'success', text: `Berhasil! Akun ${res.user.name} & ${res.count} lamaran tersinkronisasi!` });
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } else {
      setImportStatus({ type: 'error', text: res.message || 'Kode tidak valid.' });
    }
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
    if (window.confirm('Reset all applications and reminders back to initial sample data?')) {
      resetAllData();
      alert('Sample data restored successfully!');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
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

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 1. PHOTO & AVATAR UPLOAD SECTION */}
          <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Camera size={16} color="var(--primary)" />
                <span>Foto Profil & Avatar</span>
              </h4>
              {photoUpdatedToast && (
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Check size={14} />
                  <span>Foto diperbarui!</span>
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {/* Avatar Preview */}
              <div style={{ position: 'relative', width: '76px', height: '76px', flexShrink: 0 }}>
                <img
                  src={avatar || defaultInitialsAvatar}
                  alt={name || 'User Avatar'}
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--primary)',
                    boxShadow: '0 0 16px rgba(37, 99, 235, 0.35)',
                    backgroundColor: 'var(--bg-app)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Ganti foto profil"
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    border: '2px solid var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                  }}
                >
                  <Camera size={13} />
                </button>
              </div>

              {/* Upload & Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-dash-action primary"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem' }}
                  >
                    <Upload size={14} />
                    <span>Upload Foto Baru</span>
                  </button>
                  <button
                    type="button"
                    className="btn-dash-action"
                    onClick={() => handleSelectPreset('')}
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                    title="Kembalikan ke foto inisial default"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Inisial</span>
                  </button>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Mendukung JPG, PNG, WEBP dari Laptop atau HP (Otomatis dioptimalkan).
                </span>
              </div>
            </div>

            {/* Quick Avatar Presets */}
            <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                Atau pilih avatar siap pakai:
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {PRESET_AVATARS.map((p) => {
                  const pUrl = p.url || defaultInitialsAvatar;
                  const isSelected = avatar === pUrl;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.url)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
                        background: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        fontSize: '0.72rem'
                      }}
                    >
                      <img
                        src={pUrl}
                        alt={p.label}
                        style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. PROFILE FORM */}
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
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
                  placeholder="e.g. IT Support / Software Developer"
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
                  <span>Profile updated successfully!</span>
                </span>
              ) : <span />}
              <button type="submit" className="btn-dash-action primary" style={{ padding: '0.5rem 1.15rem' }}>
                <Save size={15} />
                <span>Save Profile</span>
              </button>
            </div>
          </form>

          {/* 3. MULTI-DEVICE SYNC (LAPTOP ↔ HP) */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Smartphone size={18} color="var(--primary)" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Sinkronisasi Antar Perangkat (Laptop ↔ HP)
              </h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.85rem' }}>
              Buka akun yang sama di HP dan Laptop tanpa daftar ulang! Salin kode sinkronisasi berikut dan masukkan di browser HP kamu.
            </p>

            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
              <button
                type="button"
                className="btn-dash-action primary"
                onClick={handleGenerateSyncCode}
                style={{ padding: '0.5rem 0.95rem', fontSize: '0.8rem' }}
              >
                <Smartphone size={14} />
                <span>Buat Kode Sinkronisasi HP</span>
              </button>

              {syncCode && (
                <button
                  type="button"
                  className="btn-dash-action"
                  onClick={handleCopySyncCode}
                  style={{ padding: '0.5rem 0.95rem', fontSize: '0.8rem', color: copiedSyncCode ? '#10b981' : 'var(--text-primary)' }}
                >
                  {copiedSyncCode ? <CheckCheck size={14} /> : <Copy size={14} />}
                  <span>{copiedSyncCode ? 'Tersalin ke Clipboard!' : 'Salin Kode'}</span>
                </button>
              )}
            </div>

            {syncCode && (
              <div style={{ marginTop: '0.5rem' }}>
                <textarea
                  readOnly
                  value={syncCode}
                  rows={2}
                  style={{
                    width: '100%',
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                    resize: 'none'
                  }}
                  onClick={(e) => e.target.select()}
                />
                <div style={{ fontSize: '0.73rem', color: '#10b981', marginTop: '0.25rem', fontWeight: 600 }}>
                  ✓ Buka https://jobtrackrandrian.tplp004.com/ di HP Anda ➔ Masuk via Kode Sync HP ➔ Tempel kode ini.
                </div>
              </div>
            )}

            {/* Import Code section (if opening on mobile or restoring) */}
            <div style={{ marginTop: '0.85rem', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-medium)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Punya kode sinkronisasi dari laptop? Tempel di sini:
              </div>
              <form onSubmit={handleImportSyncCode} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Tempel kode sinkronisasi di sini..."
                  value={importCodeInput}
                  onChange={(e) => setImportCodeInput(e.target.value)}
                  style={{ flex: 1, fontSize: '0.75rem', padding: '0.45rem 0.75rem' }}
                />
                <button
                  type="submit"
                  className="btn-dash-action primary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
                >
                  <span>Sinkronkan Sekarang</span>
                </button>
              </form>
              {importStatus && (
                <div
                  style={{
                    marginTop: '0.4rem',
                    fontSize: '0.74rem',
                    color: importStatus.type === 'success' ? '#10b981' : '#ef4444',
                    fontWeight: 600
                  }}
                >
                  {importStatus.text}
                </div>
              )}
            </div>
          </div>

          {/* 4. THEME SELECTION */}
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

          {/* 5. GMAIL & EMAIL AUTO-SYNC */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Gmail & Email Auto-Sync
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                  Auto-detect new job applications & updates from Kalibrr, JobStreet, LinkedIn, BCA Finance, I2S & HR mailers.
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

          {/* 6. DATA EXPORT & RESET */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Data Management & Backup Tools
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
