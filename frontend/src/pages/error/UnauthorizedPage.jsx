import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
      <div className="card p-8 sm:p-12 max-w-md w-full space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-black text-gray-900">Access Restricted</h1>
        <p className="text-sm text-gray-600">
          Your current account role does not have permission to access this module. Please contact your administrator.
        </p>
        <div className="pt-4">
          <Link to="/dashboard" className="btn-primary w-full justify-center">
            <ArrowLeft size={16} /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
