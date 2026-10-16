import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { invoicesAPI, paymentsAPI } from '../../api/services';
import {
  ArrowLeft,
  Printer,
  Send,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Building,
  Calendar,
  DollarSign,
  ShieldAlert,
  Plus
} from 'lucide-react';
import {
  getStatusBadge,
  formatStatus,
  formatCurrency,
  formatDate
} from '../../utils/helpers';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, can } = useAuth();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // Record Payment Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payData, setPayData] = useState({
    amount: '',
    payment_method: 'bank_transfer',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [recordingPay, setRecordingPay] = useState(false);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await invoicesAPI.get(id);
      setInvoice(res.data);
      setPayData((prev) => ({
        ...prev,
        amount: (res.data.total - (res.data.paid_amount || 0)).toFixed(2),
      }));
    } catch {
      toast.error('Invoice not found or unauthorized');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleMarkSent = async () => {
    try {
      await invoicesAPI.markSent(id);
      toast.success('Invoice marked as Sent');
      fetchInvoice();
    } catch {
      toast.error('Failed to mark as sent');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setRecordingPay(true);
    try {
      await paymentsAPI.create({
        invoice: id,
        client: invoice.client,
        project: invoice.project || undefined,
        amount: parseFloat(payData.amount),
        currency: invoice.currency || 'USD',
        currency_symbol: invoice.currency_symbol || '$',
        payment_method: payData.payment_method,
        transaction_id: payData.transaction_id,
        payment_date: payData.payment_date,
        notes: payData.notes,
      });
      toast.success('Payment successfully recorded!');
      setIsPayModalOpen(false);
      fetchInvoice();
    } catch (err) {
      toast.error('Failed to record payment');
    } finally {
      setRecordingPay(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!invoice) return null;

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const pendingAmount = Math.max(0, invoice.total - (invoice.paid_amount || 0));

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      {/* Top action header (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          to="/invoices"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Invoices
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="btn-secondary text-xs"
          >
            <Printer size={15} /> Print / Save PDF
          </button>

          {invoice.status === 'draft' && can.manageInvoices() && (
            <button
              onClick={handleMarkSent}
              className="btn-secondary text-xs text-indigo-600"
            >
              <Send size={15} /> Mark as Sent
            </button>
          )}

          {invoice.status !== 'paid' && can.managePayments() && (
            <button
              onClick={() => setIsPayModalOpen(true)}
              className="btn-primary text-xs"
            >
              <CreditCard size={15} /> Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Formal Printable Invoice Sheet */}
      <div className="card p-8 sm:p-12 bg-white print:border-none print:shadow-none print:p-0">
        {/* Invoice Top Branding */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-white text-xl">
                C
              </div>
              <div>
                <span className="text-xl font-extrabold text-gray-900 tracking-tight">Clientify</span>
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Business Operations Inc.
                </span>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 space-y-0.5">
              <p>100 Enterprise Way, Suite 400</p>
              <p>Silicon Valley, CA 94025</p>
              <p>billing@clientify.com</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">INVOICE</h2>
            <p className="text-sm font-extrabold text-indigo-600 font-mono mt-1">
              #{invoice.invoice_number}
            </p>
            <div className="mt-2">
              <span className={getStatusBadge(invoice.status)}>
                {formatStatus(invoice.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Bill To & Dates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-8 border-b border-gray-100 text-xs">
          <div>
            <span className="font-extrabold text-gray-400 uppercase tracking-wider block mb-2">
              Billed To
            </span>
            <h4 className="text-sm font-black text-gray-900">{invoice.client_name}</h4>
            {invoice.project_name && (
              <p className="text-gray-600 mt-1">
                Project: <strong className="text-indigo-600">{invoice.project_name}</strong>
              </p>
            )}
          </div>

          <div className="sm:text-right space-y-1">
            <p className="text-gray-600">
              <span className="text-gray-400 font-semibold mr-2">Invoice Date:</span>
              <strong className="text-gray-900">{formatDate(invoice.invoice_date)}</strong>
            </p>
            <p className="text-gray-600">
              <span className="text-gray-400 font-semibold mr-2">Due Date:</span>
              <strong className="text-gray-900">{formatDate(invoice.due_date)}</strong>
            </p>
            <p className="text-gray-600">
              <span className="text-gray-400 font-semibold mr-2">Currency:</span>
              <strong className="text-gray-900">{invoice.currency || 'USD'} ({invoice.currency_symbol || '$'})</strong>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-8">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 uppercase font-extrabold text-[11px]">
                <th className="text-left pb-3">Item & Description</th>
                <th className="text-center pb-3 w-20">Qty</th>
                <th className="text-right pb-3 w-28">Rate</th>
                <th className="text-right pb-3 w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4">
                    <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                    {item.description && (
                      <p className="text-gray-500 mt-0.5">{item.description}</p>
                    )}
                  </td>
                  <td className="py-4 text-center font-semibold text-gray-700">{item.quantity}</td>
                  <td className="py-4 text-right font-semibold text-gray-700">
                    {formatCurrency(item.unit_price, invoice.currency_symbol)}
                  </td>
                  <td className="py-4 text-right font-extrabold text-gray-900">
                    {formatCurrency(item.amount, invoice.currency_symbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary and Totals */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-6">
          <div className="max-w-md text-xs space-y-3">
            {invoice.terms && (
              <div>
                <span className="font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                  Payment Terms
                </span>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 whitespace-pre-line">
                  {invoice.terms}
                </p>
              </div>
            )}
            {invoice.notes && (
              <div>
                <span className="font-extrabold text-gray-400 uppercase tracking-wider block mb-1">
                  Notes
                </span>
                <p className="text-gray-600 italic">{invoice.notes}</p>
              </div>
            )}
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(invoice.subtotal, invoice.currency_symbol)}
              </span>
            </div>

            {parseFloat(invoice.discount || 0) > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount ({invoice.discount_percent}%):</span>
                <span>-{formatCurrency(invoice.discount, invoice.currency_symbol)}</span>
              </div>
            )}

            {parseFloat(invoice.tax || 0) > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax ({invoice.tax_percent}%):</span>
                <span>+{formatCurrency(invoice.tax, invoice.currency_symbol)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-black text-gray-900">
              <span>Grand Total:</span>
              <span className="text-indigo-600 text-lg">
                {formatCurrency(invoice.total, invoice.currency_symbol)}
              </span>
            </div>

            <div className="flex justify-between text-emerald-700 font-bold pt-1">
              <span>Paid to Date:</span>
              <span>{formatCurrency(invoice.paid_amount || 0, invoice.currency_symbol)}</span>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between text-sm font-extrabold text-gray-900">
              <span>Balance Due:</span>
              <span className={pendingAmount > 0 ? 'text-red-600' : 'text-emerald-600'}>
                {formatCurrency(pendingAmount, invoice.currency_symbol)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={`Record Payment for ${invoice.invoice_number}`}
        size="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="form-label">Payment Amount ({invoice.currency_symbol || '$'}) *</label>
            <input
              type="number"
              step="0.01"
              required
              max={invoice.total}
              value={payData.amount}
              onChange={(e) => setPayData({ ...payData, amount: e.target.value })}
              className="form-input font-bold text-base"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Outstanding balance: {formatCurrency(pendingAmount, invoice.currency_symbol || '$')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Payment Method</label>
              <select
                value={payData.payment_method}
                onChange={(e) => setPayData({ ...payData, payment_method: e.target.value })}
                className="form-select font-medium"
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
              <label className="form-label">Payment Date</label>
              <input
                type="date"
                required
                value={payData.payment_date}
                onChange={(e) => setPayData({ ...payData, payment_date: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Transaction / Reference ID</label>
            <input
              type="text"
              value={payData.transaction_id}
              onChange={(e) => setPayData({ ...payData, transaction_id: e.target.value })}
              placeholder="e.g. TXN-98234823"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Internal Notes</label>
            <textarea
              rows={2}
              value={payData.notes}
              onChange={(e) => setPayData({ ...payData, notes: e.target.value })}
              placeholder="Recorded by accountant..."
              className="form-input"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={recordingPay} className="btn-primary">
              {recordingPay ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
