import React from 'react';
import { Eye, Edit3, Trash2, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatRelativeDate, formatFullDate } from '../../services/dateUtils';

export default function ApplicationTable({
  applications,
  onSelectApp,
  onEditApp,
  onDeleteApp
}) {
  return (
    <div className="table-view-wrapper">
      <table className="apps-table">
        <thead>
          <tr>
            <th style={{ width: '45px' }}>No</th>
            <th>Company</th>
            <th>Position</th>
            <th>Location</th>
            <th>Applied</th>
            <th>Via</th>
            <th>Status</th>
            <th>Result</th>
            <th>Notes</th>
            <th style={{ textAlign: 'right', width: '110px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>No applications match your criteria.</p>
              </td>
            </tr>
          ) : (
            applications.map((app, index) => {
              const formattedNo = String(index + 1).padStart(2, '0');

              return (
                <tr key={app.id}>
                  <td className="table-index">{formattedNo}</td>

                  {/* Company Cell */}
                  <td>
                    <div
                      className="company-main-cell"
                      onClick={() => onSelectApp(app)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="company-badge-icon">
                        {app.company_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="company-title-text">
                          <span>{app.company_name}</span>
                          {app.job_url && (
                            <a
                              href={app.job_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="Visit Job Listing"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {app.employment_type || 'Full Time'} • {app.work_arrangement || 'On-site'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Position */}
                  <td className="position-cell">{app.position}</td>

                  {/* Location */}
                  <td>{app.location || 'Remote'}</td>

                  {/* Smart Relative Date */}
                  <td>
                    <div className="table-date-cell">
                      <span
                        className="table-rel-date"
                        title={`Actual Date: ${formatFullDate(app.application_date)}`}
                      >
                        {formatRelativeDate(app.application_date)}
                      </span>
                      <span className="table-full-date">{app.application_date}</span>
                    </div>
                  </td>

                  {/* Applied Via */}
                  <td>
                    <span className="table-source-tag">{app.applied_via}</span>
                  </td>

                  {/* Current Status */}
                  <td>
                    <StatusBadge status={app.current_status} />
                  </td>

                  {/* Result */}
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {app.result || app.current_status}
                    </span>
                  </td>

                  {/* Notes Preview */}
                  <td style={{ maxWidth: '200px' }}>
                    <div
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)'
                      }}
                      title={app.notes}
                    >
                      {app.notes || '-'}
                    </div>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="table-actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="btn-table-action"
                        onClick={() => onSelectApp(app)}
                        title="View Application Details & Timeline"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn-table-action"
                        onClick={() => onEditApp(app)}
                        title="Edit Application"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="btn-table-action delete"
                        onClick={() => onDeleteApp(app)}
                        title="Delete Application"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
