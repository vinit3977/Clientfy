import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../../api/services';
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  CheckCheck
} from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.list();
      setNotifications(res.data.results || res.data || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      toast.success('Marked as read');
    } catch {
      toast.error('Could not update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Notification Center</h1>
          <p className="page-subtitle">
            System notices, project task updates, and invoicing alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-white shadow-xs text-indigo-600' : 'text-gray-600'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'unread' ? 'bg-white shadow-xs text-indigo-600' : 'text-gray-600'
              }`}
            >
              Unread ({notifications.filter((n) => !n.is_read).length})
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="btn-secondary text-xs"
          >
            <CheckCheck size={16} /> Mark All Read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={filter === 'unread' ? "You're all caught up! No unread notices." : "No notifications on record."}
        />
      ) : (
        <div className="card divide-y divide-gray-100 overflow-hidden">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.is_read) handleMarkAsRead(item.id);
                if (item.link) navigate(item.link);
              }}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                !item.is_read ? 'bg-indigo-50/30 hover:bg-indigo-50/50' : 'hover:bg-gray-50/50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  !item.is_read
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Bell size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                  <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                    <Clock size={12} />
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.message}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-gray-400">
                    {formatDateTime(item.created_at)}
                  </span>

                  <div className="flex items-center gap-2">
                    {item.link && (
                      <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                        Go to item <ExternalLink size={12} />
                      </span>
                    )}

                    {!item.is_read && (
                      <button
                        onClick={(e) => handleMarkAsRead(item.id, e)}
                        className="text-xs font-semibold text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <CheckCircle2 size={13} /> Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
