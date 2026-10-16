import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { activitiesAPI } from '../../api/services';
import {
  Activity,
  Search,
  Filter,
  Clock,
  User,
  ShieldCheck,
  Calendar,
  Layers,
  Globe
} from 'lucide-react';
import { formatDateTime, formatRelativeTime, formatStatus } from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity_type = entityFilter;

      const res = await activitiesAPI.list(params);
      setActivities(res.data.results || res.data || []);
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [search, actionFilter, entityFilter]);

  const getActionBadge = (action) => {
    switch (action) {
      case 'created':
        return 'badge-green';
      case 'updated':
        return 'badge-blue';
      case 'deleted':
        return 'badge-red';
      case 'status_changed':
        return 'badge-purple';
      case 'assigned':
        return 'badge-indigo';
      default:
        return 'badge-gray';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">System Activity Logs</h1>
          <p className="page-subtitle">
            Immutable audit trail of security, CRUD actions, and user events across the organization
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities by description or entity name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="form-select text-xs w-full sm:w-36"
          >
            <option value="">All Actions</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
            <option value="status_changed">Status Changed</option>
            <option value="assigned">Assigned</option>
            <option value="uploaded">Uploaded</option>
            <option value="logged_in">Logged In</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="form-select text-xs w-full sm:w-36"
          >
            <option value="">All Entities</option>
            <option value="client">Client</option>
            <option value="project">Project</option>
            <option value="task">Task</option>
            <option value="invoice">Invoice</option>
            <option value="payment">Payment</option>
            <option value="document">Document</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Activities Timeline Feed */}
      {loading ? (
        <LoadingSpinner />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity events found"
          description="System actions will be automatically recorded here."
        />
      ) : (
        <div className="card divide-y divide-gray-100">
          {activities.map((act) => (
            <div key={act.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold flex items-center justify-center shrink-0 text-sm shadow-xs">
                {act.user_name?.[0] || 'S'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {act.user_name || 'System Auto'}
                    </span>
                    <span className={getActionBadge(act.action)}>
                      {formatStatus(act.action)}
                    </span>
                    {act.entity_type && (
                      <span className="badge-gray uppercase text-[10px] tracking-wider">
                        {act.entity_type}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} />
                    {formatRelativeTime(act.created_at)}
                  </span>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">
                  {act.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-gray-400 mt-2">
                  <span>Timestamp: {formatDateTime(act.created_at)}</span>
                  {act.ip_address && (
                    <span className="flex items-center gap-1">
                      <Globe size={11} /> IP: {act.ip_address}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
