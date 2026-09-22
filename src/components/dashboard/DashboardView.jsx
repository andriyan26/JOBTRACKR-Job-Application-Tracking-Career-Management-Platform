import React from 'react';
import { Plus, Calendar, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatCards from './StatCards';
import PipelineView from './PipelineView';
import NeedsAttention from './NeedsAttention';
import OverviewChart from './OverviewChart';
import RecentApplications from './RecentApplications';

export default function DashboardView({
  onOpenAddModal,
  onNavigate,
  onSelectApp,
  onOpenReminderModal
}) {
  const { currentUser } = useAuth();

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Andrian';

  return (
    <div className="dashboard-container">
      {/* Top Greeting Header with Quick Action Buttons */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting-title">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="dashboard-greeting-sub">
            Here's an overview of your job search command center.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="dashboard-quick-actions">
          <button
            className="btn-dash-action"
            onClick={() => onNavigate('applications')}
            title="Browse all applications"
          >
            <span>View Applications</span>
          </button>

          <button
            className="btn-dash-action"
            onClick={() => onNavigate('calendar')}
            title="Schedule an upcoming interview"
          >
            <Calendar size={16} />
            <span>Schedule Interview</span>
          </button>

          <button
            className="btn-dash-action"
            onClick={onOpenReminderModal}
            title="Create a new reminder"
          >
            <Clock size={16} />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* 5 Statistics Cards */}
      <StatCards
        onFilterClick={(status) => {
          onNavigate('applications', { filter: status });
        }}
      />

      {/* Needs Your Attention (Priority 5 Section from PRD) */}
      <NeedsAttention
        onSelectApp={onSelectApp}
        onOpenCalendar={() => onNavigate('calendar')}
      />

      {/* Visual Application Pipeline */}
      <PipelineView
        onStageClick={(status) => {
          onNavigate('applications', { filter: status });
        }}
      />

      {/* 2-Column Split: Activity Chart & Recent Applications */}
      <div className="dashboard-split-grid">
        <OverviewChart />
        <RecentApplications
          onViewAll={() => onNavigate('applications')}
          onSelectApp={onSelectApp}
        />
      </div>
    </div>
  );
}
