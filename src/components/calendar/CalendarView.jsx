import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Users,
  Clock,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { useJob } from '../../context/JobContext';
import { formatFullDate, getTodayString } from '../../services/dateUtils';

export default function CalendarView({ onSelectApp, onOpenAddReminder }) {
  const { applications, applicationEvents, reminders } = useJob();

  // Current viewed month and year (defaults to current system date / Sep 2026)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // September 2026

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Compile all scheduled events: applications, milestones, and reminders
  const scheduledEvents = useMemo(() => {
    const list = [];

    // Application applied dates
    applications.forEach((app) => {
      if (app.application_date) {
        list.push({
          id: `app_date_${app.id}`,
          date: app.application_date,
          title: `Applied: ${app.company_name}`,
          type: 'Applied',
          appId: app.id,
          app
        });
      }
    });

    // Timeline events (Interviews, assessments)
    applicationEvents.forEach((evt) => {
      const app = applications.find((a) => a.id === evt.application_id);
      list.push({
        id: evt.id,
        date: evt.event_date,
        title: `${evt.title} (${app?.company_name || 'App'})`,
        type: evt.event_type || 'Interview',
        appId: evt.application_id,
        app
      });
    });

    // Reminders
    reminders.forEach((rem) => {
      const app = applications.find((a) => a.id === rem.application_id);
      list.push({
        id: rem.id,
        date: rem.reminder_date,
        title: `🔔 ${rem.title}`,
        type: 'Reminder',
        appId: rem.application_id,
        app,
        completed: rem.completed
      });
    });

    return list;
  }, [applications, applicationEvents, reminders]);

  // Generate calendar days grid (including padding days from prev/next month)
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    // Monday as 0, Sunday as 6
    const shift = (firstDayIndex + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month days
    for (let i = shift - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({
        dayNum,
        dateStr,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const monthPadded = String(month + 1).padStart(2, '0');
      const dayPadded = String(i).padStart(2, '0');
      const dateStr = `${year}-${monthPadded}-${dayPadded}`;
      days.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: true
      });
    }

    // Next month padding to fill complete weeks (up to 35 or 42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: false
      });
    }

    return days;
  }, [year, month]);

  const todayStr = getTodayString();

  return (
    <div className="calendar-page-container">
      {/* Calendar Header Controls */}
      <div className="calendar-header-card">
        <div className="calendar-month-controls">
          <button className="btn-dash-action" onClick={handlePrevMonth} title="Previous Month">
            <ChevronLeft size={16} />
          </button>
          <h2 className="calendar-month-title">
            {monthNames[month]} {year}
          </h2>
          <button className="btn-dash-action" onClick={handleNextMonth} title="Next Month">
            <ChevronRight size={16} />
          </button>
          <button className="btn-dash-action" onClick={handleToday} style={{ fontSize: '0.78rem' }}>
            Today
          </button>
        </div>

        {/* Legend */}
        <div className="calendar-legend-bar">
          <div className="legend-dot-item">
            <span className="pulse-dot" style={{ color: '#f59e0b' }}></span>
            <span>Interview</span>
          </div>
          <div className="legend-dot-item">
            <span className="pulse-dot" style={{ color: '#3b82f6' }}></span>
            <span>Follow-up / Applied</span>
          </div>
          <div className="legend-dot-item">
            <span className="pulse-dot" style={{ color: '#10b981' }}></span>
            <span>Offer / Reminder</span>
          </div>
        </div>

        <div>
          <button className="btn-dash-action primary" onClick={onOpenAddReminder}>
            <Plus size={16} />
            <span>+ Add Reminder / Event</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="calendar-grid-card">
        {/* Weekday headers */}
        <div className="calendar-weekdays-row">
          {weekdays.map((day) => (
            <div key={day} className="calendar-weekday-cell">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="calendar-days-grid">
          {calendarDays.map((dayObj, idx) => {
            const isToday = dayObj.dateStr === todayStr;
            const dayEvents = scheduledEvents.filter((e) => e.date === dayObj.dateStr);

            return (
              <div
                key={idx}
                className={`calendar-day-cell ${
                  !dayObj.isCurrentMonth ? 'outside-month' : ''
                } ${isToday ? 'is-today' : ''}`}
              >
                <div className="day-cell-header">
                  <span className="day-number">{dayObj.dayNum}</span>
                  {dayEvents.length > 0 && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                    </span>
                  )}
                </div>

                {/* Day events pills */}
                <div className="calendar-events-list">
                  {dayEvents.map((evt) => {
                    let pillClass = 'pill-followup';
                    if (evt.type === 'Interview') pillClass = 'pill-interview';
                    if (evt.type === 'Approved' || evt.type === 'Offer') pillClass = 'pill-approved';
                    if (evt.type === 'Reminder') pillClass = 'pill-reminder';

                    return (
                      <div
                        key={evt.id}
                        className={`calendar-event-pill ${pillClass}`}
                        onClick={() => evt.app && onSelectApp(evt.app)}
                        title={evt.title}
                      >
                        {evt.type === 'Interview' && <Users size={11} />}
                        {evt.type === 'Reminder' && <Bell size={11} />}
                        {evt.type === 'Applied' && <Clock size={11} />}
                        <span>{evt.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
