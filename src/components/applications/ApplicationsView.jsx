import React, { useState, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  Plus,
  RotateCcw,
  Briefcase
} from 'lucide-react';
import { useJob } from '../../context/JobContext';
import ApplicationTable from './ApplicationTable';
import ApplicationCardView from './ApplicationCardView';
import AddEditApplicationModal from './AddEditApplicationModal';
import ApplicationDetailModal from './ApplicationDetailModal';
import ConfirmationDialog from '../common/ConfirmationDialog';
import { getDaysDifference } from '../../services/dateUtils';

export default function ApplicationsView({
  initialSearch = '',
  initialFilter = 'all',
  selectedApp = null,
  onClearSelectedApp,
  onOpenAddModal
}) {
  const { applications, removeApplication } = useJob();

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'company-az' | 'company-za' | 'status'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [detailedApp, setDetailedApp] = useState(selectedApp);
  const [deletingApp, setDeletingApp] = useState(null);

  // Sync selectedApp prop
  React.useEffect(() => {
    if (selectedApp) {
      setDetailedApp(selectedApp);
    }
  }, [selectedApp]);

  // Sources list
  const sources = [
    'LinkedIn',
    'JobStreet',
    'Glints',
    'Kalibrr',
    'Indeed',
    'Company Website',
    'Referral',
    'Email',
    'Other'
  ];

  // Filter & Search & Sort pipeline
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCompany = app.company_name?.toLowerCase().includes(q);
          const matchRole = app.position?.toLowerCase().includes(q);
          const matchLoc = app.location?.toLowerCase().includes(q);
          if (!matchCompany && !matchRole && !matchLoc) return false;
        }

        // Status filter
        if (statusFilter === 'attention') {
          // Special attention filter
          const diff = getDaysDifference(app.application_date);
          return (app.current_status === 'Applied' || app.current_status === 'No Response') && diff >= 7;
        } else if (statusFilter !== 'all') {
          if (app.current_status !== statusFilter) return false;
        }

        // Source filter
        if (sourceFilter !== 'all') {
          if (app.applied_via !== sourceFilter) return false;
        }

        // Date filter
        if (dateFilter !== 'all') {
          const diff = getDaysDifference(app.application_date);
          if (dateFilter === 'today' && diff !== 0) return false;
          if (dateFilter === '7d' && diff > 7) return false;
          if (dateFilter === '30d' && diff > 30) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.application_date) - new Date(a.application_date);
        }
        if (sortBy === 'oldest') {
          return new Date(a.application_date) - new Date(b.application_date);
        }
        if (sortBy === 'company-az') {
          return a.company_name.localeCompare(b.company_name);
        }
        if (sortBy === 'company-za') {
          return b.company_name.localeCompare(a.company_name);
        }
        if (sortBy === 'status') {
          return a.current_status.localeCompare(b.current_status);
        }
        return 0;
      });
  }, [applications, searchQuery, statusFilter, sourceFilter, dateFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSourceFilter('all');
    setDateFilter('all');
    setSortBy('newest');
  };

  const handleDeleteConfirm = () => {
    if (deletingApp) {
      removeApplication(deletingApp.id);
      setDeletingApp(null);
      if (detailedApp?.id === deletingApp.id) {
        setDetailedApp(null);
        if (onClearSelectedApp) onClearSelectedApp();
      }
    }
  };

  return (
    <div className="apps-container">
      {/* Controls Bar */}
      <div className="apps-controls-card">
        <div className="controls-top-row">
          <div className="controls-search-group">
            <Search size={18} className="controls-search-icon" />
            <input
              type="text"
              placeholder="Search by company, position, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* View Mode Toggle: Table vs Card */}
            <div className="view-mode-toggle">
              <button
                className={`btn-view-toggle ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={16} />
                <span>Table</span>
              </button>
              <button
                className={`btn-view-toggle ${viewMode === 'card' ? 'active' : ''}`}
                onClick={() => setViewMode('card')}
                title="Card Grid View"
              >
                <LayoutGrid size={16} />
                <span>Cards</span>
              </button>
            </div>

            <button
              className="btn-dash-action primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} strokeWidth={2.4} />
              <span>+ Add Application</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="controls-filters-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>
            <Filter size={14} />
            <span>Filter:</span>
          </div>

          {/* Status Filter */}
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="No Response">No Response</option>
            <option value="Interview">Interview</option>
            <option value="Approved">Approved 🎉</option>
            <option value="Rejected">Rejected</option>
            <option value="attention">⚠️ Needs Attention</option>
          </select>

          {/* Source Filter */}
          <select
            className="filter-select"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All Sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            className="filter-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto' }}>
            <ArrowUpDown size={14} color="var(--text-muted)" />
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="company-az">Company: A to Z</option>
              <option value="company-za">Company: Z to A</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchQuery || statusFilter !== 'all' || sourceFilter !== 'all' || dateFilter !== 'all') && (
            <button
              className="btn-reset-filters"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredApplications.length}</strong> of <strong>{applications.length}</strong> applications
        </span>
      </div>

      {/* Application List View (Table or Card) */}
      {viewMode === 'table' ? (
        <ApplicationTable
          applications={filteredApplications}
          onSelectApp={(app) => setDetailedApp(app)}
          onEditApp={(app) => {
            setEditingApp(app);
            setIsEditModalOpen(true);
          }}
          onDeleteApp={(app) => setDeletingApp(app)}
        />
      ) : (
        <ApplicationCardView
          applications={filteredApplications}
          onSelectApp={(app) => setDetailedApp(app)}
          onEditApp={(app) => {
            setEditingApp(app);
            setIsEditModalOpen(true);
          }}
          onDeleteApp={(app) => setDeletingApp(app)}
        />
      )}

      {/* Add New Application Modal */}
      {isAddModalOpen && (
        <AddEditApplicationModal
          isOpen={isAddModalOpen}
          initialData={null}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Edit Application Modal */}
      {isEditModalOpen && (
        <AddEditApplicationModal
          isOpen={isEditModalOpen}
          initialData={editingApp}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingApp(null);
          }}
        />
      )}

      {/* Detail & Timeline Modal */}
      {detailedApp && (
        <ApplicationDetailModal
          app={detailedApp}
          isOpen={!!detailedApp}
          onClose={() => {
            setDetailedApp(null);
            if (onClearSelectedApp) onClearSelectedApp();
          }}
          onEdit={(app) => {
            setDetailedApp(null);
            setEditingApp(app);
            setIsEditModalOpen(true);
          }}
          onDelete={(app) => {
            setDeletingApp(app);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingApp && (
        <ConfirmationDialog
          isOpen={!!deletingApp}
          title="Delete Application Record"
          message={`Are you sure you want to delete your application for ${deletingApp.position} at ${deletingApp.company_name}? All associated timeline events and status history will also be removed.`}
          confirmText="Yes, Delete Application"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingApp(null)}
        />
      )}
    </div>
  );
}
