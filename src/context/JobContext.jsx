import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  getApplications,
  saveApplication,
  deleteApplication,
  getStatusHistory,
  addStatusHistory,
  getApplicationEvents,
  addApplicationEvent,
  getReminders,
  saveReminder,
  toggleReminder,
  deleteReminder,
  markFollowedUp,
  resetDemoData
} from '../services/storageService';
import { needsFollowUp, getDaysDifference } from '../services/dateUtils';
import confetti from 'canvas-confetti';

const JobContext = createContext();

export function JobProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;

  const [applications, setApplications] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [applicationEvents, setApplicationEvents] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all user records
  const refreshData = () => {
    if (!userId) {
      setApplications([]);
      setStatusHistory([]);
      setApplicationEvents([]);
      setReminders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const apps = getApplications(userId);
    const history = getStatusHistory(userId);
    const events = getApplicationEvents(userId);
    const rems = getReminders(userId);

    setApplications(apps);
    setStatusHistory(history);
    setApplicationEvents(events);
    setReminders(rems);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [userId]);

  // CRUD actions
  const addApplication = (appData) => {
    if (!userId) return null;
    const saved = saveApplication(userId, appData);
    refreshData();
    if (saved.current_status === 'Approved') {
      triggerConfetti();
    }
    return saved;
  };

  const editApplication = (appData) => {
    if (!userId) return null;
    const oldApp = applications.find((a) => a.id === appData.id);
    const saved = saveApplication(userId, appData);
    refreshData();
    if (oldApp?.current_status !== 'Approved' && saved.current_status === 'Approved') {
      triggerConfetti();
    }
    return saved;
  };

  const removeApplication = (appId) => {
    if (!userId) return false;
    const success = deleteApplication(userId, appId);
    refreshData();
    return success;
  };

  const changeStatus = (appId, newStatus, note = '') => {
    if (!userId) return null;
    const app = applications.find((a) => a.id === appId);
    if (!app) return null;

    const oldStatus = app.current_status;
    const updated = saveApplication(userId, {
      ...app,
      current_status: newStatus,
      result: newStatus
    });

    addStatusHistory(userId, appId, oldStatus, newStatus, note || `Status changed from ${oldStatus} to ${newStatus}`);

    // Automatically add an event for major milestones
    addApplicationEvent(userId, appId, {
      event_type: newStatus,
      title: `Status: ${newStatus}`,
      description: note || `Application progressed to ${newStatus}`
    });

    refreshData();

    if (newStatus === 'Approved') {
      triggerConfetti();
    }
    return updated;
  };

  const markAppFollowedUp = (appId, note = 'Sent follow-up email to HR.') => {
    if (!userId) return null;
    const res = markFollowedUp(userId, appId, note);
    refreshData();
    return res;
  };

  const addEvent = (appId, eventData) => {
    if (!userId) return null;
    const res = addApplicationEvent(userId, appId, eventData);
    refreshData();
    return res;
  };

  const addReminder = (remData) => {
    if (!userId) return null;
    const res = saveReminder(userId, remData);
    refreshData();
    return res;
  };

  const toggleReminderState = (remId) => {
    if (!userId) return null;
    const res = toggleReminder(userId, remId);
    refreshData();
    return res;
  };

  const removeReminder = (remId) => {
    if (!userId) return false;
    const res = deleteReminder(userId, remId);
    refreshData();
    return res;
  };

  const resetAllData = () => {
    if (!userId) return;
    resetDemoData(userId);
    refreshData();
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  // Dynamic Statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const interview = applications.filter((a) => a.current_status === 'Interview').length;
    const approved = applications.filter((a) => a.current_status === 'Approved').length;
    const rejected = applications.filter((a) => a.current_status === 'Rejected').length;
    const noResponse = applications.filter((a) => a.current_status === 'No Response').length;
    const appliedOnly = applications.filter((a) => a.current_status === 'Applied').length;

    const successRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const interviewRate = total > 0 ? Math.round((interview / total) * 100) : 0;
    const responseRate = total > 0 ? Math.round(((interview + approved + rejected) / total) * 100) : 0;

    // Applications that need attention (no response >= 7 days)
    const attentionList = applications.filter(needsFollowUp);

    // Upcoming interviews or events
    const upcomingInterviews = applicationEvents.filter((e) => {
      if (e.event_type !== 'Interview') return false;
      const diff = getDaysDifference(e.event_date);
      return diff <= 0 && diff >= -14; // upcoming in next 14 days
    });

    return {
      total,
      interview,
      approved,
      rejected,
      noResponse,
      appliedOnly,
      successRate,
      interviewRate,
      responseRate,
      attentionList,
      upcomingInterviews
    };
  }, [applications, applicationEvents]);

  return (
    <JobContext.Provider
      value={{
        applications,
        statusHistory,
        applicationEvents,
        reminders,
        stats,
        loading,
        addApplication,
        editApplication,
        removeApplication,
        changeStatus,
        markAppFollowedUp,
        addEvent,
        addReminder,
        toggleReminderState,
        removeReminder,
        resetAllData,
        refreshData
      }}
    >
      {children}
    </JobContext.Provider>
  );
}

export function useJob() {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
}
