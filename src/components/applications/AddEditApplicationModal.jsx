import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Sparkles } from 'lucide-react';
import { useJob } from '../../context/JobContext';
import { getTodayString } from '../../services/dateUtils';

export default function AddEditApplicationModal({ isOpen, onClose, initialData = null }) {
  const { addApplication, editApplication } = useJob();

  const [formData, setFormData] = useState({
    company_name: '',
    position: '',
    location: 'Jakarta',
    application_date: getTodayString(),
    applied_via: 'LinkedIn',
    job_url: '',
    employment_type: 'Full Time',
    work_arrangement: 'Hybrid',
    salary_min: '',
    salary_max: '',
    currency: 'IDR',
    current_status: 'Applied',
    notes: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        salary_min: initialData.salary_min || '',
        salary_max: initialData.salary_max || '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        company_name: '',
        position: '',
        location: 'Jakarta',
        application_date: getTodayString(),
        applied_via: 'LinkedIn',
        job_url: '',
        employment_type: 'Full Time',
        work_arrangement: 'Hybrid',
        salary_min: '',
        salary_max: '',
        currency: 'IDR',
        current_status: 'Applied',
        notes: ''
      });
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations (PRD Section 29)
    if (!formData.company_name.trim()) {
      setErrorMsg('Company Name is required.');
      return;
    }
    if (!formData.position.trim()) {
      setErrorMsg('Position is required.');
      return;
    }
    if (!formData.application_date) {
      setErrorMsg('Application Date is required.');
      return;
    }

    if (formData.job_url && !formData.job_url.startsWith('http')) {
      setErrorMsg('Job URL must be a valid web address (starting with http:// or https://).');
      return;
    }

    const payload = {
      ...formData,
      salary_min: formData.salary_min ? Number(formData.salary_min) : null,
      salary_max: formData.salary_max ? Number(formData.salary_max) : null
    };

    if (initialData?.id) {
      editApplication({ ...payload, id: initialData.id });
    } else {
      addApplication(payload);
    }

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {initialData ? 'Edit Application' : 'Add New Application'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {errorMsg && (
              <div className="auth-error-box">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Row 1: Company & Position */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Company Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. PT Telkom Indonesia"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Position / Role <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Backend Developer"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Row 2: Location, Date & Applied Via */}
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Jakarta / Bandung / Remote"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Application Date <span className="req">*</span>
                </label>
                <input
                  type="date"
                  value={formData.application_date}
                  onChange={(e) => handleChange('application_date', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Applied Via <span className="req">*</span>
                </label>
                <select
                  value={formData.applied_via}
                  onChange={(e) => handleChange('applied_via', e.target.value)}
                  required
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="JobStreet">JobStreet</option>
                  <option value="Glints">Glints</option>
                  <option value="Kalibrr">Kalibrr</option>
                  <option value="Indeed">Indeed</option>
                  <option value="Company Website">Company Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Email">Email</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Row 3: Employment Type & Work Arrangement & Status */}
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => handleChange('employment_type', e.target.value)}
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Work Arrangement</label>
                <select
                  value={formData.work_arrangement}
                  onChange={(e) => handleChange('work_arrangement', e.target.value)}
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Status</label>
                <select
                  value={formData.current_status}
                  onChange={(e) => handleChange('current_status', e.target.value)}
                >
                  <option value="Applied">Applied</option>
                  <option value="No Response">No Response</option>
                  <option value="Interview">Interview</option>
                  <option value="Approved">Approved 🎉</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Row 4: Salary Min, Max & Currency */}
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Min Salary (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 15000000"
                  value={formData.salary_min}
                  onChange={(e) => handleChange('salary_min', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Max Salary (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 22000000"
                  value={formData.salary_max}
                  onChange={(e) => handleChange('salary_max', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                >
                  <option value="IDR">IDR (Rp)</option>
                  <option value="USD">USD ($)</option>
                  <option value="SGD">SGD (S$)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            {/* Job URL */}
            <div className="form-group">
              <label className="form-label">Job Listing URL (Optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.job_url}
                onChange={(e) => handleChange('job_url', e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                rows={3}
                placeholder="CV dan portfolio sudah dikirim. Kontak HR via LinkedIn."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-dash-action"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-dash-action primary"
            >
              <Save size={16} />
              <span>{initialData ? 'Update Application' : 'Save Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
