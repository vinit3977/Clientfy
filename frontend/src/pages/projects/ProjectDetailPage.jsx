import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectsAPI, tasksAPI, usersAPI } from '../../api/services';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Users,
  CheckSquare,
  FileText,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Clock,
  ChevronRight,
  ShieldAlert,
  FolderKanban
} from 'lucide-react';
import {
  getStatusBadge,
  formatStatus,
  formatCurrency,
  formatDate,
  getPriorityColor
} from '../../utils/helpers';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, can } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');

  // Assign Team modal
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [assigningTeam, setAssigningTeam] = useState(false);

  // Create Task modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    due_date: '',
    estimated_hours: '',
  });
  const [creatingTask, setCreatingTask] = useState(false);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [pRes, tRes, dRes] = await Promise.all([
        projectsAPI.get(id),
        projectsAPI.tasks(id).catch(() => ({ data: [] })),
        projectsAPI.documents(id).catch(() => ({ data: [] })),
      ]);

      setProject(pRes.data);
      setTasks(tRes.data || []);
      setDocuments(dRes.data || []);
      setSelectedUserIds((pRes.data.assigned_team || []).map((u) => (typeof u === 'object' ? u.id : u)));
    } catch {
      toast.error('Project not found or unauthorized');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await usersAPI.list({ page_size: 100 });
      setAllUsers(res.data.results || res.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchProjectData();
    fetchUsers();
  }, [id]);

  const handleUpdateProgress = async () => {
    try {
      const res = await projectsAPI.updateProgress(id);
      setProject((prev) => ({ ...prev, progress: res.data.progress }));
      toast.success('Project progress synced with tasks');
    } catch {
      toast.error('Failed to sync progress');
    }
  };

  const handleSaveTeam = async () => {
    setAssigningTeam(true);
    try {
      await projectsAPI.assignTeam(id, selectedUserIds);
      toast.success('Project team members updated');
      setIsTeamModalOpen(false);
      fetchProjectData();
    } catch {
      toast.error('Failed to update team members');
    } finally {
      setAssigningTeam(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((i) => i !== userId) : [...prev, userId]
    );
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreatingTask(true);
    try {
      const payload = {
        ...taskData,
        project: id,
      };
      if (!payload.assigned_to) delete payload.assigned_to;
      if (!payload.estimated_hours) delete payload.estimated_hours;

      await tasksAPI.create(payload);
      toast.success('Task created successfully');
      setIsTaskModalOpen(false);
      setTaskData({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'medium',
        due_date: '',
        estimated_hours: '',
      });
      fetchProjectData();
    } catch {
      toast.error('Could not create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      toast.success('Task status updated');
      fetchProjectData();
    } catch {
      toast.error('Failed to update task status');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!project) return null;

  return (
    <div className="space-y-6 fade-in">
      {/* Back Link */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back to all projects
      </Link>

      {/* Project Overview Card */}
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className={getStatusBadge(project.status)}>
                {formatStatus(project.status)}
              </span>
              <span className={`text-xs font-bold uppercase tracking-wider ${getPriorityColor(project.priority)}`}>
                {project.priority} priority
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
              {project.name}
            </h1>

            <p className="text-xs text-indigo-600 font-bold mt-1">
              Client: <Link to={`/clients/${project.client}`} className="hover:underline">{project.client_name || 'N/A'}</Link>
            </p>

            <p className="text-sm text-gray-600 mt-3 leading-relaxed max-w-3xl">
              {project.description || 'No project description provided.'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center min-w-[100px]">
              <div className="text-[10px] uppercase font-bold text-gray-400">Total Tasks</div>
              <div className="text-lg font-black text-gray-900">{tasks.length}</div>
            </div>
            {project.budget && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center min-w-[110px]">
                <div className="text-[10px] uppercase font-bold text-emerald-600">Budget ({project.currency || 'USD'})</div>
                <div className="text-lg font-black text-emerald-700">{formatCurrency(project.budget, project.currency_symbol || '$')}</div>
              </div>
            )}
            {can.manageProjects() && (
              <button
                onClick={handleUpdateProgress}
                className="btn-secondary text-xs"
                title="Recalculate progress from task statuses"
              >
                <RefreshCw size={14} /> Sync Progress
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold text-gray-700">Project Execution Progress</span>
            <span className="font-extrabold text-indigo-600 text-sm">{project.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Meta Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <User size={16} className="text-indigo-500 shrink-0" />
            <span>Manager: <strong className="text-gray-900">{project.manager_name || 'Unassigned'}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={16} className="text-indigo-500 shrink-0" />
            <span>Start: <strong className="text-gray-900">{formatDate(project.start_date)}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} className="text-indigo-500 shrink-0" />
            <span>Deadline: <strong className="text-gray-900">{formatDate(project.deadline)}</strong></span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: tasks.length },
          { id: 'team', label: 'Team Members', icon: Users, count: project.team_members?.length || 0 },
          { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Project Deliverables & Tasks</h3>
              {can.manageTasks() && (
                <button onClick={() => setIsTaskModalOpen(true)} className="btn-primary text-xs">
                  <Plus size={14} /> Add Task
                </button>
              )}
            </div>

            {tasks.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="No tasks assigned to this project"
                description="Break this project into manageable tasks and assign them to team members."
                action={
                  can.manageTasks() && (
                    <button onClick={() => setIsTaskModalOpen(true)} className="btn-primary">
                      <Plus size={16} /> Create First Task
                    </button>
                  )
                }
              />
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th>Assignee</th>
                      <th>Priority</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th className="text-right">Quick Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <div className="font-bold text-gray-900">{t.title}</div>
                          {t.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{t.description}</p>
                          )}
                        </td>
                        <td className="text-xs font-medium text-gray-700">
                          {t.assigned_to_name || 'Unassigned'}
                        </td>
                        <td>
                          <span className={`text-xs font-semibold capitalize ${getPriorityColor(t.priority)}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="text-xs text-gray-600">{formatDate(t.due_date)}</td>
                        <td>
                          <span className={getStatusBadge(t.status)}>
                            {formatStatus(t.status)}
                          </span>
                        </td>
                        <td className="text-right">
                          <select
                            value={t.status}
                            onChange={(e) => handleTaskStatusChange(t.id, e.target.value)}
                            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700 font-semibold cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Team Members Tab */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Assigned Team Members</h3>
              {can.manageProjects() && (
                <button
                  onClick={() => setIsTeamModalOpen(true)}
                  className="btn-primary text-xs"
                >
                  <Plus size={14} /> Assign Members
                </button>
              )}
            </div>

            {(!project.team_members || project.team_members.length === 0) ? (
              <EmptyState
                icon={Users}
                title="No team members assigned"
                description="Assign developers, designers, and managers to collaborate on this project."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.team_members.map((m) => (
                  <div key={m.id} className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {m.first_name?.[0] || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-gray-900 truncate">
                        {m.first_name} {m.last_name}
                      </h4>
                      <p className="text-xs text-gray-500 capitalize">{m.role} • {m.department || 'General'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Project Files & Attachments</h3>
              <Link to="/documents" className="btn-primary text-xs">
                <Plus size={14} /> Upload File
              </Link>
            </div>

            {documents.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No documents uploaded"
                description="Files uploaded under this project will appear here."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{doc.name}</h4>
                        <p className="text-xs text-gray-500">{formatDate(doc.created_at)}</p>
                      </div>
                    </div>
                    {doc.file && (
                      <a
                        href={doc.file}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost text-xs text-indigo-600 font-semibold"
                      >
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assign Team Modal */}
      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title="Assign Team Members to Project"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Select team members who are responsible for executing tasks in this project.
          </p>

          <div className="max-h-72 overflow-y-auto space-y-2 border border-gray-100 rounded-xl p-2">
            {allUsers.map((u) => {
              const isSelected = selectedUserIds.includes(u.id);
              return (
                <div
                  key={u.id}
                  onClick={() => toggleUserSelection(u.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50'
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {u.first_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {u.first_name} {u.last_name}
                      </p>
                      <p className="text-[11px] text-gray-500 capitalize">{u.role} • {u.email}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={assigningTeam}
              onClick={handleSaveTeam}
              className="btn-primary"
            >
              {assigningTeam ? 'Saving...' : 'Save Allocation'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Task to Project"
        size="md"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              required
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              placeholder="e.g. Design wireframes & UI kit"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Assignee</label>
            <select
              value={taskData.assigned_to}
              onChange={(e) => setTaskData({ ...taskData, assigned_to: e.target.value })}
              className="form-select"
            >
              <option value="">Unassigned</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.first_name} {u.last_name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Priority</label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="form-label">Due Date</label>
              <input
                type="date"
                value={taskData.due_date}
                onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Estimated Hours</label>
            <input
              type="number"
              step="0.5"
              value={taskData.estimated_hours}
              onChange={(e) => setTaskData({ ...taskData, estimated_hours: e.target.value })}
              placeholder="e.g. 8"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Task Details</label>
            <textarea
              rows={3}
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              placeholder="What needs to be done..."
              className="form-input"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={creatingTask} className="btn-primary">
              {creatingTask ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
