import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import Layout from './components/layout/Layout';
import DashboardView from './components/dashboard/DashboardView';
import ApplicationsView from './components/applications/ApplicationsView';
import CalendarView from './components/calendar/CalendarView';
import AnalyticsView from './components/analytics/AnalyticsView';
import SettingsModal from './components/settings/SettingsModal';
import GmailSyncModal from './components/gmail/GmailSyncModal';
import LandingPage from './components/landing/LandingPage';
import AuthModal from './components/auth/AuthModal';
import RemindersModal from './components/reminders/RemindersModal';

// Styles
import './index.css';
import './styles/layout.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/applications.css';
import './styles/calendar.css';
import './styles/analytics.css';
import './styles/landing.css';
import './styles/gmail.css';

function MainApp() {
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [appSearch, setAppSearch] = useState('');
  const [appFilter, setAppFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isGmailSyncOpen, setIsGmailSyncOpen] = useState(false);

  // Landing / Auth navigation state
  const [showAuthScreen, setShowAuthScreen] = useState(false);

  // If user is not logged in
  if (!isAuthenticated) {
    if (showAuthScreen) {
      return (
        <AuthModal
          onBackToLanding={() => setShowAuthScreen(false)}
        />
      );
    }
    return (
      <LandingPage
        onOpenAuth={() => setShowAuthScreen(true)}
      />
    );
  }

  // Navigation handler
  const handleNavigate = (tab, params = {}) => {
    setActiveTab(tab);
    if (params.search !== undefined) {
      setAppSearch(params.search);
    }
    if (params.filter !== undefined) {
      setAppFilter(params.filter);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout
      activeTab={activeTab}
      onNavigate={handleNavigate}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onOpenGmailSync={() => setIsGmailSyncOpen(true)}
      onSelectApp={(app) => {
        setSelectedApp(app);
        setActiveTab('applications');
      }}
    >
      {/* Tab routing */}
      {activeTab === 'dashboard' && (
        <DashboardView
          onNavigate={handleNavigate}
          onSelectApp={(app) => {
            setSelectedApp(app);
            setActiveTab('applications');
          }}
          onOpenReminderModal={() => setIsReminderModalOpen(true)}
        />
      )}

      {activeTab === 'applications' && (
        <ApplicationsView
          initialSearch={appSearch}
          initialFilter={appFilter}
          selectedApp={selectedApp}
          onClearSelectedApp={() => setSelectedApp(null)}
        />
      )}

      {activeTab === 'calendar' && (
        <CalendarView
          onSelectApp={(app) => {
            setSelectedApp(app);
            setActiveTab('applications');
          }}
          onOpenAddReminder={() => setIsReminderModalOpen(true)}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsView />
      )}

      {/* Top-Level Settings Modal (Only accessible from Top Bar) */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onOpenGmailSync={() => {
            setIsSettingsOpen(false);
            setIsGmailSyncOpen(true);
          }}
        />
      )}

      {/* Smart Gmail Sync & AI Job Scanner Modal */}
      {isGmailSyncOpen && (
        <GmailSyncModal
          isOpen={isGmailSyncOpen}
          onClose={() => setIsGmailSyncOpen(false)}
          onNavigateToApplications={() => {
            setIsGmailSyncOpen(false);
            handleNavigate('applications');
          }}
        />
      )}

      {/* Global Reminders Modal */}
      {isReminderModalOpen && (
        <RemindersModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
        />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <JobProvider>
          <MainApp />
        </JobProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
