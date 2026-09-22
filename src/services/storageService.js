/**
 * LocalStorage Relational Storage Service for JOBTRACKR
 * Ensures isolation by user_id and persistent data.
 */

import {
  INITIAL_USER,
  INITIAL_APPLICATIONS,
  INITIAL_STATUS_HISTORY,
  INITIAL_APPLICATION_EVENTS,
  INITIAL_REMINDERS
} from './dummyData';
import { getTodayString } from './dateUtils';

const KEYS = {
  USERS: 'jobtrackr_users_v1',
  CURRENT_USER_ID: 'jobtrackr_current_user_id_v1',
  THEME: 'jobtrackr_theme_v1'
};

function getAppsKey(userId) {
  return `jobtrackr_apps_${userId}`;
}

function getHistoryKey(userId) {
  return `jobtrackr_history_${userId}`;
}

function getEventsKey(userId) {
  return `jobtrackr_events_${userId}`;
}

function getRemindersKey(userId) {
  return `jobtrackr_reminders_${userId}`;
}

// Initialize seed data if not present
export function initializeStorage() {
  try {
    let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    
    // Purge demo account if user has created an account
    if (users.length > 1) {
      users = users.filter((u) => u.id !== 'usr_andrian_01' && u.email !== 'andrian@jobtrackr.io');
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }

    const currentId = localStorage.getItem(KEYS.CURRENT_USER_ID);
    if (currentId === 'usr_andrian_01' && users.length > 0 && users[0].id !== 'usr_andrian_01') {
      localStorage.setItem(KEYS.CURRENT_USER_ID, users[0].id);
    } else if (!currentId && users.length > 0) {
      localStorage.setItem(KEYS.CURRENT_USER_ID, users[0].id);
    }

    if (!localStorage.getItem(KEYS.THEME)) {
      localStorage.setItem(KEYS.THEME, 'dark'); // Default to dark command center theme
    }
  } catch (e) {
    console.error('Storage initialization failed:', e);
  }
}

// User & Auth operations
export function getUsers() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    return raw.filter((u) => u.id !== 'usr_andrian_01' && u.email !== 'andrian@jobtrackr.io');
  } catch {
    return [];
  }
}

export function getCurrentUser() {
  initializeStorage();
  const currentId = localStorage.getItem(KEYS.CURRENT_USER_ID);
  const users = getUsers();
  return users.find((u) => u.id === currentId) || users[0] || null;
}

export function setCurrentUser(userId) {
  localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
}

export function loginUser(email, password) {
  initializeStorage();
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  
  if (user) {
    setCurrentUser(user.id);
    return { success: true, user };
  }

  return { success: false, message: 'Invalid email or password.' };
}

export function registerUser(name, email, password) {
  initializeStorage();
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role_title: 'Job Seeker',
    location: 'Indonesia',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    created_at: getTodayString()
  };

  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  setCurrentUser(newUser.id);

  // Initialize empty collections for the new user
  localStorage.setItem(getAppsKey(newUser.id), JSON.stringify([]));
  localStorage.setItem(getHistoryKey(newUser.id), JSON.stringify([]));
  localStorage.setItem(getEventsKey(newUser.id), JSON.stringify([]));
  localStorage.setItem(getRemindersKey(newUser.id), JSON.stringify([]));

  return { success: true, user: newUser };
}

export function updateUserProfile(userId, profileData) {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...profileData, updated_at: new Date().toISOString() };
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return users[index];
  }
  return null;
}

