import React from 'react';
import {
  Send,
  Users,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

export default function StatusBadge({ status }) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Applied':
        return {
          icon: Send,
          className: 'badge-applied',
          label: 'Applied'
        };
      case 'Interview':
        return {
          icon: Users,
          className: 'badge-interview',
          label: 'Interview'
        };
      case 'Approved':
        return {
          icon: CheckCircle2,
          className: 'badge-approved',
          label: 'Approved 🎉'
        };
      case 'Rejected':
        return {
          icon: XCircle,
          className: 'badge-rejected',
          label: 'Rejected'
        };
      case 'No Response':
      default:
        return {
          icon: Clock,
          className: 'badge-no-response',
          label: 'No Response'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <Icon size={12} strokeWidth={2.4} />
      <span>{config.label}</span>
    </span>
  );
}
