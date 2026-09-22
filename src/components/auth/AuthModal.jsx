import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  LogIn,
  UserPlus,
  ArrowRight,
  Sparkles,
  Briefcase,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import VideoBackground from './VideoBackground';

export default function AuthModal({ onBackToLanding }) {
  const { login, register, loginWithSyncCode } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please provide both email and password.');
        return;
      }
      const res = login(email, password);
      if (!res.success) {
        setErrorMsg(res.message || 'Invalid email or password.');
      }
    } else if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      const res = register(name, email, password);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } else if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter your registered email address.');
        return;
      }
      alert(`Password reset link has been sent to ${email}`);
      setMode('login');
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Video Motion Background */}
      <VideoBackground />

      {/* Back to Landing Button */}
      {onBackToLanding && (
        <button className="auth-back-btn" onClick={onBackToLanding}>
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
      )}

      {/* Main Dual-Panel Auth Card (Image 2 style) */}
      <div className="auth-card-container">
        {/* Left Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-header-block">
            <div className="auth-header-pill">
              <Sparkles size={13} />
              <span>Career Command Center</span>
            </div>
            <h1 className="auth-title">
              {mode === 'login' && 'Login please'}
              {mode === 'register' && 'Create account'}
              {mode === 'forgot' && 'Reset password'}
            </h1>
            <div className="auth-title-line" />
            <p className="auth-subtitle">
              {mode === 'login' && 'Enter your credentials to access your tracking dashboard.'}
              {mode === 'register' && 'Start organizing all your job applications in one place.'}
              {mode === 'forgot' && 'Enter your registered email to receive a recovery link.'}
            </p>
          </div>

          {errorMsg && (
            <div className="auth-error-box" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="input-field-wrapper">
                <span className="input-field-icon">
                  <User size={18} />
                </span>
                <span className="input-field-divider" />
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Input your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="input-field-wrapper">
              <span className="input-field-icon">
                <Mail size={18} />
              </span>
              <span className="input-field-divider" />
              <input
                type="email"
                className="auth-input"
                placeholder="Input your user ID or Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {mode !== 'forgot' && (
              <div className="input-field-wrapper">
                <span className="input-field-icon">
                  <Lock size={18} />
                </span>
                <span className="input-field-divider" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Input your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {mode === 'register' && (
              <div className="input-field-wrapper">
                <span className="input-field-icon">
                  <Lock size={18} />
                </span>
                <span className="input-field-divider" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="auth-options-row">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  className="forgot-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setMode('forgot');
                    setErrorMsg('');
                  }}
                >
                  Forgot Password?
                </a>
              </div>
            )}

            {mode === 'forgot' && (
              <div className="auth-options-row" style={{ justifyContent: 'flex-end' }}>
                <a
                  href="#back-login"
                  className="forgot-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setMode('login');
                    setErrorMsg('');
                  }}
                >
                  Back to Login
                </a>
              </div>
            )}

            <button type="submit" className="btn-auth-submit">
              {mode === 'login' && (
                <>
                  <LogIn size={18} />
                  <span>LOG IN</span>
                </>
              )}
              {mode === 'register' && (
                <>
                  <UserPlus size={18} />
                  <span>SIGN UP</span>
                </>
              )}
              {mode === 'forgot' && (
                <>
                  <ArrowRight size={18} />
                  <span>SEND RESET LINK</span>
                </>
              )}
            </button>

            {/* Mobile Sync Code Direct Quick Login */}
            {mode === 'login' && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    const code = prompt('📱 Buka di HP? Masukkan Kode Sinkronisasi dari Laptop kamu:');
                    if (code && code.trim()) {
                      const res = loginWithSyncCode(code.trim());
                      if (res && res.success) {
                        alert(`Berhasil masuk sebagai ${res.user.name}! Seluruh data lamaran kamu telah disinkronkan.`);
                      } else {
                        alert(res?.message || 'Kode sinkronisasi tidak valid.');
                      }
                    }
                  }}
                  style={{
                    background: 'none',
                    border: '1px dashed var(--border-medium)',
                    color: 'var(--primary)',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 600
                  }}
                >
                  <span>📱 Buka dari HP? Masuk via Kode Sync Laptop</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Banner Panel (Image 2 style dynamic waves) */}
        <div className="auth-banner-panel">
          <div className="banner-wave-1" />
          <div className="banner-wave-2" />

          <div className="banner-content-box">
            <div className="banner-brand-icon">
              <Briefcase size={32} strokeWidth={2.4} />
            </div>

            <h2 className="banner-title">
              {mode === 'register' ? 'WELCOME BACK!' : 'WELCOME!'}
            </h2>

            <p className="banner-desc">
              {mode === 'register'
                ? 'Already have an active account? Sign in to continue tracking your applications.'
                : 'Enter your details and start journey with us. Track every application, build your career.'}
            </p>

            <button
              className="btn-banner-switch"
              onClick={() => {
                setMode(mode === 'register' ? 'login' : 'register');
                setErrorMsg('');
              }}
            >
              {mode === 'register' ? 'SIGN IN' : 'SIGNUP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
