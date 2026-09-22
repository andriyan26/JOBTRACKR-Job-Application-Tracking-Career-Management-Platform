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
  resetDemoData,
  getNotifications,
  addNotification as saveNotif,
  markNotificationRead as markNotifRead,
  clearNotifications as clearNotifs,
  getGmailConfig,
  saveGmailConfig,
  getSyncedEmailIds,
  markEmailAsSynced
} from '../services/storageService';
import { needsFollowUp, getDaysDifference, getTodayString } from '../services/dateUtils';
import confetti from 'canvas-confetti';

const JobContext = createContext();

export function JobProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;

  const [applications, setApplications] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [applicationEvents, setApplicationEvents] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [syncedEmailIds, setSyncedEmailIds] = useState([]);
  const [gmailConfig, setGmailConfig] = useState({ connected: false, email: '', clientId: '', autoSync: true });
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
    const notifs = getNotifications(userId);
    const gConfig = getGmailConfig(userId);
    const synced = getSyncedEmailIds(userId);

    setApplications(apps);
    setStatusHistory(history);
    setApplicationEvents(events);
    setReminders(rems);
    setNotifications(notifs);
    setGmailConfig(gConfig);
    setSyncedEmailIds(synced);
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

    const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

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
      upcomingInterviews,
      unreadNotificationsCount
    };
  }, [applications, applicationEvents, notifications]);

  // Notifications API
  const pushNotification = (notifData) => {
    if (!userId) return null;
    const item = saveNotif(userId, notifData);
    setNotifications(getNotifications(userId));
    return item;
  };

  const markNotificationAsRead = (notifId) => {
    if (!userId) return;
    const updated = markNotifRead(userId, notifId);
    setNotifications(updated);
  };

  const clearAllNotifications = () => {
    if (!userId) return;
    clearNotifs(userId);
    setNotifications([]);
  };

  const updateGmailConfiguration = (configData) => {
    if (!userId) return null;
    const updated = saveGmailConfig(userId, configData);
    setGmailConfig(updated);
    return updated;
  };

  // Smart Sync orchestration: Takes parsed email metadata and auto-creates or auto-updates
  const syncParsedJobEmail = (parsed, emailId = null) => {
    if (!userId) return null;

    const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const pComp = norm(parsed.company_name);
    const pRole = norm(parsed.position);

    // Strict duplicate check
    const existing = applications.find((a) => {
      const aComp = norm(a.company_name);
      const aRole = norm(a.position);

      const compMatch =
        aComp.length >= 3 &&
        pComp.length >= 3 &&
        (aComp === pComp || aComp.includes(pComp) || pComp.includes(aComp));

      const roleMatch = !pRole || !aRole || aRole.includes(pRole) || pRole.includes(aRole);

      return compMatch && roleMatch;
    });

    if (existing) {
      if (existing.current_status !== parsed.current_status) {
        // Update status of existing application
        const updated = changeStatus(existing.id, parsed.current_status, parsed.summary);

        if (parsed.current_status === 'Interview' && parsed.interview_date) {
          addEvent(existing.id, {
            event_type: 'Interview',
            event_date: parsed.interview_date,
            title: `Interview: ${existing.company_name}`,
            description: parsed.summary
          });
        }

        pushNotification({
          title: `📧 Status Updated: ${existing.company_name}`,
          message: `Application status updated to "${parsed.current_status}".`,
          type: parsed.current_status.toLowerCase(),
          source: 'gmail',
          link_app_id: existing.id
        });

        if (emailId) {
          markEmailAsSynced(userId, emailId);
          setSyncedEmailIds(getSyncedEmailIds(userId));
        }

        refreshData();
        return { action: 'updated', application: updated };
      } else {
        // Exactly identical application and status -> Prevent duplicate insertion!
        if (emailId) {
          markEmailAsSynced(userId, emailId);
          setSyncedEmailIds(getSyncedEmailIds(userId));
        }
        return { action: 'already_exists', application: existing };
      }
    } else {
      // Truly new application -> Auto-create single record
      const newAppData = {
        company_name: parsed.company_name,
        position: parsed.position,
        applied_via: parsed.applied_via || 'LinkedIn',
        current_status: parsed.current_status || 'Applied',
        work_mode: parsed.work_mode || 'Remote',
        location: 'Indonesia',
        salary_range: 'Competitive',
        application_date: getTodayString(),
        notes: `Automatically imported via Smart Gmail Sync.\n${parsed.summary}`
      };

      const created = addApplication(newAppData);

      if (parsed.current_status === 'Interview' && parsed.interview_date) {
        addEvent(created.id, {
          event_type: 'Interview',
          event_date: parsed.interview_date,
          title: `Interview: ${created.company_name}`,
          description: parsed.summary
        });
      }

      pushNotification({
        title: `✨ New Application Auto-Added: ${created.company_name}`,
        message: `Detected ${created.position} via ${created.applied_via}. Added to tracker!`,
        type: 'success',
        source: 'gmail',
        link_app_id: created.id
      });

      if (emailId) {
        markEmailAsSynced(userId, emailId);
        setSyncedEmailIds(getSyncedEmailIds(userId));
      }

      refreshData();
      return { action: 'created', application: created };
    }
  };

  return (
    <JobContext.Provider
      value={{
        applications,
        statusHistory,
        applicationEvents,
        reminders,
        notifications,
        syncedEmailIds,
        gmailConfig,
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
        pushNotification,
        markNotificationAsRead,
        clearAllNotifications,
        updateGmailConfiguration,
        syncParsedJobEmail,
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
