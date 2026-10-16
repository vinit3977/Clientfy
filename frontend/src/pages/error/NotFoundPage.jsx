import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
      <div className="card p-8 sm:p-12 max-w-md w-full space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <FileQuestion size={32} />
        </div>
        <h1 className="text-3xl font-black text-gray-900">404</h1>
        <h2 className="text-lg font-bold text-gray-800">Page Not Found</h2>
        <p className="text-sm text-gray-600">
          The requested page could not be located in this workspace.
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
