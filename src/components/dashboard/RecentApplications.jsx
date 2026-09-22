import React from 'react';
import { ArrowRight, Building2, MapPin } from 'lucide-react';
import { useJob } from '../../context/JobContext';
import { formatRelativeDate, formatFullDate } from '../../services/dateUtils';
import StatusBadge from '../applications/StatusBadge';

export default function RecentApplications({ onViewAll, onSelectApp }) {
  const { applications } = useJob();

  const recentList = [...applications]
    .sort((a, b) => new Date(b.application_date) - new Date(a.application_date))
    .slice(0, 5);

  return (
    <div className="recent-apps-card">
      <div className="recent-apps-header">
        <h3 className="recent-apps-title">Recent Applications</h3>
        <button className="btn-view-all" onClick={onViewAll}>
          <span>View All Applications</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="recent-table-container">
        <table className="clean-table">
          <thead>
            <tr>
              <th>Company & Role</th>
              <th>Applied</th>
              <th>Status</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {recentList.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                  No recent applications. Click "+ Add Application" to start!
                </td>
              </tr>
            ) : (
              recentList.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => onSelectApp(app)}
                  style={{ cursor: 'pointer' }}
                  title="Click to view details"
                >
                  <td>
                    <div className="table-company-cell">
                      <div className="company-logo-avatar">
                        {app.company_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="table-company-name">{app.company_name}</div>
                        <div className="table-role-sub">
                          {app.position} • {app.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      title={formatFullDate(app.application_date)}
                      style={{ borderBottom: '1px dotted var(--text-muted)' }}
                    >
                      {formatRelativeDate(app.application_date)}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={app.current_status} />
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {app.result || app.current_status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
