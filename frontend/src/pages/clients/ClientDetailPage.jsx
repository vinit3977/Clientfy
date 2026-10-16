import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clientsAPI } from '../../api/services';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  FolderKanban,
  Receipt,
  CreditCard,
  Activity,
  Plus,
  Edit2,
  Archive,
  ChevronRight,
  Clock,
  DollarSign
} from 'lucide-react';
import {
  getStatusBadge,
  formatStatus,
  formatCurrency,
  formatDate,
  formatRelativeTime
} from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuth();

  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(true);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [cRes, pRes, iRes, payRes, actRes] = await Promise.all([
        clientsAPI.get(id),
        clientsAPI.projects(id).catch(() => ({ data: [] })),
        clientsAPI.invoices(id).catch(() => ({ data: [] })),
        clientsAPI.payments(id).catch(() => ({ data: [] })),
        clientsAPI.activities(id).catch(() => ({ data: [] })),
      ]);

      setClient(cRes.data);
      setProjects(pRes.data || []);
      setInvoices(iRes.data || []);
      setPayments(payRes.data || []);
      setActivities(actRes.data || []);
    } catch {
      toast.error('Client not found or access denied');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!client) return null;

  const totalBilled = invoices.reduce((acc, inv) => acc + parseFloat(inv.total || 0), 0);
  const totalPaid = payments.reduce((acc, pay) => acc + parseFloat(pay.amount || 0), 0);
  const outstanding = Math.max(0, totalBilled - totalPaid);

  return (
    <div className="space-y-6 fade-in">
      {/* Back Link */}
      <Link
        to="/clients"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back to all clients
      </Link>

      {/* Client Profile Header Card */}
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-lg shadow-indigo-100">
              {client.name?.[0] || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-gray-900">{client.name}</h1>
                <span className={getStatusBadge(client.status)}>
                  {formatStatus(client.status)}
                </span>
              </div>

              {client.company_name && (
                <p className="text-sm font-semibold text-indigo-600 flex items-center gap-1.5 mt-1">
                  <Building size={16} /> {client.company_name}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">
                  Industry: <span className="font-semibold capitalize text-gray-700">{formatStatus(client.industry || 'general')}</span>
                </span>
                <span className="text-gray-300">•</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Globe size={13} className="text-indigo-500" />
                  {client.country || 'Global'} — {client.currency || 'USD'} ({client.currency_symbol || '$'})
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-400">Client since {formatDate(client.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge Group */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center min-w-[100px]">
              <div className="text-[10px] uppercase font-bold text-gray-400">Projects</div>
              <div className="text-lg font-black text-gray-900">{projects.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center min-w-[110px]">
              <div className="text-[10px] uppercase font-bold text-gray-400">Total Billed</div>
              <div className="text-lg font-black text-gray-900">{formatCurrency(totalBilled, client.currency_symbol || '$')}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center min-w-[110px]">
              <div className="text-[10px] uppercase font-bold text-emerald-600">Collected</div>
              <div className="text-lg font-black text-emerald-700">{formatCurrency(totalPaid, client.currency_symbol || '$')}</div>
            </div>
          </div>
        </div>

        {/* Detailed Contact Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail size={16} className="text-indigo-500 shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={16} className="text-indigo-500 shrink-0" />
            <span>{client.phone || 'No phone recorded'}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={16} className="text-indigo-500 shrink-0" />
            <span className="truncate">
              {[client.city, client.state, client.country].filter(Boolean).join(', ') || 'No location set'}
            </span>
          </div>

          {client.website ? (
            <a
              href={client.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-indigo-600 hover:underline truncate"
            >
              <Globe size={16} className="shrink-0" />
              <span className="truncate">{client.website}</span>
            </a>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <Globe size={16} className="shrink-0" />
              <span>No website set</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { id: 'projects', label: 'Projects', icon: FolderKanban, count: projects.length },
          { id: 'invoices', label: 'Invoices', icon: Receipt, count: invoices.length },
          { id: 'payments', label: 'Payments', icon: CreditCard, count: payments.length },
          { id: 'activity', label: 'Activity Logs', icon: Activity, count: activities.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Associated Projects</h3>
              {can.manageProjects() && (
                <Link to="/projects" className="btn-primary text-xs">
                  <Plus size={14} /> New Project
                </Link>
              )}
            </div>

            {projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects assigned"
                description="This client does not have any active or past projects yet."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className="card-hover p-5 block group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {p.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {p.description || 'No description provided.'}
                        </p>
                      </div>
                      <span className={getStatusBadge(p.status)}>
                        {formatStatus(p.status)}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${p.progress || 0}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-700">{p.progress || 0}%</span>
                      </div>
                      <span className="text-gray-500">Due: {formatDate(p.deadline)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Client Invoices</h3>
              {can.manageInvoices() && (
                <Link to="/invoices" className="btn-primary text-xs">
                  <Plus size={14} /> Create Invoice
                </Link>
              )}
            </div>

            {invoices.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No invoices found"
                description="No billing invoices have been issued for this client."
              />
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Issue Date</th>
                      <th>Due Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="font-bold text-gray-900">{inv.invoice_number}</td>
                        <td className="text-xs">{formatDate(inv.issue_date)}</td>
                        <td className="text-xs">{formatDate(inv.due_date)}</td>
                        <td className="font-bold text-gray-900">
                          {formatCurrency(inv.total, inv.currency_symbol || client.currency_symbol || '$')}
                        </td>
                        <td>
                          <span className={getStatusBadge(inv.status)}>
                            {formatStatus(inv.status)}
                          </span>
                        </td>
                        <td className="text-right">
                          <Link
                            to={`/invoices/${inv.id}`}
                            className="btn-ghost text-xs inline-flex items-center gap-1"
                          >
                            View <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Payments Recorded</h3>
              {can.managePayments() && (
                <Link to="/payments" className="btn-primary text-xs">
                  <Plus size={14} /> Record Payment
                </Link>
              )}
            </div>

            {payments.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="No payments found"
                description="No payment transactions recorded for this client yet."
              />
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Payment #</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Transaction Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="font-bold text-gray-900">{p.payment_number || `#${p.id}`}</td>
                        <td className="text-xs">{formatDate(p.payment_date || p.created_at)}</td>
                        <td className="font-bold text-emerald-600">
                          {formatCurrency(p.amount, p.currency_symbol || client?.currency_symbol || '$')}
                        </td>
                        <td className="capitalize text-xs">{p.payment_method?.replace(/_/g, ' ') || 'Direct'}</td>
                        <td className="text-xs text-gray-500 font-mono">
                          {p.transaction_id || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="card p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Client History & Audits</h3>
            {activities.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No activity records found</p>
            ) : (
              <div className="space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs border-b border-gray-50 pb-3 last:border-none">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0">
                      {act.user_name?.[0] || 'A'}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">
                        <span className="font-bold">{act.user_name || 'System'}</span> {act.description}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">
                        {formatRelativeTime(act.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
