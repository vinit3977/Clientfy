import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectsAPI, clientsAPI, usersAPI } from '../../api/services';
import {
  FolderKanban,
  Plus,
  Search,
  LayoutGrid,
  List,
  Calendar,
  DollarSign,
  User,
  Clock,
  Edit2,
  Trash2,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  getStatusBadge,
  formatStatus,
  formatCurrency,
  formatDate,
  getPriorityColor
} from '../../utils/helpers';
import { CURRENCIES, getSymbolForCurrency } from '../../utils/currencies';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const { user, can } = useAuth();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & View
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    project_manager: '',
    assigned_team: [],
    start_date: '',
    deadline: '',
    budget: '',
    currency: 'USD',
    currency_symbol: '$',
    status: 'planning',
    priority: 'medium',
    progress: 0,
    notes: '',
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const res = await projectsAPI.list(params);
      setProjects(res.data.results || res.data || []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [cRes, uRes] = await Promise.all([
        clientsAPI.list({ page_size: 100 }),
        usersAPI.list({ page_size: 100 }),
      ]);
      setClients(cRes.data.results || cRes.data || []);
      setTeamMembers(uRes.data.results || uRes.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchMeta();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      client: '',
      project_manager: user?.role === 'manager' ? user.id : '',
      assigned_team: [],
      start_date: '',
      deadline: '',
      budget: '',
      currency: 'USD',
      currency_symbol: '$',
      status: 'planning',
      priority: 'medium',
      progress: 0,
      notes: '',
    });
    setEditingProject(null);
  };

  const handleClientChange = (clientId) => {
    const selected = clients.find((c) => String(c.id) === String(clientId));
    setFormData((prev) => ({
      ...prev,
      client: clientId,
      currency: selected?.currency || prev.currency || 'USD',
      currency_symbol: selected?.currency_symbol || prev.currency_symbol || '$',
    }));
  };

  const handleCurrencyChange = (currencyCode) => {
    const sym = getSymbolForCurrency(currencyCode);
    setFormData((prev) => ({
      ...prev,
      currency: currencyCode,
      currency_symbol: sym,
    }));
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProject(p);
    setFormData({
      name: p.name || '',
      description: p.description || '',
      client: p.client || '',
      project_manager: p.project_manager || '',
      assigned_team: p.assigned_team || [],
      start_date: p.start_date || '',
      deadline: p.deadline || '',
      budget: p.budget || '',
      currency: p.currency || 'USD',
      currency_symbol: p.currency_symbol || '$',
      status: p.status || 'planning',
      priority: p.priority || 'medium',
      progress: p.progress || 0,
      notes: p.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.project_manager) delete payload.project_manager;
      if (!payload.budget) delete payload.budget;

      if (editingProject) {
        await projectsAPI.update(editingProject.id, payload);
        toast.success('Project updated successfully');
      } else {
        await projectsAPI.create(payload);
        toast.success('Project created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchProjects();
    } catch (err) {
      const msg = err.response?.data
        ? Object.entries(err.response.data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
            .join(' | ')
        : 'Failed to save project';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await projectsAPI.delete(deletingId);
      toast.success('Project deleted');
      setDeletingId(null);
      fetchProjects();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const managers = teamMembers.filter((m) => ['admin', 'manager'].includes(m.role));

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Project Management</h1>
          <p className="page-subtitle">
            Track deliverables, timelines, milestones, and client outcomes
          </p>
        </div>

        {can.manageProjects() && (
          <button onClick={openCreateModal} className="btn-primary">
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {/* Filter and View Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select text-xs w-full sm:w-36"
          >
            <option value="">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="form-select text-xs w-full sm:w-36"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {loading ? (
        <LoadingSpinner />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Create your first client project or change filter criteria."
          action={
            can.manageProjects() && (
              <button onClick={openCreateModal} className="btn-primary">
                <Plus size={16} /> Create Project
              </button>
            )
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="card-hover p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className={getStatusBadge(p.status)}>
                    {formatStatus(p.status)}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${getPriorityColor(p.priority)}`}>
                    {p.priority}
                  </span>
                </div>

                <Link
                  to={`/projects/${p.id}`}
                  className="font-extrabold text-gray-900 hover:text-indigo-600 transition-colors text-base mt-3 block leading-snug"
                >
                  {p.name}
                </Link>

                <p className="text-xs text-indigo-600 font-semibold mt-1">
                  Client: {p.client_name || 'N/A'}
                </p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="font-semibold text-gray-700">Completion</span>
                    <span className="font-bold text-gray-900">{p.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${p.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Project Details Strip */}
                <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <User size={13} className="text-gray-400 shrink-0" />
                    <span className="truncate">{p.manager_name || 'Unassigned'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate justify-end">
                    <Calendar size={13} className="text-gray-400 shrink-0" />
                    <span>{formatDate(p.deadline)}</span>
                  </div>

                  {p.budget && (
                    <div className="flex items-center gap-1.5 text-gray-900 font-bold col-span-2 mt-1">
                      <DollarSign size={13} className="text-emerald-500" />
                      <span>Budget: {formatCurrency(p.budget, p.currency_symbol || '$')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to={`/projects/${p.id}`}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  View Details <ChevronRight size={14} />
                </Link>

                <div className="flex items-center gap-1">
                  {can.manageProjects() && (
                    <button
                      onClick={() => openEditModal(p)}
                      className="btn-icon w-7 h-7 text-gray-400 hover:text-indigo-600"
                      title="Edit Project"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                  {can.deleteProjects() && (
                    <button
                      onClick={() => setDeletingId(p.id)}
                      className="btn-icon w-7 h-7 text-gray-400 hover:text-red-600"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Manager</th>
                <th>Progress</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Deadline</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      to={`/projects/${p.id}`}
                      className="font-bold text-gray-900 hover:text-indigo-600 block"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="text-xs font-medium text-gray-700">{p.client_name || '—'}</td>
                  <td className="text-xs text-gray-600">{p.manager_name || '—'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${p.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{p.progress || 0}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`text-xs font-semibold capitalize ${getPriorityColor(p.priority)}`}>
                      {p.priority}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadge(p.status)}>
                      {formatStatus(p.status)}
                    </span>
                  </td>
                  <td className="text-xs text-gray-600">{formatDate(p.deadline)}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/projects/${p.id}`} className="btn-icon" title="View">
                        <ChevronRight size={16} />
                      </Link>
                      {can.manageProjects() && (
                        <button
                          onClick={() => openEditModal(p)}
                          className="btn-icon text-gray-400 hover:text-indigo-600"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {can.deleteProjects() && (
                        <button
                          onClick={() => setDeletingId(p.id)}
                          className="btn-icon text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Brand Redesign & Web App"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Client *</label>
            <select
              required
              value={formData.client}
              onChange={(e) => handleClientChange(e.target.value)}
              className="form-select"
            >
              <option value="">Select a Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.country ? `(${c.country} — ${c.currency || 'USD'} ${c.currency_symbol || '$'})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Project Manager</label>
              <select
                value={formData.project_manager}
                onChange={(e) => setFormData({ ...formData, project_manager: e.target.value })}
                className="form-select"
              >
                <option value="">Select Project Manager</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Budget Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="10000.00"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="form-select"
              >
                {CURRENCIES.map((cur) => (
                  <option key={cur.code} value={cur.code}>
                    {cur.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="form-label">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Description & Scope</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide an overview of project deliverables..."
              className="form-input"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated tasks and milestones will be removed."
        confirmText="Delete Project"
      />
    </div>
  );
}
