import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  UserCheck,
  Receipt,
  CreditCard,
  FileText,
  BarChart3,
  Activity,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'employee', 'accountant'],
    },
    {
      label: 'Clients',
      to: '/clients',
      icon: Users,
      roles: ['admin', 'manager', 'accountant'],
    },
    {
      label: 'Projects',
      to: '/projects',
      icon: FolderKanban,
      roles: ['admin', 'manager', 'employee', 'accountant'],
    },
    {
      label: 'Tasks',
      to: '/tasks',
      icon: CheckSquare,
      roles: ['admin', 'manager', 'employee'],
    },
    {
      label: 'Team Members',
      to: '/team',
      icon: UserCheck,
      roles: ['admin', 'manager'],
    },
    {
      label: 'Invoices',
      to: '/invoices',
      icon: Receipt,
      roles: ['admin', 'manager', 'accountant'],
    },
    {
      label: 'Payments',
      to: '/payments',
      icon: CreditCard,
      roles: ['admin', 'manager', 'accountant'],
    },
    {
      label: 'Documents',
      to: '/documents',
      icon: FileText,
      roles: ['admin', 'manager', 'employee', 'accountant'],
    },
    {
      label: 'Reports & Analytics',
      to: '/reports',
      icon: BarChart3,
      roles: ['admin', 'manager', 'accountant'],
    },
    {
      label: 'Activity Logs',
      to: '/activities',
      icon: Activity,
      roles: ['admin'],
    },
  ];

  const filteredNav = navItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'accountant':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-100 text-white font-extrabold text-xl tracking-wider">
              C
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-gray-900 leading-none">
                Client<span className="text-indigo-600">ify</span>
              </div>
              <div className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wider">
                Enterprise Suite
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 rounded-2xl border border-indigo-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {user?.first_name?.[0] || 'U'}
              {user?.last_name?.[0] || ''}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${getRoleBadgeColor(
                    user?.role
                  )}`}
                >
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Main Menu
          </div>
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={isActive ? 'text-white' : 'text-gray-400'}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-indigo-200" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <NavLink
            to="/profile"
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <User size={18} className="text-gray-400" />
            <span>My Profile & Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut size={18} className="text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
