import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paymentsAPI, clientsAPI, invoicesAPI } from '../../api/services';
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  Calendar,
  Building,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import {
  formatCurrency,
  formatDate
} from '../../utils/helpers';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const { user, can } = useAuth();
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Payment Form
  const [formData, setFormData] = useState({
    client: '',
    invoice: '',
    amount: '',
    currency: 'USD',
    currency_symbol: '$',
    payment_method: 'bank_transfer',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleClientChange = (clientId) => {
    const selectedClient = clients.find((c) => String(c.id) === String(clientId));
    setFormData((prev) => ({
      ...prev,
      client: clientId,
      invoice: '',
      currency: selectedClient?.currency || prev.currency || 'USD',
      currency_symbol: selectedClient?.currency_symbol || prev.currency_symbol || '$',
    }));
  };

  const handleInvoiceChange = (invoiceId) => {
    const selectedInv = invoices.find((inv) => String(inv.id) === String(invoiceId));
    setFormData((prev) => ({
      ...prev,
      invoice: invoiceId,
      currency: selectedInv?.currency || prev.currency,
      currency_symbol: selectedInv?.currency_symbol || prev.currency_symbol,
      amount: selectedInv ? String(selectedInv.pending_amount ?? (selectedInv.total - selectedInv.paid_amount)) : prev.amount,
    }));
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (methodFilter) params.payment_method = methodFilter;
      if (clientFilter) params.client = clientFilter;

      const res = await paymentsAPI.list(params);
      setPayments(res.data.results || res.data || []);
    } catch {
      toast.error('Failed to load payments ledger');
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [cRes, iRes] = await Promise.all([
        clientsAPI.list({ page_size: 100 }),
        invoicesAPI.list({ page_size: 100 }),
      ]);
      setClients(cRes.data.results || cRes.data || []);
      setInvoices(iRes.data.results || iRes.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchPayments();
  }, [search, methodFilter, clientFilter]);

  useEffect(() => {
    fetchMeta();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      if (!payload.invoice) delete payload.invoice;

      await paymentsAPI.create(payload);
      toast.success('Payment recorded successfully');
      setIsModalOpen(false);
      setFormData({
        client: '',
        invoice: '',
        amount: '',
        currency: 'USD',
        currency_symbol: '$',
        payment_method: 'bank_transfer',
        transaction_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      fetchPayments();
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await paymentsAPI.delete(deletingId);
      toast.success('Payment record removed');
      setDeletingId(null);
      fetchPayments();
    } catch {
      toast.error('Failed to delete payment');
    }
  };

  const totalCollected = payments.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0);
  const avgPayment = payments.length > 0 ? totalCollected / payments.length : 0;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments Ledger</h1>
          <p className="page-subtitle">
            Complete transaction record of customer deposits and settlements
          </p>
        </div>

        {can.managePayments() && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={18} /> Record Payment
          </button>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-emerald-50 text-emerald-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Received</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{formatCurrency(totalCollected)}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-indigo-50 text-indigo-600">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transactions</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{payments.length}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-blue-50 text-blue-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Payment</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{formatCurrency(avgPayment)}</h3>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by transaction ID or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="form-select text-xs w-full sm:w-40"
          >
            <option value="">All Payment Methods</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
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

      {/* Payments Table */}
      {loading ? (
        <LoadingSpinner />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment records found"
          description="Record incoming payments from clients or adjust filters."
          action={
            can.managePayments() && (
              <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                <Plus size={16} /> Record First Payment
              </button>
            )
          }
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Client</th>
                <th>Linked Invoice</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Transaction Ref</th>
                <th>Payment Date</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="font-bold text-gray-900 font-mono text-xs">
                    {p.payment_number || `#${p.id}`}
                  </td>
                  <td className="font-semibold text-gray-900 text-xs">
                    {p.client_name || 'Client #' + p.client}
                  </td>
                  <td>
                    {p.invoice ? (
                      <span className="text-xs text-indigo-600 font-semibold font-mono">
                        {p.invoice_number || 'INV-Linked'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Direct Deposit</span>
                    )}
                  </td>
                  <td className="font-black text-emerald-600 text-sm">
                    {formatCurrency(p.amount, p.currency_symbol)}
                  </td>
                  <td>
                    <span className="badge-blue capitalize text-xs">
                      {p.payment_method?.replace(/_/g, ' ') || 'Direct'}
                    </span>
                  </td>
                  <td className="text-xs text-gray-600 font-mono">
                    {p.transaction_id || '—'}
                  </td>
                  <td className="text-xs text-gray-600">{formatDate(p.payment_date)}</td>
                  <td className="text-right">
                    {can.managePayments() && (
                      <button
                        onClick={() => setDeletingId(p.id)}
                        className="btn-icon text-gray-400 hover:text-red-600"
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Client Payment"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="form-label">Client *</label>
            <select
              required
              value={formData.client}
              onChange={(e) => handleClientChange(e.target.value)}
              className="form-select"
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.country ? `(${c.country} — ${c.currency || 'USD'} ${c.currency_symbol || '$'})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Associated Invoice (Optional)</label>
            <select
              value={formData.invoice}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="form-select"
            >
              <option value="">None (Advance / Direct)</option>
              {invoices
                .filter((inv) => !formData.client || String(inv.client) === String(formData.client))
                .map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} — Total: {formatCurrency(inv.total, inv.currency_symbol || '$')}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Amount ({formData.currency_symbol || '$'}) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="2500.00"
                className="form-input font-bold"
              />
            </div>

            <div>
              <label className="form-label">Payment Date *</label>
              <input
                type="date"
                required
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="form-select"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="form-label">Transaction ID / Ref</label>
              <input
                type="text"
                value={formData.transaction_id}
                onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                placeholder="REF-984310"
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Payment confirmation notes..."
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
              {submitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Payment"
        message="Are you sure you want to delete this payment record?"
        confirmText="Delete Payment"
      />
    </div>
  );
}
