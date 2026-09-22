import React, { useState } from 'react';
import { X, Bell, Calendar, Plus, Check, Trash2 } from 'lucide-react';
import { useJob } from '../../context/JobContext';
import { getTodayString, formatFullDate } from '../../services/dateUtils';

export default function RemindersModal({ isOpen, onClose }) {
  const { reminders, addReminder, toggleReminderState, removeReminder, applications } = useJob();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [time, setTime] = useState('10:00');
  const [appId, setAppId] = useState(applications[0]?.id || '');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addReminder({
      title: title.trim(),
      reminder_date: date,
      reminder_time: time,
      application_id: appId || null
    });

    setTitle('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="var(--primary)" />
            <h2 className="modal-title">Job Reminders & Follow-Ups</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* New Reminder Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>+ Add New Reminder</h4>

            <div className="form-group">
              <label className="form-label">Reminder Title / Action *</label>
              <input
                type="text"
                placeholder="e.g. Follow up with Tokopedia HR / Prep technical interview"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Related Application</label>
                <select value={appId} onChange={(e) => setAppId(e.target.value)}>
                  <option value="">General / None</option>
                  {applications.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.company_name} ({a.position})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-dash-action primary">
                <Plus size={15} />
                <span>Save Reminder</span>
              </button>
            </div>
          </form>

          {/* Active Reminders List */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Active Reminders ({reminders.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {reminders.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No active reminders. Add one above!
                </p>
              ) : (
                reminders.map((rem) => {
                  const relatedApp = applications.find((a) => a.id === rem.application_id);

                  return (
                    <div
                      key={rem.id}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        opacity: rem.completed ? 0.5 : 1
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                          type="button"
                          onClick={() => toggleReminderState(rem.id)}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '4px',
                            border: '1.5px solid var(--border-medium)',
                            backgroundColor: rem.completed ? 'var(--primary)' : 'transparent',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          {rem.completed && <Check size={14} />}
                        </button>

                        <div>
                          <div
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: 700,
                              textDecoration: rem.completed ? 'line-through' : 'none'
                            }}
                          >
                            {rem.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {formatFullDate(rem.reminder_date)} at {rem.reminder_time}
                            {relatedApp && ` • ${relatedApp.company_name}`}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-table-action delete"
                        onClick={() => removeReminder(rem.id)}
                        title="Delete Reminder"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-dash-action" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
