import React from 'react';
import { MapPin, Calendar, Globe, DollarSign, ArrowRight, Edit3, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatRelativeDate, formatFullDate } from '../../services/dateUtils';

export default function ApplicationCardView({
  applications,
  onSelectApp,
  onEditApp,
  onDeleteApp
}) {
  if (applications.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        No applications found matching your search and filter criteria.
      </div>
    );
  }

  const formatSalary = (app) => {
    if (!app.salary_min && !app.salary_max) return null;
    const curr = app.currency || 'IDR';
    if (app.salary_min && app.salary_max) {
      return `${(app.salary_min / 1000000).toFixed(0)}M - ${(app.salary_max / 1000000).toFixed(0)}M ${curr}`;
    }
    return `${((app.salary_min || app.salary_max) / 1000000).toFixed(0)}M ${curr}`;
  };

  return (
    <div className="card-grid-view">
      {applications.map((app) => (
        <div
          key={app.id}
          className="app-grid-card"
          onClick={() => onSelectApp(app)}
        >
          {/* Card Top: Company & Position */}
          <div className="card-top-row">
            <div className="card-company-group">
              <div className="company-badge-icon">
                {app.company_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="card-company-name">{app.company_name}</h3>
                <p className="card-position-name">{app.position}</p>
              </div>
            </div>

            {/* Quick Edit/Delete in Card */}
            <div
              style={{ display: 'flex', gap: '0.2rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="btn-table-action"
                onClick={() => onEditApp(app)}
                title="Edit"
              >
                <Edit3 size={15} />
              </button>
              <button
                className="btn-table-action delete"
                onClick={() => onDeleteApp(app)}
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Card Meta List */}
          <div className="card-meta-list">
            <div className="card-meta-item">
              <MapPin size={14} />
              <span>{app.location || 'Remote'} ({app.work_arrangement || 'On-site'})</span>
            </div>

            <div className="card-meta-item">
              <Calendar size={14} />
              <span title={`Actual: ${formatFullDate(app.application_date)}`}>
                Applied {formatRelativeDate(app.application_date)}
              </span>
            </div>

            <div className="card-meta-item">
              <Globe size={14} />
              <span>Via {app.applied_via}</span>
            </div>

            {formatSalary(app) && (
              <div className="card-meta-item">
                <DollarSign size={14} />
                <span>{formatSalary(app)}</span>
              </div>
            )}
          </div>

          {/* Card Bottom: Status Badge & View Details Link */}
          <div className="card-bottom-row">
            <StatusBadge status={app.current_status} />
            <button
              className="btn-card-details"
              onClick={(e) => {
                e.stopPropagation();
                onSelectApp(app);
              }}
            >
              <span>View Details</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
