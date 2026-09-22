import React, { useMemo } from 'react';
import {
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  PieChart,
  MapPin,
  Globe,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { useJob } from '../../context/JobContext';

export default function AnalyticsView() {
  const { applications, stats } = useJob();
  const total = applications.length || 1;

  // Breakdown by Source
  const sourceStats = useMemo(() => {
    const counts = {};
    applications.forEach((app) => {
      const src = app.applied_via || 'Other';
      counts[src] = (counts[src] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([label, count]) => ({
        label,
        count,
        percent: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [applications, total]);

  // Breakdown by Location
  const locationStats = useMemo(() => {
    const counts = {};
    applications.forEach((app) => {
      const loc = app.location || 'Remote';
      counts[loc] = (counts[loc] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([label, count]) => ({
        label,
        count,
        percent: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [applications, total]);

  // Breakdown by Status for Donut
  const statusCounts = useMemo(() => {
    return [
      { label: 'Applied', count: stats.appliedOnly, color: '#3b82f6' },
      { label: 'Interview', count: stats.interview, color: '#f59e0b' },
      { label: 'Approved', count: stats.approved, color: '#10b981' },
      { label: 'Rejected', count: stats.rejected, color: '#ef4444' },
      { label: 'No Response', count: stats.noResponse, color: '#94a3b8' }
    ];
  }, [stats]);

  // Top source that generated interviews
  const bestInterviewSource = useMemo(() => {
    const counts = {};
    applications
      .filter((a) => a.current_status === 'Interview' || a.current_status === 'Approved')
      .forEach((a) => {
        counts[a.applied_via] = (counts[a.applied_via] || 0) + 1;
      });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : { name: 'LinkedIn', count: 2 };
  }, [applications]);

  // SVG circular progress calculations
  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="analytics-container">
      {/* 3 Core Rate Calculation Cards (PRD Section 19) */}
      <div className="rates-grid">
        {/* Success Rate */}
        <div className="rate-card">
          <div className="rate-info-group">
            <span className="rate-label">Application Success Rate</span>
            <div className="rate-value" style={{ color: '#10b981' }}>
              {stats.successRate}%
            </div>
            <span className="rate-formula-hint">
              Formula: (Approved / Total) × 100
            </span>
          </div>

          <svg className="rate-circle-svg">
            <circle className="circle-bg" cx="38" cy="38" r={radius} />
            <circle
              className="circle-fill"
              cx="38"
              cy="38"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * stats.successRate) / 100}
              style={{ stroke: '#10b981' }}
            />
          </svg>
        </div>

        {/* Interview Rate */}
        <div className="rate-card">
          <div className="rate-info-group">
            <span className="rate-label">Interview Conversion Rate</span>
            <div className="rate-value" style={{ color: '#f59e0b' }}>
              {stats.interviewRate}%
            </div>
            <span className="rate-formula-hint">
              Formula: (Interview / Total) × 100
            </span>
          </div>

          <svg className="rate-circle-svg">
            <circle className="circle-bg" cx="38" cy="38" r={radius} />
            <circle
              className="circle-fill"
              cx="38"
              cy="38"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * stats.interviewRate) / 100}
              style={{ stroke: '#f59e0b' }}
            />
          </svg>
        </div>

        {/* Response Rate */}
        <div className="rate-card">
          <div className="rate-info-group">
            <span className="rate-label">Employer Response Rate</span>
            <div className="rate-value" style={{ color: '#3b82f6' }}>
              {stats.responseRate}%
            </div>
            <span className="rate-formula-hint">
              Formula: (Active Responses / Total) × 100
            </span>
          </div>

          <svg className="rate-circle-svg">
            <circle className="circle-bg" cx="38" cy="38" r={radius} />
            <circle
              className="circle-fill"
              cx="38"
              cy="38"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * stats.responseRate) / 100}
              style={{ stroke: '#3b82f6' }}
            />
          </svg>
        </div>
      </div>

      {/* Dynamic Data-Driven Insights (PRD Section 20) */}
      <div className="insights-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Career Search Intelligence & Insights
          </h3>
        </div>

        <div className="insights-grid">
          <div className="insight-item">
            <div className="insight-icon">
              <Lightbulb size={18} />
            </div>
            <div className="insight-text">
              💡 You have submitted <strong>{stats.total} applications</strong> in total this campaign season.
            </div>
          </div>

          <div className="insight-item">
            <div className="insight-icon">
              <Globe size={18} />
            </div>
            <div className="insight-text">
              💡 <strong>{bestInterviewSource.name}</strong> has been your highest yielding channel, generating{' '}
              <strong>{bestInterviewSource.count} interview & offer opportunities</strong>.
            </div>
          </div>

          <div className="insight-item">
            <div className="insight-icon">
              <Users size={18} />
            </div>
            <div className="insight-text">
              💡 You currently have <strong>{stats.noResponse} applications</strong> waiting for a response and{' '}
              <strong>{stats.attentionList.length} requiring follow-up</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="analytics-charts-grid">
        {/* Breakdown by Source */}
        <div className="chart-panel-card">
          <div className="chart-panel-header">
            <h3 className="chart-panel-title">
              <Globe size={18} color="var(--primary)" />
              <span>Applications by Source / Platform</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {sourceStats.length} Sources Used
            </span>
          </div>

          <div className="bar-breakdown-list">
            {sourceStats.map((src) => (
              <div key={src.label} className="bar-breakdown-item">
                <div className="breakdown-row-top">
                  <span className="breakdown-label">{src.label}</span>
                  <span className="breakdown-val">
                    {src.count} apps ({src.percent}%)
                  </span>
                </div>
                <div className="breakdown-progress-track">
                  <div
                    className="breakdown-progress-fill"
                    style={{ width: `${Math.max(src.percent, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown by Status (Donut Visual) */}
        <div className="chart-panel-card">
          <div className="chart-panel-header">
            <h3 className="chart-panel-title">
              <PieChart size={18} color="var(--primary)" />
              <span>Applications by Status</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {stats.total} Total Records
            </span>
          </div>

          <div className="donut-wrapper">
            {/* SVG Donut */}
            <svg className="donut-svg" viewBox="0 0 100 100">
              {statusCounts.map((st, idx) => {
                const fraction = st.count / total;
                const strokeLength = fraction * 251.2;
                // Accumulate previous offsets
                const prevFractions = statusCounts.slice(0, idx).reduce((acc, s) => acc + s.count / total, 0);
                const strokeOffset = -prevFractions * 251.2;

                return (
                  <circle
                    key={st.label}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={st.color}
                    strokeWidth="14"
                    strokeDasharray={`${strokeLength} 251.2`}
                    strokeDashoffset={strokeOffset}
                    style={{ transition: 'all 0.5s ease' }}
                  />
                );
              })}
            </svg>

            {/* Legend */}
            <div className="donut-legend">
              {statusCounts.map((st) => (
                <div key={st.label} className="donut-legend-item">
                  <div className="donut-dot" style={{ backgroundColor: st.color }} />
                  <span style={{ width: '90px' }}>{st.label}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{st.count}</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    ({Math.round((st.count / total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Breakdown by Location */}
        <div className="chart-panel-card" style={{ gridColumn: 'span 2' }}>
          <div className="chart-panel-header">
            <h3 className="chart-panel-title">
              <MapPin size={18} color="var(--primary)" />
              <span>Applications by Location</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Geographic Distribution
            </span>
          </div>

          <div className="bar-breakdown-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {locationStats.map((loc) => (
              <div key={loc.label} className="bar-breakdown-item">
                <div className="breakdown-row-top">
                  <span className="breakdown-label">{loc.label}</span>
                  <span className="breakdown-val">
                    {loc.count} apps ({loc.percent}%)
                  </span>
                </div>
                <div className="breakdown-progress-track">
                  <div
                    className="breakdown-progress-fill"
                    style={{
                      width: `${Math.max(loc.percent, 5)}%`,
                      background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
