import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../api/services';
import {
  Users,
  Plus,
  Search,
  ShieldCheck,
  Mail,
  Phone,
  Building,
  Edit2,
  Trash2,
  UserCheck,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { getStatusBadge, formatStatus, formatDate } from '../../utils/helpers';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function TeamPage() {
  const { user, can } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'employee',
    department: '',
    status: 'active',
    password: '',
    bio: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await usersAPI.list(params);
      setUsers(res.data.results || res.data || []);
    } catch {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'employee',
      department: '',
      status: 'active',
      password: '',
      bio: '',
    });
    setEditingUser(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'employee',
      department: u.department || '',
      status: u.status || 'active',
      password: '',
      bio: u.bio || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await usersAPI.update(editingUser.id, payload);
        toast.success('Team member profile updated');
      } else {
        await usersAPI.create(formData);
        toast.success('New team member invited and account created');
      }
      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data
        ? Object.entries(err.response.data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
            .join(' | ')
        : 'Failed to save team member';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await usersAPI.delete(deletingId);
      toast.success('Team member removed');
      setDeletingId(null);
      fetchUsers();
    } catch {
      toast.error('Failed to remove team member');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'badge-purple';
      case 'manager':
        return 'badge-blue';
      case 'accountant':
        return 'badge-green';
      default:
        return 'badge-gray';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">
            Admin-controlled employee provisioning, permissions, and departmental assignments
          </p>
        </div>

        {can.createUsers() && (
          <button onClick={openCreateModal} className="btn-primary">
            <Plus size={18} /> Provision Team Member
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-select text-xs w-full sm:w-36"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="accountant">Accountant</option>
            <option value="employee">Employee</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select text-xs w-full sm:w-36"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Display */}
      {loading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members found"
          description="Provision internal staff or modify filter search terms."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((u) => (
            <div key={u.id} className="card-hover p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                      {u.first_name?.[0] || 'U'}
                      {u.last_name?.[0] || ''}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-base leading-tight">
                        {u.first_name} {u.last_name}
                      </h4>
                      <span className="text-xs text-gray-500 font-medium mt-0.5 block">
                        {u.department || 'General Operations'}
                      </span>
                    </div>
                  </div>

                  <span className={getRoleBadge(u.role)}>
                    {u.role}
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400 shrink-0" />
                      <span>{u.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Action bar */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    u.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : u.status === 'suspended'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {u.status}
                </span>

                {can.manageUsers() && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(u)}
                      className="btn-icon w-8 h-8 text-gray-400 hover:text-indigo-600"
                      title="Edit Permissions & Details"
                    >
                      <Edit2 size={15} />
                    </button>
                    {u.id !== user?.id && (
                      <button
                        onClick={() => setDeletingId(u.id)}
                        className="btn-icon w-8 h-8 text-gray-400 hover:text-red-600"
                        title="Delete User"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Provision / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Update Team Member' : 'Provision Team Member'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Jane"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Doe"
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane.doe@company.com"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">System Role *</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="form-select font-semibold"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="accountant">Accountant</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="form-label">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Engineering, Design..."
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">
              {editingUser ? 'Reset Password (leave empty to keep current)' : 'Initial Password *'}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••••••"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Bio & Responsibilities</label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Primary areas of focus..."
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
              {submitting ? 'Saving...' : editingUser ? 'Update Member' : 'Provision Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Remove Team Member"
        message="Are you sure you want to remove this user? Their account and access permissions will be immediately revoked."
        confirmText="Remove User"
      />
    </div>
  );
}
