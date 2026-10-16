import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reportsAPI, tasksAPI } from '../../api/services';
import {
  Users,
  FolderKanban,
  CheckSquare,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  Clock,
  ArrowUpRight,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatCurrency, formatDate, getStatusBadge, formatStatus, formatRelativeTime } from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await reportsAPI.dashboard();
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      toast.success('Task status updated');
      fetchDashboard();
    } catch {
      toast.error('Could not update task status');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const role = data?.role || user?.role;
  const stats = data?.stats || {};

  // Format project distribution for chart
  const projectChartData = data?.project_status_chart
    ? Object.entries(data.project_status_chart)
        .filter(([_, val]) => val > 0)
        .map(([key, val]) => ({
          name: formatStatus(key),
          value: val,
        }))
    : [];

  return (
    <div className="space-y-8 fade-in">
      {/* Top Banner / Hero Greeting */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl shadow-indigo-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-indigo-200 mb-3 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Workspace Active • {role.toUpperCase()} MODE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-indigo-200 text-sm mt-1 max-w-xl">
            {role === 'admin' && 'Here is your company overview, revenue streams, and team activities.'}
            {role === 'manager' && 'Here is an overview of your managed clients, team tasks, and delivery milestones.'}
            {role === 'accountant' && 'Here is your financial overview, collections, and pending accounts receivable.'}
            {role === 'employee' && 'Here are your pending tasks, upcoming deadlines, and assigned projects.'}
          </p>
        </div>

        {/* Quick action buttons for admins/managers */}
        {['admin', 'manager'].includes(role) && (
          <div className="relative z-10 flex flex-wrap items-center gap-2.5">
            <Link
              to="/clients"
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={16} /> Add Client
            </Link>
            <Link
              to="/projects"
              className="px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 border border-white/20"
            >
              <FolderKanban size={16} /> New Project
            </Link>
            <Link
              to="/tasks"
              className="px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 border border-white/20"
            >
              <CheckSquare size={16} /> Create Task
            </Link>
          </div>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1 */}
        {['admin', 'accountant'].includes(role) ? (
          <div className="stat-card">
            <div className="stat-icon bg-emerald-50 text-emerald-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Revenue
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {formatCurrency(stats.total_revenue || 0)}
              </h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> Realized collections
              </p>
            </div>
          </div>
        ) : (
          <div className="stat-card">
            <div className="stat-icon bg-indigo-50 text-indigo-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {role === 'manager' ? 'Assigned Clients' : 'Assigned Projects'}
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {stats.assigned_clients ?? stats.my_projects ?? 0}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Active client accounts</p>
            </div>
          </div>
        )}

        {/* Card 2 */}
        {['admin', 'manager'].includes(role) ? (
          <div className="stat-card">
            <div className="stat-icon bg-indigo-50 text-indigo-600">
              <FolderKanban size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Active Projects
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {stats.active_projects || 0}
              </h3>
              <p className="text-xs text-indigo-600 font-semibold mt-1">
                {stats.total_projects || 0} Total across pipeline
              </p>
            </div>
          </div>
        ) : role === 'accountant' ? (
          <div className="stat-card">
            <div className="stat-icon bg-amber-50 text-amber-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Pending Receivables
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {formatCurrency(stats.pending_payments || 0)}
              </h3>
              <p className="text-xs text-amber-600 font-medium mt-1">Unpaid sent invoices</p>
            </div>
          </div>
        ) : (
          <div className="stat-card">
            <div className="stat-icon bg-blue-50 text-blue-600">
              <CheckSquare size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                In-Progress Tasks
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {stats.in_progress_tasks || 0}
              </h3>
              <p className="text-xs text-blue-600 font-medium mt-1">Tasks being executed</p>
            </div>
          </div>
        )}

        {/* Card 3 */}
        {['admin', 'manager', 'employee'].includes(role) ? (
          <div className="stat-card">
            <div className="stat-icon bg-amber-50 text-amber-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Pending Tasks
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {stats.pending_tasks || 0}
              </h3>
              <p className="text-xs text-amber-600 font-semibold mt-1">
                {stats.completed_tasks || 0} Already completed
              </p>
            </div>
          </div>
        ) : (
          <div className="stat-card">
            <div className="stat-icon bg-red-50 text-red-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Overdue Payments
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {formatCurrency(stats.overdue_payments || 0)}
              </h3>
              <p className="text-xs text-red-600 font-medium mt-1">Requires follow-up</p>
            </div>
          </div>
        )}

        {/* Card 4 */}
        {role === 'admin' ? (
          <div className="stat-card">
            <div className="stat-icon bg-purple-50 text-purple-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Active Team
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {stats.total_team || 0}
              </h3>
              <p className="text-xs text-purple-600 font-semibold mt-1">
                {stats.total_clients || 0} Total clients
              </p>
            </div>
          </div>
        ) : (
          <div className="stat-card">
            <div className="stat-icon bg-red-50 text-red-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Overdue Tasks
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {stats.overdue_tasks || 0}
              </h3>
              <p className="text-xs text-red-500 font-medium mt-1">Past due date</p>
            </div>
          </div>
        )}
      </div>

      {/* Visual Analytics Section (Admin & Accountant) */}
      {['admin', 'accountant'].includes(role) && data?.monthly_revenue?.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Revenue Stream</h3>
                <p className="text-xs text-gray-500">Monthly payment collection history</p>
              </div>
              <span className="badge-green text-xs">Verified Inflow</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthly_revenue}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val) => [`${formatCurrency(val)}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#1e1b4b',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Project Distribution Chart */}
          <div className="card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Project Status</h3>
                <Layers size={18} className="text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mb-4">Pipeline distribution</p>

              {projectChartData.length > 0 ? (
                <div className="h-52 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {projectChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-52 flex items-center justify-center text-xs text-gray-400">
                  No project data available
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              {projectChartData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-gray-600 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Employee / Team View: My Assigned Tasks */}
      {role === 'employee' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">My Assigned Tasks</h3>
              <p className="text-xs text-gray-500">Tasks allocated to you for delivery</p>
            </div>
            <Link to="/tasks" className="text-xs text-indigo-600 font-semibold hover:underline">
              View all tasks &rarr;
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {(!data?.my_tasks || data.my_tasks.length === 0) ? (
              <p className="text-xs text-gray-400 py-6 text-center">No tasks assigned yet</p>
            ) : (
              data.my_tasks.map((task) => (
                <div key={task.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Project: <span className="font-medium text-gray-700">{task.project_title || 'N/A'}</span> • Due: {formatDate(task.due_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={getStatusBadge(task.status)}>
                      {formatStatus(task.status)}
                    </span>
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                      className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700 font-medium cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Admin & Manager: Recent Activities & Recent Projects */}
      {['admin', 'manager'].includes(role) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Projects</h3>
              <Link to="/projects" className="text-xs text-indigo-600 font-semibold hover:underline">
                View all &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {(data?.recent_projects || data?.my_projects || []).slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="p-3.5 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all flex items-center justify-between group block"
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600">
                      {p.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Client: {p.client_name || 'N/A'} • {p.progress || 0}% completed
                    </p>
                  </div>
                  <span className={getStatusBadge(p.status)}>
                    {formatStatus(p.status)}
                  </span>
                </Link>
              ))}
              {(!data?.recent_projects && !data?.my_projects) && (
                <p className="text-xs text-gray-400 py-6 text-center">No projects to display</p>
              )}
            </div>
          </div>

          {/* Activity Log Feed */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity Feed</h3>
              {role === 'admin' && (
                <Link to="/activities" className="text-xs text-indigo-600 font-semibold hover:underline">
                  Audit trail &rarr;
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {(!data?.recent_activities || data.recent_activities.length === 0) ? (
                <p className="text-xs text-gray-400 py-6 text-center">No activity recorded yet</p>
              ) : (
                data.recent_activities.slice(0, 6).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 text-xs">
                      {act.user_name?.[0] || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium">
                        <span className="font-bold text-gray-900">{act.user_name || 'System'}</span>{' '}
                        {act.description}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">
                        {formatRelativeTime(act.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
