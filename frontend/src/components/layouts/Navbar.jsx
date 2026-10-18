import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../api/services';
import {
  Menu,
  Bell,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  User,
  LogOut,
  Settings
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/helpers';

export default function Navbar({ onOpenSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationsAPI.unreadCount();
      setUnreadCount(res.data.unread_count || 0);
    } catch {
      // Backend may return demo/empty
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      const res = await notificationsAPI.list({ page_size: 5 });
      setNotifications(res.data.results || res.data || []);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  const handleToggleNotif = () => {
    if (!isNotifOpen) {
      fetchRecentNotifications();
    }
    setIsNotifOpen(!isNotifOpen);
    setIsProfileOpen(false);
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-18 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between">
      {/* Left side: Mobile trigger & breadcrumb/greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-sm font-semibold text-gray-900 hidden sm:block">
            Welcome back, <span className="text-indigo-600">{user?.first_name}</span> 👋
          </h2>
          <p className="text-xs text-gray-500 hidden sm:block">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Right side: Notifications & User profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleToggleNotif}
            className="relative p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 fade-in">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="badge-blue text-[10px] px-2 py-0.5">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-xs">
                    No recent notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.link) navigate(item.link);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3.5 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${
                        !item.is_read ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className="text-xs font-semibold text-gray-900">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock size={10} />
                            {formatRelativeTime(item.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {item.message}
                        </p>
                      </div>
                      {!item.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          className="self-center p-1 rounded-lg text-indigo-500 hover:bg-indigo-100 transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-gray-100 text-center bg-gray-50/50">
                <Link
                  to="/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center justify-center gap-1"
                >
                  View all notifications <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 pl-2 sm:pr-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {user?.first_name?.[0] || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-900 leading-none">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] text-gray-400 capitalize mt-0.5">
                {user?.role}
              </p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 fade-in">
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <User size={16} className="text-gray-400" />
                Profile & Account
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
              >
                <LogOut size={16} className="text-red-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
