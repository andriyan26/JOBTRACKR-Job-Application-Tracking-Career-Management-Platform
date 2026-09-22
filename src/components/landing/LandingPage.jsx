import React, { useRef, useState } from 'react';
import {
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Bell,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  LogIn
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function LandingPage({ onOpenAuth }) {
  const { theme, toggleTheme } = useTheme();
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="landing-wrapper">
      {/* Top Navigation */}
      <header className="landing-nav">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <Briefcase size={22} strokeWidth={2.4} />
          </div>
          <div className="brand-text">
            <span className="brand-name">
              JOB<span>TRACKR</span>
            </span>
            <span className="brand-subtitle">Career Command</span>
          </div>
        </div>

        <div className="landing-nav-actions">
          <button className="icon-action-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="btn-dash-action"
            onClick={() => onOpenAuth('login')}
          >
            Sign In
          </button>

          <button
            className="btn-dash-action primary"
            onClick={() => onOpenAuth('register')}
          >
            Get Started Free
          </button>
        </div>
      </header>

      {/* Hero Section with Video Background (VIDEO.mp4 directly behind text) */}
      <div className="hero-video-container">
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`hero-bg-video ${videoLoaded ? 'loaded' : ''}`}
          onLoadedData={() => setVideoLoaded(true)}
        >
          <source src="/VIDEO.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-overlay" />

        <section className="landing-hero">
          <div className="hero-pill-badge">
            <Sparkles size={14} />
            <span>Track Every Application. Build Your Career.</span>
          </div>

          <h1 className="hero-title">
            Never Lose Track of a <span>Job Application</span> Again.
          </h1>

          <p className="hero-subtitle">
            JOBTRACKR helps fresh graduates, job seekers, and career switchers organize,
            track, and command every job opportunity — from the exact moment you apply until you get the offer.
          </p>

          <div className="hero-cta-group">
            <button
              className="btn-hero-primary"
              onClick={() => onOpenAuth('register')}
            >
              <span>Start Tracking Free</span>
              <ArrowRight size={18} />
            </button>

            <button
              className="btn-hero-secondary"
              onClick={() => onOpenAuth('login')}
            >
              <LogIn size={18} />
              <span>Sign In to Your Account</span>
            </button>
          </div>
        </section>
      </div>

      {/* Value Proposition Section */}
      <section className="features-section">
        <div className="features-header">
          <h2>Everything About Your Job Search. In One Place.</h2>
          <p>
            No more messy spreadsheets or forgotten applications. A command center built for your career journey.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-box">
            <div className="feature-icon-wrapper">
              <Briefcase size={24} />
            </div>
            <h3 className="feature-title">Track Applications</h3>
            <p className="feature-desc">
              Know exactly where every application stands with dual Table and Card views, smart relative dates, and source tracking.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-box">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <Bell size={24} />
            </div>
            <h3 className="feature-title">Never Miss a Follow-Up</h3>
            <p className="feature-desc">
              Automatic 7-day follow-up recommendations and upcoming interview calendar reminders so you always stay ahead of recruiters.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-box">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <BarChart3 size={24} />
            </div>
            <h3 className="feature-title">Understand Your Progress</h3>
            <p className="feature-desc">
              Deep insights into your interview conversion rates, top performing application sources, and timeline histories.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          <strong>JOBTRACKR</strong> — Personal Job Application Command Center & Career Management Platform.
        </p>
        <p style={{ marginTop: '0.35rem', opacity: 0.7 }}>
          Built with precision for job seekers and career professionals.
        </p>
      </footer>
    </div>
  );
}
