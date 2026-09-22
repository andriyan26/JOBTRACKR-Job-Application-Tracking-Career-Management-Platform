import React from 'react';
import {
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useJob } from '../../context/JobContext';

export default function StatCards({ onFilterClick }) {
  const { stats } = useJob();

  const cards = [
    {
      id: 'total',
      label: 'Total Applied',
      count: stats.total,
      subtext: `${stats.total} total submissions`,
      icon: Briefcase,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.12)',
      filterStatus: 'all'
    },
    {
      id: 'interview',
      label: 'Interview',
      count: stats.interview,
      subtext: `${stats.interviewRate}% interview rate`,
      icon: Users,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.12)',
      filterStatus: 'Interview'
    },
    {
      id: 'approved',
      label: 'Approved (Offers)',
      count: stats.approved,
      subtext: `${stats.successRate}% success rate 🎉`,
      icon: CheckCircle2,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      filterStatus: 'Approved'
    },
    {
      id: 'rejected',
      label: 'Rejected',
      count: stats.rejected,
      subtext: 'Learning milestones',
      icon: XCircle,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      filterStatus: 'Rejected'
    },
    {
      id: 'no-response',
      label: 'No Response',
      count: stats.noResponse,
      subtext: `${stats.attentionList.length} need follow-up`,
      icon: Clock,
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.12)',
      filterStatus: 'No Response'
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className="stat-card"
            style={{
              '--card-accent': c.color,
              '--stat-bg': c.bg,
              cursor: onFilterClick ? 'pointer' : 'default'
            }}
            onClick={() => onFilterClick && onFilterClick(c.filterStatus)}
          >
            <div className="stat-card-header">
              <span className="stat-label">{c.label}</span>
              <div className="stat-icon-wrapper">
                <Icon size={18} />
              </div>
            </div>

            <div>
              <div className="stat-number">{c.count}</div>
              <div className="stat-subtext">
                <TrendingUp size={13} style={{ color: c.color }} />
                <span>{c.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
