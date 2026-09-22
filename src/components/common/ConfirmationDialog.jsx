import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmationDialog({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-dialog"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(37, 99, 235, 0.15)',
                color: isDanger ? '#ef4444' : '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <h3 className="modal-title" style={{ fontSize: '1.05rem' }}>
              {title}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        <div className="modal-footer" style={{ padding: '1rem 1.25rem' }}>
          <button
            type="button"
            className="btn-dash-action"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="btn-dash-action primary"
            style={{
              background: isDanger ? '#ef4444' : undefined,
              boxShadow: isDanger ? '0 4px 12px rgba(239, 68, 68, 0.35)' : undefined
            }}
            onClick={onConfirm}
          >
            {isDanger && <Trash2 size={16} />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
