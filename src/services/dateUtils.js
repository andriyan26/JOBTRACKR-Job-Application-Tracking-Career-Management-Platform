/**
 * Date Utility Functions for JOBTRACKR
 * Reference Anchor Date: Supports dynamic today calculation based on current system time.
 */

export function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysDifference(dateStr, targetDateStr = null) {
  const d1 = parseDate(dateStr);
  const d2 = targetDateStr ? parseDate(targetDateStr) : new Date();
  if (!d1 || !d2) return 0;
  
  // Normalize to midnight UTC to prevent time zone drift
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  
  const diffTime = utc2 - utc1;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generates smart relative dates:
 * - "Today"
 * - "Yesterday" / "1 day ago"
 * - "X days ago"
 * - "X weeks ago"
 * - "X months ago"
 */
export function formatRelativeDate(dateStr) {
  if (!dateStr) return '-';
  const daysDiff = getDaysDifference(dateStr);

  if (daysDiff < 0) {
    // In the future (e.g. scheduled interview)
    const absDiff = Math.abs(daysDiff);
    if (absDiff === 0) return 'Today';
    if (absDiff === 1) return 'Tomorrow';
    return `In ${absDiff} days`;
  }

  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return '1 day ago';
  if (daysDiff < 7) return `${daysDiff} days ago`;
  if (daysDiff >= 7 && daysDiff < 14) return '1 week ago';
  if (daysDiff >= 14 && daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
  if (daysDiff >= 30 && daysDiff < 60) return '1 month ago';
  if (daysDiff >= 60 && daysDiff < 365) return `${Math.floor(daysDiff / 30)} months ago`;
  return `${Math.floor(daysDiff / 365)} year(s) ago`;
}

/**
 * Returns formatted long date: "21 September 2026"
 */
export function formatFullDate(dateStr) {
  if (!dateStr) return '-';
  const d = parseDate(dateStr);
  if (!d) return dateStr;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '-';
  const d = parseDate(dateStr);
  if (!d) return dateStr;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/**
 * Determines whether an application needs attention:
 * e.g., no response for >= 7 days and has not been followed up recently.
 */
export function needsFollowUp(app) {
  if (!app || !app.application_date) return false;
  
  // If already approved or rejected, no follow-up needed
  if (app.current_status === 'Approved' || app.current_status === 'Rejected') {
    return false;
  }

  const daysSinceApplied = getDaysDifference(app.application_date);
  
  // If status is Applied or No Response, and >= 7 days have passed
  if (daysSinceApplied >= 7) {
    if (app.last_followed_up_at) {
      const daysSinceFollowUp = getDaysDifference(app.last_followed_up_at);
      return daysSinceFollowUp >= 7;
    }
    return true;
  }

  return false;
}
