import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clientsAPI, usersAPI } from '../../api/services';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Building,
  Globe,
  Edit2,
  Trash2,
  Archive,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { getStatusBadge, formatStatus, formatDate } from '../../utils/helpers';
import { COUNTRIES, CURRENCIES, getCurrencyForCountry, getSymbolForCurrency } from '../../utils/currencies';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const INDUSTRIES = [
  'technology', 'healthcare', 'finance', 'education', 'retail',
  'manufacturing', 'real_estate', 'media', 'hospitality', 'consulting',
  'legal', 'nonprofit', 'government', 'other'
];

export default function ClientsPage() {
  const { user, can } = useAuth();
  const [clients, setClients] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    alternate_phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    currency: 'USD',
    currency_symbol: '$',
    website: '',
    industry: 'technology',
    status: 'lead',
    assigned_manager: '',
    notes: '',
  });

  const handleCountryChange = (countryName) => {
    const matched = getCurrencyForCountry(countryName);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        country: countryName,
        currency: matched.currency,
        currency_symbol: matched.symbol,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        country: countryName,
      }));
    }
  };

  const handleCurrencyChange = (currencyCode) => {
    const sym = getSymbolForCurrency(currencyCode);
    setFormData((prev) => ({
      ...prev,
      currency: currencyCode,
      currency_symbol: sym,
    }));
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (industryFilter) params.industry = industryFilter;

      const res = await clientsAPI.list(params);
      setClients(res.data.results || res.data || []);
    } catch {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await usersAPI.list({ role: 'manager' });
      setManagers(res.data.results || res.data || []);
    } catch {
      // Ignore if non-admin can't list
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, statusFilter, industryFilter]);

  useEffect(() => {
    fetchManagers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      company_name: '',
      email: '',
      phone: '',
      alternate_phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      currency: 'USD',
      currency_symbol: '$',
      website: '',
      industry: 'technology',
      status: 'lead',
      assigned_manager: '',
      notes: '',
    });
    setEditingClient(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      company_name: client.company_name || '',
      email: client.email || '',
      phone: client.phone || '',
      alternate_phone: client.alternate_phone || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      country: client.country || '',
      currency: client.currency || 'USD',
      currency_symbol: client.currency_symbol || '$',
      website: client.website || '',
      industry: client.industry || 'technology',
      status: client.status || 'lead',
      assigned_manager: client.assigned_manager || '',
      notes: client.notes || '',
    });
    setIsCreateOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.assigned_manager) delete payload.assigned_manager;

      if (editingClient) {
        await clientsAPI.update(editingClient.id, payload);
        toast.success('Client updated successfully');
      } else {
        await clientsAPI.create(payload);
        toast.success('Client created successfully');
      }
      setIsCreateOpen(false);
      resetForm();
      fetchClients();
    } catch (err) {
      const errMsg = err.response?.data
        ? Object.entries(err.response.data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
            .join(' | ')
        : 'Failed to save client';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await clientsAPI.delete(deletingId);
      toast.success('Client deleted successfully');
      setDeletingId(null);
      fetchClients();
    } catch {
      toast.error('Failed to delete client');
    }
  };

  const handleArchive = async (id, e) => {
    e.stopPropagation();
    try {
      await clientsAPI.archive(id);
      toast.success('Client archived');
      fetchClients();
    } catch {
      toast.error('Could not archive client');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Client Management</h1>
          <p className="page-subtitle">
            Manage your customer accounts, contacts, and business profiles
          </p>
        </div>

        {can.manageClients() && (
          <button onClick={openCreateModal} className="btn-primary">
            <Plus size={18} /> Add Client
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by client name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select text-xs w-full md:w-40"
          >
            <option value="">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="form-select text-xs w-full md:w-40"
          >
            <option value="">All Industries</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {formatStatus(ind)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clients Table / List */}
      {loading ? (
        <LoadingSpinner />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients found"
          description="Try modifying your search or add a new client to get started."
          action={
            can.manageClients() && (
              <button onClick={openCreateModal} className="btn-primary">
                <Plus size={16} /> Create First Client
              </button>
            )
          }
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Company</th>
                <th>Country & Currency</th>
                <th>Contact</th>
                <th>Industry</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="cursor-pointer">
                  <td>
                    <Link
                      to={`/clients/${c.id}`}
                      className="font-bold text-gray-900 hover:text-indigo-600 flex items-center gap-2 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-extrabold flex items-center justify-center text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {c.name?.[0] || 'C'}
                      </div>
                      <span>{c.name}</span>
                    </Link>
                  </td>
                  <td>
                    <span className="text-gray-600 font-medium">
                      {c.company_name || '—'}
                    </span>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                        <Globe size={13} className="text-indigo-500 shrink-0" />
                        <span>{c.country || 'Not set'}</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {c.currency || 'USD'} ({c.currency_symbol || '$'})
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Mail size={12} className="text-gray-400" /> {c.email}
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Phone size={12} className="text-gray-400" /> {c.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="capitalize text-gray-600 text-xs">
                      {c.industry ? formatStatus(c.industry) : '—'}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadge(c.status)}>
                      {formatStatus(c.status)}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-gray-500">
                      {formatDate(c.created_at)}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/clients/${c.id}`}
                        className="btn-icon"
                        title="View Client Details"
                      >
                        <ChevronRight size={18} />
                      </Link>

                      {can.manageClients() && (
                        <button
                          onClick={() => openEditModal(c)}
                          className="btn-icon text-gray-500 hover:text-indigo-600"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}

                      {can.manageClients() && c.status !== 'archived' && (
                        <button
                          onClick={(e) => handleArchive(c.id, e)}
                          className="btn-icon text-gray-500 hover:text-amber-600"
                          title="Archive"
                        >
                          <Archive size={16} />
                        </button>
                      )}

                      {can.deleteClients() && (
                        <button
                          onClick={() => setDeletingId(c.id)}
                          className="btn-icon text-gray-500 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingClient ? 'Edit Client Profile' : 'Create New Client'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Client Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Company Name</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="e.g. Acme Corp"
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
                placeholder="john@example.com"
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

          {/* Country & Currency Selector Card */}
          <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <Globe size={14} className="text-indigo-600" /> Country & Currency Selection
              </span>
              <span className="text-[11px] text-indigo-600 font-medium">
                Auto-configures billing currency
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label text-indigo-950 font-bold">Client Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="form-select bg-white"
                >
                  <option value="">Select Country...</option>
                  {COUNTRIES.map((cty) => (
                    <option key={cty.name} value={cty.name}>
                      {cty.name} ({cty.currency} {cty.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label text-indigo-950 font-bold">Billing Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="form-select bg-white"
                >
                  {CURRENCIES.map((cur) => (
                    <option key={cur.code} value={cur.code}>
                      {cur.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select"
              >
                <option value="lead">Lead</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="form-label">Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="form-select"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {formatStatus(ind)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Assigned Manager</label>
              <select
                value={formData.assigned_manager}
                onChange={(e) => setFormData({ ...formData, assigned_manager: e.target.value })}
                className="form-select"
              >
                <option value="">None Assigned</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="New York, Mumbai, London, etc."
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">State / Region</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State / Region / Province"
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Notes & Instructions</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Internal notes about this client..."
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
              {submitting ? 'Saving...' : editingClient ? 'Update Client' : 'Create Client'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Client"
        message="Are you sure you want to permanently delete this client? All linked projects, tasks, and invoices may be affected."
        confirmText="Delete Client"
      />
    </div>
  );
}
