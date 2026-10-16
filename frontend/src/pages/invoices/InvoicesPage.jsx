import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { invoicesAPI, clientsAPI, projectsAPI } from '../../api/services';
import {
  Receipt,
  Plus,
  Search,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Send,
  Trash2,
  ChevronRight,
  Printer,
  X
} from 'lucide-react';
import {
  getStatusBadge,
  formatStatus,
  formatCurrency,
  formatDate
} from '../../utils/helpers';
import { CURRENCIES, getSymbolForCurrency } from '../../utils/currencies';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function InvoicesPage() {
  const { user, can } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Invoice Form State
  const [formData, setFormData] = useState({
    client: '',
    project: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    currency: 'USD',
    currency_symbol: '$',
    items: [
      { name: 'Consulting & Design Services', description: 'Sprint 1 delivery', quantity: 1, unit_price: 1500, amount: 1500 }
    ],
    tax_percent: 0,
    discount_percent: 0,
    notes: 'Thank you for your business. Payment is due within 14 days.',
    terms: 'Wire transfer details: Acme Bank, Account #987654321',
  });

  const handleClientChange = (clientId) => {
    const selected = clients.find((c) => String(c.id) === String(clientId));
    setFormData((prev) => ({
      ...prev,
      client: clientId,
      currency: selected?.currency || prev.currency || 'USD',
      currency_symbol: selected?.currency_symbol || prev.currency_symbol || '$',
    }));
  };

  const handleCurrencyChange = (currencyCode) => {
    const sym = getSymbolForCurrency(currencyCode);
    setFormData((prev) => ({
      ...prev,
      currency: currencyCode,
      currency_symbol: sym,
    }));
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (clientFilter) params.client = clientFilter;

      const res = await invoicesAPI.list(params);
      setInvoices(res.data.results || res.data || []);
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        clientsAPI.list({ page_size: 100 }),
        projectsAPI.list({ page_size: 100 }),
      ]);
      setClients(cRes.data.results || cRes.data || []);
      setProjects(pRes.data.results || pRes.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter, clientFilter]);

  useEffect(() => {
    fetchMeta();
  }, []);

  // Line Items calculations
  const calculateTotals = (items, taxPct, discPct) => {
    const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
    const discount = (subtotal * (parseFloat(discPct) || 0)) / 100;
    const taxable = Math.max(0, subtotal - discount);
    const tax = (taxable * (parseFloat(taxPct) || 0)) / 100;
    const total = taxable + tax;
    return { subtotal, discount, tax, total };
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'unit_price') {
      const q = parseFloat(newItems[index].quantity) || 0;
      const p = parseFloat(newItems[index].unit_price) || 0;
      newItems[index].amount = Math.round(q * p * 100) / 100;
    }
    setFormData({ ...formData, items: newItems });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { name: '', description: '', quantity: 1, unit_price: 0, amount: 0 }
      ]
    });
  };

  const removeItemRow = (index) => {
    if (formData.items.length === 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { subtotal, discount, tax, total } = calculateTotals(
        formData.items,
        formData.tax_percent,
        formData.discount_percent
      );

      const payload = {
        ...formData,
        subtotal,
        discount,
        tax,
        total,
      };
      if (!payload.project) delete payload.project;

      await invoicesAPI.create(payload);
      toast.success('Invoice created successfully');
      setIsCreateOpen(false);
      fetchInvoices();
    } catch (err) {
      toast.error('Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkSent = async (id, e) => {
    e.stopPropagation();
    try {
      await invoicesAPI.markSent(id);
      toast.success('Invoice marked as Sent');
      fetchInvoices();
    } catch {
      toast.error('Could not mark as sent');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await invoicesAPI.delete(deletingId);
      toast.success('Invoice deleted');
      setDeletingId(null);
      fetchInvoices();
    } catch {
      toast.error('Failed to delete invoice');
    }
  };

  // Aggregated metrics
  const totalBilled = invoices.reduce((acc, i) => acc + parseFloat(i.total || 0), 0);
  const totalPaid = invoices.reduce((acc, i) => acc + parseFloat(i.paid_amount || 0), 0);
  const totalPending = invoices
    .filter((i) => ['sent', 'partially_paid', 'draft'].includes(i.status))
    .reduce((acc, i) => acc + parseFloat(i.pending_amount || (i.total - i.paid_amount) || 0), 0);
  const totalOverdue = invoices
    .filter((i) => i.status === 'overdue')
    .reduce((acc, i) => acc + parseFloat(i.pending_amount || (i.total - i.paid_amount) || 0), 0);

  const { subtotal: curSubtotal, discount: curDiscount, tax: curTax, total: curTotal } = calculateTotals(
    formData.items,
    formData.tax_percent,
    formData.discount_percent
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoice Management</h1>
          <p className="page-subtitle">
            Create professional invoices, monitor payment statuses, and maintain revenue pipelines
          </p>
        </div>

        {can.manageInvoices() && (
          <button onClick={() => setIsCreateOpen(true)} className="btn-primary">
            <Plus size={18} /> Create Invoice
          </button>
        )}
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-indigo-50 text-indigo-600">
            <Receipt size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Billed</p>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">{formatCurrency(totalBilled)}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Collected</p>
            <h3 className="text-xl font-black text-emerald-700 mt-0.5">{formatCurrency(totalPaid)}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-amber-50 text-amber-600">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</p>
            <h3 className="text-xl font-black text-amber-600 mt-0.5">{formatCurrency(totalPending)}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-red-50 text-red-600">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overdue</p>
            <h3 className="text-xl font-black text-red-600 mt-0.5">{formatCurrency(totalOverdue)}</h3>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoice number or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select text-xs w-full sm:w-40"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="form-select text-xs w-full sm:w-44"
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoices List */}
      {loading ? (
        <LoadingSpinner />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices found"
          description="Create your first invoice or adjust your filter query."
          action={
            can.manageInvoices() && (
              <button onClick={() => setIsCreateOpen(true)} className="btn-primary">
                <Plus size={16} /> Create First Invoice
              </button>
            )
          }
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Project</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <Link
                      to={`/invoices/${inv.id}`}
                      className="font-black text-gray-900 hover:text-indigo-600 block"
                    >
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td>
                    <span className="font-semibold text-gray-800 text-xs">
                      {inv.client_name || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="text-gray-500 text-xs">
                      {inv.project_name || 'General Billing'}
                    </span>
                  </td>
                  <td className="text-xs text-gray-600">{formatDate(inv.invoice_date)}</td>
                  <td className="text-xs text-gray-600">{formatDate(inv.due_date)}</td>
                  <td className="font-black text-gray-900">
                    {formatCurrency(inv.total, inv.currency_symbol || '$')}
                  </td>
                  <td className="font-bold text-emerald-600 text-xs">
                    {formatCurrency(inv.paid_amount || 0, inv.currency_symbol || '$')}
                  </td>
                  <td>
                    <span className={getStatusBadge(inv.status)}>
                      {formatStatus(inv.status)}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {inv.status === 'draft' && can.manageInvoices() && (
                        <button
                          onClick={(e) => handleMarkSent(inv.id, e)}
                          className="btn-ghost text-xs text-indigo-600 font-semibold"
                          title="Mark as Sent"
                        >
                          <Send size={14} /> Send
                        </button>
                      )}
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="btn-icon"
                        title="View & Print Invoice"
                      >
                        <ChevronRight size={16} />
                      </Link>
                      {can.manageInvoices() && (
                        <button
                          onClick={() => setDeletingId(inv.id)}
                          className="btn-icon text-gray-400 hover:text-red-600"
                          title="Delete"
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

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Professional Invoice"
        size="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Client *</label>
              <select
                required
                value={formData.client}
                onChange={(e) => handleClientChange(e.target.value)}
                className="form-select"
              >
                <option value="">Select a Client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.country ? `(${c.country} — ${c.currency || 'USD'} ${c.currency_symbol || '$'})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Associated Project</label>
              <select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="form-select"
              >
                <option value="">General (No project)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Billing Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="form-select"
              >
                {CURRENCIES.map((cur) => (
                  <option key={cur.code} value={cur.code}>
                    {cur.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Issue Date</label>
              <input
                type="date"
                required
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Due Date</label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          {/* Dynamic Line Items Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label mb-0">Invoice Line Items</label>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Service or Item Name"
                      required
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      placeholder="Qty"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="form-input text-xs text-center"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Unit Price"
                      required
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                      className="form-input text-xs text-right"
                    />
                  </div>
                  <div className="w-24 text-right font-bold text-xs text-gray-900 pr-2">
                    {formatCurrency(item.amount, formData.currency_symbol || '$')}
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Calculations Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <div>
                <label className="form-label">Payment Terms & Instructions</label>
                <textarea
                  rows={2}
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="form-label">Client Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-input text-xs"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(curSubtotal, formData.currency_symbol || '$')}</span>
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span>Discount (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    className="w-16 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-center text-xs"
                  />
                </div>
                <span className="font-semibold text-red-600">-{formatCurrency(curDiscount, formData.currency_symbol || '$')}</span>
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span>Tax Rate (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.tax_percent}
                    onChange={(e) => setFormData({ ...formData, tax_percent: e.target.value })}
                    className="w-16 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-center text-xs"
                  />
                </div>
                <span className="font-semibold text-gray-900">+{formatCurrency(curTax, formData.currency_symbol || '$')}</span>
              </div>

              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-black text-gray-900">
                <span>Grand Total:</span>
                <span className="text-indigo-600 text-base">{formatCurrency(curTotal, formData.currency_symbol || '$')}</span>
              </div>
            </div>
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
              {submitting ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        message="Are you sure you want to permanently delete this invoice record?"
        confirmText="Delete Invoice"
      />
    </div>
  );
}
