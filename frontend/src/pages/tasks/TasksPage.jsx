import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tasksAPI, projectsAPI, usersAPI } from '../../api/services';
import {
  CheckSquare,
  Plus,
  Search,
  Kanban,
  List,
  Calendar,
  User,
  Clock,
  MessageSquare,
  Trash2,
  Edit2,
  ChevronRight,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import {
  getStatusBadge,
  formatStatus,
  formatDate,
  getPriorityColor,
  formatRelativeTime
} from '../../utils/helpers';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const STATUS_COLUMNS = [
  { id: 'pending', label: 'Pending / To-Do', color: 'border-amber-400 bg-amber-50/20' },
  { id: 'in_progress', label: 'In Progress', color: 'border-blue-400 bg-blue-50/20' },
  { id: 'review', label: 'In Review', color: 'border-purple-400 bg-purple-50/20' },
  { id: 'completed', label: 'Completed', color: 'border-emerald-400 bg-emerald-50/20' },
];

export default function TasksPage() {
  const { user, can } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTaskDetail, setActiveTaskDetail] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assigned_to: '',
    priority: 'medium',
    status: 'pending',
    start_date: '',
    due_date: '',
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (projectFilter) params.project = projectFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const res = await tasksAPI.list(params);
      setTasks(res.data.results || res.data || []);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [pRes, uRes] = await Promise.all([
        projectsAPI.list({ page_size: 100 }),
        usersAPI.list({ page_size: 100 }),
      ]);
      setProjects(pRes.data.results || pRes.data || []);
      setUsers(uRes.data.results || uRes.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchTasks();
  }, [search, projectFilter, priorityFilter]);

  useEffect(() => {
    fetchMeta();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      toast.success(`Task moved to ${formatStatus(newStatus)}`);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      if (activeTaskDetail?.id === taskId) {
        setActiveTaskDetail((prev) => ({ ...prev, status: newStatus }));
      }
    } catch {
      toast.error('Could not update status');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.assigned_to) delete payload.assigned_to;
      if (!payload.start_date) delete payload.start_date;
      if (!payload.due_date) delete payload.due_date;

      await tasksAPI.create(payload);
      toast.success('Task created successfully');
      setIsCreateOpen(false);
      setFormData({
        title: '',
        description: '',
        project: '',
        assigned_to: '',
        priority: 'medium',
        status: 'pending',
        start_date: '',
        due_date: '',
      });
      fetchTasks();
    } catch {
      toast.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const openTaskDetail = async (task) => {
    try {
      const res = await tasksAPI.get(task.id);
      setActiveTaskDetail(res.data);
    } catch {
      setActiveTaskDetail(task);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activeTaskDetail) return;
    setSubmittingComment(true);
    try {
      const res = await tasksAPI.addComment(activeTaskDetail.id, newComment);
      const added = res.data;
      setActiveTaskDetail((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), added],
      }));
      setNewComment('');
      toast.success('Comment posted');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingId) return;
    try {
      await tasksAPI.delete(deletingId);
      toast.success('Task deleted');
      setDeletingId(null);
      if (activeTaskDetail?.id === deletingId) setActiveTaskDetail(null);
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Task Management</h1>
          <p className="page-subtitle">
            Organize team workload, sprint progress, and task deliverables
          </p>
        </div>

        {can.manageTasks() && (
          <button onClick={() => setIsCreateOpen(true)} className="btn-primary">
            <Plus size={18} /> Add Task
          </button>
        )}
      </div>

      {/* Filter and View Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="form-select text-xs w-full sm:w-44"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
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

          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Kanban Board"
            >
              <Kanban size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Task Views */}
      {loading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="Create a new task to allocate work or adjust your filters."
          action={
            can.manageTasks() && (
              <button onClick={() => setIsCreateOpen(true)} className="btn-primary">
                <Plus size={16} /> Create Task
              </button>
            )
          }
        />
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {STATUS_COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-gray-100/70 rounded-2xl p-3.5 flex flex-col min-h-[500px] border border-gray-200/60"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 px-1 border-b border-gray-200/60 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs uppercase tracking-wider text-gray-700">
                      {col.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-gray-700 shadow-xs">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => openTaskDetail(t)}
                      className="card p-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group bg-white"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${getPriorityColor(t.priority)}`}>
                          {t.priority}
                        </span>
                        <select
                          value={t.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(t.id, e.target.value)}
                          className="text-[10px] bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 font-semibold text-gray-600 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug">
                        {t.title}
                      </h4>

                      {t.project_title && (
                        <p className="text-[11px] text-indigo-600 font-semibold mt-1 truncate">
                          {t.project_title}
                        </p>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1.5 truncate">
                          <User size={12} className="text-gray-400 shrink-0" />
                          <span className="truncate text-[11px]">
                            {t.assigned_to_name || 'Unassigned'}
                          </span>
                        </div>

                        {t.due_date && (
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 shrink-0">
                            <Clock size={11} className="text-gray-400" />
                            <span>{formatDate(t.due_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="py-12 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                      No tasks in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} onClick={() => openTaskDetail(t)} className="cursor-pointer">
                  <td className="font-bold text-gray-900 hover:text-indigo-600">{t.title}</td>
                  <td className="text-xs font-semibold text-indigo-600">{t.project_title || '—'}</td>
                  <td className="text-xs text-gray-700">{t.assigned_to_name || 'Unassigned'}</td>
                  <td>
                    <span className={`text-xs font-semibold capitalize ${getPriorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadge(t.status)}>
                      {formatStatus(t.status)}
                    </span>
                  </td>
                  <td className="text-xs text-gray-600">{formatDate(t.due_date)}</td>
                  <td className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700 font-semibold cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                      {can.deleteTasks() && (
                        <button
                          onClick={() => setDeletingId(t.id)}
                          className="btn-icon text-gray-400 hover:text-red-600"
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

      {/* Task Detail & Comments Modal */}
      <Modal
        isOpen={Boolean(activeTaskDetail)}
        onClose={() => setActiveTaskDetail(null)}
        title={activeTaskDetail?.title || 'Task Details'}
        size="lg"
      >
        {activeTaskDetail && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className={getStatusBadge(activeTaskDetail.status)}>
                  {formatStatus(activeTaskDetail.status)}
                </span>
                <span className={`text-xs font-bold uppercase tracking-wider ${getPriorityColor(activeTaskDetail.priority)}`}>
                  {activeTaskDetail.priority}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Change Status:</span>
                <select
                  value={activeTaskDetail.status}
                  onChange={(e) => handleStatusChange(activeTaskDetail.id, e.target.value)}
                  className="text-xs font-semibold bg-white border border-gray-200 rounded-lg px-2 py-1"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Description
              </h4>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {activeTaskDetail.description || 'No detailed instructions provided.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs border-y border-gray-100 py-4">
              <div>
                <span className="text-gray-400 block mb-0.5">Project</span>
                <span className="font-bold text-gray-900">{activeTaskDetail.project_title || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Assignee</span>
                <span className="font-bold text-gray-900">{activeTaskDetail.assigned_to_name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Due Date</span>
                <span className="font-bold text-gray-900">{formatDate(activeTaskDetail.due_date)}</span>
              </div>
            </div>

            {/* Comments Thread */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare size={16} /> Comments & Updates
              </h4>

              <div className="space-y-3 max-h-56 overflow-y-auto">
                {(!activeTaskDetail.comments || activeTaskDetail.comments.length === 0) ? (
                  <p className="text-xs text-gray-400 py-3 text-center">No comments yet</p>
                ) : (
                  activeTaskDetail.comments.map((c) => (
                    <div key={c.id} className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-gray-900">
                        <span>{c.user_name || 'Team Member'}</span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          {formatRelativeTime(c.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700">{c.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Post an update or comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="form-input text-xs"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="btn-primary text-xs shrink-0"
                >
                  {submittingComment ? 'Posting...' : 'Comment'}
                </button>
              </form>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Task"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Conduct usability testing"
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Project *</label>
              <select
                required
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="form-select"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Assignee</label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="form-select"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name} {u.last_name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <label className="form-label">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Description & Instructions</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed acceptance criteria..."
              className="form-input"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task?"
        confirmText="Delete Task"
      />
    </div>
  );
}
