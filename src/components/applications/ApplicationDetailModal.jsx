import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Globe,
  DollarSign,
  Clock,
  Send,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  History,
  CheckCircle2,
  MailCheck,
  AlertCircle
} from 'lucide-react';
import { useJob } from '../../context/JobContext';
import StatusBadge from './StatusBadge';
import { formatRelativeDate, formatFullDate, getTodayString } from '../../services/dateUtils';

export default function ApplicationDetailModal({
  app,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) {
  const {
    changeStatus,
    markAppFollowedUp,
    addEvent,
    statusHistory,
    applicationEvents
  } = useJob();

  const [newStatus, setNewStatus] = useState(app?.current_status || 'Applied');
  const [statusNote, setStatusNote] = useState('');
  const [showStatusForm, setShowStatusForm] = useState(false);

  // New Event Form State
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(getTodayString());
  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState('Interview');

  if (!isOpen || !app) return null;

  // Filter history and events for this application
  const appHistory = statusHistory.filter((h) => h.application_id === app.id);
  const appEvents = applicationEvents.filter((e) => e.application_id === app.id);

  // Merge into unified chronological timeline sorted by date
  const timelineItems = [
    ...appEvents.map((e) => ({
      id: e.id,
      date: e.event_date,
      title: e.title,
      desc: e.description,
      type: e.event_type,
      isEvent: true
    })),
    ...appHistory.map((h) => ({
      id: h.id,
      date: h.changed_at.slice(0, 10),
      title: h.old_status ? `Status Changed: ${h.old_status} → ${h.new_status}` : `Status: ${h.new_status}`,
      desc: h.note || `Status transitioned to ${h.new_status}`,
      type: h.new_status,
      isHistory: true
    }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    if (newStatus !== app.current_status) {
      changeStatus(app.id, newStatus, statusNote);
      setShowStatusForm(false);
      setStatusNote('');
    }
  };

  const handleAddEventSubmit = (e) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    addEvent(app.id, {
      title: eventTitle,
      event_date: eventDate,
      description: eventDesc,
      event_type: eventType
    });

    setEventTitle('');
    setEventDesc('');
    setShowEventForm(false);
  };

  const formatSalary = () => {
    if (!app.salary_min && !app.salary_max) return 'Not Specified';
    const curr = app.currency || 'IDR';
    if (app.salary_min && app.salary_max) {
      return `${(app.salary_min / 1000000).toFixed(1)}M - ${(app.salary_max / 1000000).toFixed(1)}M ${curr}`;
    }
    return `${((app.salary_min || app.salary_max) / 1000000).toFixed(1)}M ${curr}`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog large" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 className="modal-title">{app.position}</h2>
            <StatusBadge status={app.current_status} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn-dash-action"
              onClick={() => onEdit(app)}
              title="Edit Application"
              style={{ padding: '0.4rem 0.75rem' }}
            >
              <Edit3 size={15} />
              <span>Edit</span>
            </button>
            <button
              className="btn-dash-action"
              onClick={() => onDelete(app)}
              title="Delete Application"
              style={{ padding: '0.4rem 0.75rem', color: '#ef4444' }}
            >
              <Trash2 size={15} />
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Company Banner */}
          <div className="detail-banner">
            <div className="detail-company-box">
              <div className="detail-avatar-large">
                {app.company_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="detail-title-group">
                <h2>{app.company_name}</h2>
                <p>
                  <MapPin size={14} />
                  <span>{app.location || 'Remote'}</span>
                  <span>•</span>
                  <span>{app.employment_type || 'Full Time'}</span>
                  <span>•</span>
                  <span>{app.work_arrangement || 'On-site'}</span>
                </p>
              </div>
            </div>

            {/* Quick Status Change Trigger */}
            <div>
              <button
                className="btn-dash-action primary"
                onClick={() => setShowStatusForm(!showStatusForm)}
              >
                <History size={16} />
                <span>Update Status</span>
              </button>
            </div>
          </div>

          {/* Inline Status Transition Form */}
          {showStatusForm && (
            <form
              onSubmit={handleStatusSubmit}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Change Application Status & Log History
              </h4>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Applied">Applied</option>
                    <option value="No Response">No Response</option>
                    <option value="Interview">Interview</option>
                    <option value="Approved">Approved 🎉</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Transition Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Completed technical round with HR"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-dash-action"
                  onClick={() => setShowStatusForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-dash-action primary">
                  Save Status Change
                </button>
              </div>
            </form>
          )}

          {/* Application Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Applied Date
              </span>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '0.2rem' }}>
                {formatFullDate(app.application_date)}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                {formatRelativeDate(app.application_date)}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Applied Via
              </span>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '0.2rem' }}>
                {app.applied_via}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Salary Target
              </span>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '0.2rem' }}>
                {formatSalary()}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Job Posting
              </span>
              <div style={{ marginTop: '0.2rem' }}>
                {app.job_url ? (
                  <a
                    href={app.job_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: 'var(--primary)',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}
                  >
                    <span>View Listing</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Notes Card */}
          {app.notes && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem'
              }}
            >
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Application Notes
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {app.notes}
              </p>
            </div>
          )}

          {/* Chronological Timeline Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="var(--primary)" />
                <span>Application Timeline & History</span>
              </h3>

              <button
                className="btn-dash-action"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                onClick={() => setShowEventForm(!showEventForm)}
              >
                <Plus size={14} />
                <span>Add Milestone</span>
              </button>
            </div>

            {/* Inline Event Form */}
            {showEventForm && (
              <form
                onSubmit={handleAddEventSubmit}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Record New Milestone</h4>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">Event Type</label>
                    <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
                      <option value="Interview">Interview</option>
                      <option value="Assessment">Online Assessment</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Viewed">Application Viewed</option>
                      <option value="Offer">Job Offer</option>
                      <option value="Note">General Milestone</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Technical Coding Round"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Event Date</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Details / Notes</label>
                  <input
                    type="text"
                    placeholder="Brief description of what happened..."
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-dash-action"
                    onClick={() => setShowEventForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-dash-action primary">
                    Save Milestone
                  </button>
                </div>
              </form>
            )}

            {/* Timeline Stream */}
            <div className="timeline-wrapper">
              {timelineItems.length === 0 ? (
                <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No timeline entries recorded yet.
                </div>
              ) : (
                timelineItems.map((item) => (
                  <div key={item.id} className="timeline-item">
                    <div className="timeline-dot">
                      <Clock size={12} />
                    </div>
                    <div className="timeline-content-card">
                      <div className="timeline-header">
                        <span className="timeline-title">{item.title}</span>
                        <span className="timeline-date">{formatFullDate(item.date)}</span>
                      </div>
                      {item.desc && (
                        <p className="timeline-desc">{item.desc}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn-dash-action"
            onClick={() => markAppFollowedUp(app.id)}
            title="Record that you followed up today"
          >
            <MailCheck size={16} />
            <span>Mark as Followed Up Today</span>
          </button>
          <button
            type="button"
            className="btn-dash-action primary"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
