import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reportsAPI } from '../../api/services';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatCurrency, formatStatus } from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ReportsPage() {
  const { user } = useAuth();
  const [financial, setFinancial] = useState(null);
  const [clients, setClients] = useState(null);
  const [projects, setProjects] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [fRes, cRes, pRes, tRes] = await Promise.all([
        reportsAPI.financial().catch(() => ({ data: null })),
        reportsAPI.clients().catch(() => ({ data: null })),
        reportsAPI.projects().catch(() => ({ data: null })),
        reportsAPI.team().catch(() => ({ data: null })),
      ]);

      setFinancial(fRes.data);
      setClients(cRes.data);
      setProjects(pRes.data);
      setTeam(tRes.data);
    } catch {
      toast.error('Failed to load operational analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  // Industry breakdown data for chart
  const industryData = clients?.by_industry
    ? clients.by_industry.map((item) => ({
        name: formatStatus(item.industry || 'Other'),
        count: item.count,
      }))
    : [];

  // Project status breakdown data for chart
  const projectData = projects
    ? [
        { name: 'Planning', count: projects.planning || 0 },
        { name: 'In Progress', count: projects.in_progress || 0 },
        { name: 'Completed', count: projects.completed || 0 },
        { name: 'On Hold', count: projects.on_hold || 0 },
        { name: 'Cancelled', count: projects.cancelled || 0 },
      ]
    : [];

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Reports & Analytics</h1>
          <p className="page-subtitle">
            Enterprise overview of cashflow collection, pipeline velocity, and team throughput
          </p>
        </div>
      </div>

      {/* Financial Health Row */}
      {financial && (
        <div className="card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-gray-900">Financial Performance & Health</h3>
              <p className="text-xs text-gray-500">Summary of total billing and accounts receivable</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Collection Rate:</span>
              <span className="badge-green text-xs font-black">
                {financial.collection_rate || 0}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Billed</p>
              <h4 className="text-2xl font-black text-gray-900 mt-1">
                {formatCurrency(financial.total_invoiced)}
              </h4>
              <p className="text-[11px] text-gray-400 mt-1">Invoiced across accounts</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Collected Revenue</p>
              <h4 className="text-2xl font-black text-emerald-800 mt-1">
                {formatCurrency(financial.total_paid)}
              </h4>
              <p className="text-[11px] text-emerald-600 mt-1">Realized into accounts</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Receivables</p>
              <h4 className="text-2xl font-black text-amber-800 mt-1">
                {formatCurrency(financial.total_pending)}
              </h4>
              <p className="text-[11px] text-amber-600 mt-1">Sent & active invoices</p>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-100">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">Overdue Balance</p>
              <h4 className="text-2xl font-black text-red-800 mt-1">
                {formatCurrency(financial.total_overdue)}
              </h4>
              <p className="text-[11px] text-red-600 mt-1">Requires accounts follow-up</p>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Pipeline */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Project Delivery Velocity</h3>
            <FolderKanban size={18} className="text-indigo-600" />
          </div>
          <p className="text-xs text-gray-500 mb-6">Distribution across workflow lifecycle</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1b4b',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client Industry Distribution */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Client Demographics</h3>
            <Users size={18} className="text-indigo-600" />
          </div>
          <p className="text-xs text-gray-500 mb-6">Account portfolio by business sector</p>

          {industryData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={industryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    dataKey="count"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {industryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-gray-400">
              No client demographic data
            </div>
          )}
        </div>
      </div>

      {/* Team Productivity Table (Admin only) */}
      {team && (
        <div className="card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Award className="text-amber-500" size={20} /> Team Productivity & Workload
              </h3>
              <p className="text-xs text-gray-500">Individual member delivery throughput metrics</p>
            </div>
            <span className="badge-purple text-xs font-bold">
              {team.total_team || team.team?.length || 0} Members
            </span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Role</th>
                  <th>Active Projects</th>
                  <th>Tasks Completed</th>
                  <th>In-Progress Tasks</th>
                  <th>Pending Queue</th>
                </tr>
              </thead>
              <tbody>
                {(team.team || []).map((m) => (
                  <tr key={m.id}>
                    <td>
                      <span className="font-bold text-gray-900">{m.name}</span>
                    </td>
                    <td>
                      <span className="badge-gray capitalize text-xs">{m.role}</span>
                    </td>
                    <td className="font-semibold text-gray-700 text-xs">
                      {m.projects_assigned} projects
                    </td>
                    <td>
                      <span className="font-extrabold text-emerald-600 text-xs">
                        {m.tasks_completed} done
                      </span>
                    </td>
                    <td className="font-semibold text-blue-600 text-xs">
                      {m.tasks_in_progress} in progress
                    </td>
                    <td className="text-xs text-amber-600 font-semibold">
                      {m.tasks_pending} queued
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