// Applications CRUD
export function getApplications(userId) {
  try {
    const raw = localStorage.getItem(getAppsKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveApplication(userId, appData) {
  const apps = getApplications(userId);
  let updatedApp;

  if (appData.id) {
    // Edit existing
    const index = apps.findIndex((a) => a.id === appData.id);
    if (index !== -1) {
      const oldApp = apps[index];
      const statusChanged = oldApp.current_status !== appData.current_status;

      updatedApp = {
        ...oldApp,
        ...appData,
        result: appData.result || appData.current_status,
        updated_at: new Date().toISOString()
      };
      apps[index] = updatedApp;

      // Log status history automatically if status changed
      if (statusChanged) {
        addStatusHistory(userId, appData.id, oldApp.current_status, appData.current_status, 'Status updated via application editor.');
      }
    }
  } else {
    // Create new
    updatedApp = {
      ...appData,
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      user_id: userId,
      result: appData.result || appData.current_status || 'Applied',
      current_status: appData.current_status || 'Applied',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_followed_up_at: null
    };
    apps.unshift(updatedApp);

    // Initial timeline event & status history
    addApplicationEvent(userId, updatedApp.id, {
      event_type: 'Applied',
      event_date: updatedApp.application_date || getTodayString(),
      title: 'Application Created',
      description: `Applied for ${updatedApp.position} at ${updatedApp.company_name} via ${updatedApp.applied_via}.`
    });

    addStatusHistory(userId, updatedApp.id, null, updatedApp.current_status, 'Initial application submitted.');
  }

  localStorage.setItem(getAppsKey(userId), JSON.stringify(apps));
  return updatedApp;
}

export function deleteApplication(userId, appId) {
  const apps = getApplications(userId).filter((a) => a.id !== appId);
  localStorage.setItem(getAppsKey(userId), JSON.stringify(apps));

  // Also cleanup events, history, reminders
  const history = getStatusHistory(userId).filter((h) => h.application_id !== appId);
  localStorage.setItem(getHistoryKey(userId), JSON.stringify(history));

  const events = getApplicationEvents(userId).filter((e) => e.application_id !== appId);
  localStorage.setItem(getEventsKey(userId), JSON.stringify(events));

  const reminders = getReminders(userId).filter((r) => r.application_id !== appId);
  localStorage.setItem(getRemindersKey(userId), JSON.stringify(reminders));

  return true;
}

export function markFollowedUp(userId, appId, note = 'Sent follow-up email to HR.') {
  const apps = getApplications(userId);
  const index = apps.findIndex((a) => a.id === appId);
  if (index !== -1) {
    const today = getTodayString();
    apps[index].last_followed_up_at = today;
    apps[index].updated_at = new Date().toISOString();
    localStorage.setItem(getAppsKey(userId), JSON.stringify(apps));

    addApplicationEvent(userId, appId, {
      event_type: 'Follow-up',
      event_date: today,
      title: 'Follow-up Sent',
      description: note
    });

    return apps[index];
  }
  return null;
}

// Status History
export function getStatusHistory(userId, appId = null) {
  try {
    const raw = localStorage.getItem(getHistoryKey(userId));
    const all = raw ? JSON.parse(raw) : [];
    return appId ? all.filter((h) => h.application_id === appId) : all;
  } catch {
    return [];
  }
}

export function addStatusHistory(userId, appId, oldStatus, newStatus, note = '') {
  const history = getStatusHistory(userId);
  const entry = {
    id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    application_id: appId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_at: new Date().toISOString(),
    note
  };
  history.unshift(entry);
  localStorage.setItem(getHistoryKey(userId), JSON.stringify(history));
  return entry;
}

// Application Events (Chronological Timeline)
export function getApplicationEvents(userId, appId = null) {
  try {
    const raw = localStorage.getItem(getEventsKey(userId));
    const all = raw ? JSON.parse(raw) : [];
    return appId ? all.filter((e) => e.application_id === appId) : all;
  } catch {
    return [];
  }
}

export function addApplicationEvent(userId, appId, eventData) {
  const events = getApplicationEvents(userId);
  const newEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    application_id: appId,
    event_type: eventData.event_type || 'Note',
    event_date: eventData.event_date || getTodayString(),
    title: eventData.title,
    description: eventData.description || '',
    created_at: new Date().toISOString()
  };
  events.push(newEvent);
  localStorage.setItem(getEventsKey(userId), JSON.stringify(events));
  return newEvent;
}

// Reminders
export function getReminders(userId) {
  try {
    const raw = localStorage.getItem(getRemindersKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReminder(userId, reminderData) {
  const reminders = getReminders(userId);
  let updated;

  if (reminderData.id) {
    const index = reminders.findIndex((r) => r.id === reminderData.id);
    if (index !== -1) {
      updated = { ...reminders[index], ...reminderData };
      reminders[index] = updated;
    }
  } else {
    updated = {
      ...reminderData,
      id: `rem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      user_id: userId,
      completed: false,
      created_at: new Date().toISOString()
    };
    reminders.unshift(updated);
  }

  localStorage.setItem(getRemindersKey(userId), JSON.stringify(reminders));
  return updated;
}

export function toggleReminder(userId, reminderId) {
  const reminders = getReminders(userId);
  const index = reminders.findIndex((r) => r.id === reminderId);
  if (index !== -1) {
    reminders[index].completed = !reminders[index].completed;
    localStorage.setItem(getRemindersKey(userId), JSON.stringify(reminders));
    return reminders[index];
  }
  return null;
}

export function deleteReminder(userId, reminderId) {
  const reminders = getReminders(userId).filter((r) => r.id !== reminderId);
  localStorage.setItem(getRemindersKey(userId), JSON.stringify(reminders));
  return true;
}

// Reset data to demo state
export function resetDemoData(userId = INITIAL_USER.id) {
  localStorage.setItem(getAppsKey(userId), JSON.stringify(INITIAL_APPLICATIONS));
  localStorage.setItem(getHistoryKey(userId), JSON.stringify(INITIAL_STATUS_HISTORY));
  localStorage.setItem(getEventsKey(userId), JSON.stringify(INITIAL_APPLICATION_EVENTS));
  localStorage.setItem(getRemindersKey(userId), JSON.stringify(INITIAL_REMINDERS));
}

// Theme
export function getStoredTheme() {
  return localStorage.getItem(KEYS.THEME) || 'dark';
}

export function setStoredTheme(theme) {
  localStorage.setItem(KEYS.THEME, theme);
}
