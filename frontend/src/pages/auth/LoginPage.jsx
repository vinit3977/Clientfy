import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Users,
  FolderKanban,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back to Clientify!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Invalid credentials. Please verify and try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Column: Visual Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-indigo-600/30">
            C
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight">
              Client<span className="text-indigo-400">ify</span>
            </span>
            <span className="block text-[11px] text-indigo-300 font-medium tracking-widest uppercase">
              Client & Business OS
            </span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={14} className="text-indigo-400" /> Enterprise Role-Based Architecture
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Streamline your agency operations in one centralized hub.
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Manage clients, project lifecycles, team allocation, real-time invoices, payments, and operational reporting with granular permission controls.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Users className="text-indigo-400 mb-2" size={20} />
              <div className="text-sm font-semibold">Client 360° View</div>
              <div className="text-xs text-slate-400">Total client history & billing</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <BarChart3 className="text-purple-400 mb-2" size={20} />
              <div className="text-sm font-semibold">Real-time Analytics</div>
              <div className="text-xs text-slate-400">Cashflow & delivery metrics</div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Encrypted JWT & RBAC Protected</span>
          </div>
          <span>v1.0.0 Production Ready</span>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Brand */}
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-white text-lg">
              C
            </div>
            <span className="text-xl font-bold">Clientify</span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Enter your credentials to access the Clientify workspace.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label" htmlFor="email">
                Work Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="form-input pl-11"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0" htmlFor="password">
                  Password
                </label>
                <span className="text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="form-input pl-11"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base font-semibold shadow-indigo-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Demo Quick Fill
              </span>
              <span className="text-[11px] text-gray-400">Click to autofill credentials</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@clientify.com', 'Admin@12345')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-purple-900 font-semibold text-left transition-colors flex flex-col"
              >
                <span className="text-purple-700 font-bold">Admin</span>
                <span className="text-[11px] text-purple-600/70 font-normal truncate">admin@clientify.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager@clientify.com', 'Manager@12345')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-900 font-semibold text-left transition-colors flex flex-col"
              >
                <span className="text-blue-700 font-bold">Manager</span>
                <span className="text-[11px] text-blue-600/70 font-normal truncate">manager@clientify.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('accountant@clientify.com', 'Accountant@12345')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-900 font-semibold text-left transition-colors flex flex-col"
              >
                <span className="text-emerald-700 font-bold">Accountant</span>
                <span className="text-[11px] text-emerald-600/70 font-normal truncate">accountant@clientify.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('employee@clientify.com', 'Employee@12345')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-left transition-colors flex flex-col"
              >
                <span className="text-slate-700 font-bold">Employee</span>
                <span className="text-[11px] text-slate-500 font-normal truncate">employee@clientify.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
