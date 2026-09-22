import React from 'react';
import { GitCommit, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useJob } from '../../context/JobContext';

export default function PipelineView({ onStageClick }) {
  const { stats } = useJob();
  const total = stats.total || 1;

  const stages = [
    {
      id: 'Applied',
      name: '1. Applied',
      count: stats.appliedOnly,
      color: '#3b82f6',
      percent: Math.round((stats.appliedOnly / total) * 100),
      desc: 'Submitted, awaiting check'
    },
    {
      id: 'No Response',
      name: '2. No Response',
      count: stats.noResponse,
      color: '#94a3b8',
      percent: Math.round((stats.noResponse / total) * 100),
      desc: 'Pending employer contact'
    },
    {
      id: 'Interview',
      name: '3. Interview',
      count: stats.interview,
      color: '#f59e0b',
      percent: Math.round((stats.interview / total) * 100),
      desc: 'Screening & technical rounds'
    },
    {
      id: 'Approved',
      name: '4. Approved 🎉',
      count: stats.approved,
      color: '#10b981',
      percent: Math.round((stats.approved / total) * 100),
      desc: 'Offer letters received'
    },
    {
      id: 'Rejected',
      name: 'Outcome: Rejected',
      count: stats.rejected,
      color: '#ef4444',
      percent: Math.round((stats.rejected / total) * 100),
      desc: 'Archived / Feedback logged'
    }
  ];

  return (
    <section className="pipeline-section">
      <div className="pipeline-header">
        <h3 className="pipeline-title">
          <GitCommit size={18} color="var(--primary)" />
          <span>Application Pipeline & Career Journey</span>
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Total Active Applications: <strong>{stats.total}</strong>
        </span>
      </div>

      <div className="pipeline-steps-wrapper">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="pipeline-card"
            style={{
              '--stage-color': stage.color,
              '--card-border': stage.color,
              cursor: onStageClick ? 'pointer' : 'default'
            }}
            onClick={() => onStageClick && onStageClick(stage.id)}
          >
            <div className="pipeline-card-top">
              <span className="pipeline-stage-name">{stage.name}</span>
              <span className="pipeline-count" style={{ color: stage.color }}>
                {stage.count}
              </span>
            </div>

            <div className="pipeline-progress-bar">
              <div
                className="pipeline-progress-fill"
                style={{ width: `${Math.max(stage.percent, 3)}%` }}
              />
            </div>

            <div className="pipeline-meta">
              <span>{stage.desc}</span>
              <strong>{stage.percent}%</strong>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
