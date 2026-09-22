import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  ExternalLink,
  MailCheck,
  Send,
  Sparkles
} from 'lucide-react';
import { useJob } from '../../context/JobContext';
import { formatRelativeDate, getDaysDifference } from '../../services/dateUtils';

export default function NeedsAttention({ onSelectApp, onOpenCalendar }) {
  const { stats, markAppFollowedUp } = useJob();
  const [activeFollowUpId, setActiveFollowUpId] = useState(null);
  const [followUpNote, setFollowUpNote] = useState('Sent polite follow-up email to HR.');

  const attentionApps = stats.attentionList;
  const upcomingInterviews = stats.upcomingInterviews;

  const handleConfirmFollowUp = (appId) => {
    markAppFollowedUp(appId, followUpNote);
    setActiveFollowUpId(null);
    setFollowUpNote('Sent polite follow-up email to HR.');
  };

  if (attentionApps.length === 0 && upcomingInterviews.length === 0) {
    return (
      <div className="attention-card" style={{ background: 'rgba(16, 185, 129, 0.06)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
        <div className="attention-title-group">
          <div className="attention-icon-glow" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', boxShadow: '0 0 10px rgba(16, 185, 129, 0.25)' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="attention-title" style={{ color: '#10b981' }}>
              All Applications On Track
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              No urgent follow-ups required right now. All submissions are moving smoothly through the pipeline.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="attention-card">
      <div className="attention-header">
        <div className="attention-title-group">
          <div className="attention-icon-glow">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="attention-title">Needs Your Attention</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Priority actions: applications waiting for response over 7 days & upcoming interviews
            </p>
          </div>
        </div>
        <span className="att-warning-pill">
          {attentionApps.length + upcomingInterviews.length} Items Require Action
        </span>
      </div>

      <div className="attention-grid">
        {/* Urgent Follow-Up Recommendations */}
        {attentionApps.map((app) => {
          const days = getDaysDifference(app.application_date);
          const isFollowingUp = activeFollowUpId === app.id;

          return (
            <div key={app.id} className="attention-item-box">
              <div className="attention-item-top">
                <div>
                  <div className="att-company">{app.company_name}</div>
                  <div className="att-role">{app.position} • {app.location}</div>
                </div>
                <span className="att-warning-pill">
                  No response for {days} days
                </span>
              </div>

              <p className="attention-reason">
                Applied on {app.application_date} ({formatRelativeDate(app.application_date)}). Consider following up with HR or recruiter to stay on their radar.
              </p>

              {isFollowingUp ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    placeholder="E.g., Sent follow-up email to HR"
                    style={{ fontSize: '0.78rem', padding: '0.45rem' }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-followup-action primary"
                      onClick={() => handleConfirmFollowUp(app.id)}
                    >
                      <Check size={14} />
                      <span>Save Follow-up</span>
                    </button>
                    <button
                      className="btn-followup-action secondary"
                      onClick={() => setActiveFollowUpId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="attention-actions-row">
                  <button
                    className="btn-followup-action primary"
                    onClick={() => setActiveFollowUpId(app.id)}
                  >
                    <MailCheck size={14} />
                    <span>Mark as Followed Up</span>
                  </button>
                  <button
                    className="btn-followup-action secondary"
                    onClick={() => onSelectApp(app)}
                  >
                    <ExternalLink size={14} />
                    <span>Details</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Upcoming Interview Reminders */}
        {upcomingInterviews.map((evt) => (
          <div
            key={evt.id}
            className="attention-item-box"
            style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}
          >
            <div className="attention-item-top">
              <div>
                <div className="att-company">{evt.title}</div>
                <div className="att-role">Scheduled Interview Event</div>
              </div>
              <span
                className="att-warning-pill"
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  borderColor: 'rgba(245, 158, 11, 0.3)'
                }}
              >
                Date: {evt.event_date}
              </span>
            </div>

            <p className="attention-reason">
              {evt.description || 'Upcoming interview assessment round.'}
            </p>

            <div className="attention-actions-row">
              <button
                className="btn-followup-action primary"
                style={{ background: '#f59e0b', color: '#000' }}
                onClick={onOpenCalendar}
              >
                <Calendar size={14} />
                <span>Open in Calendar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
