import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'danger', loading = false }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md fade-in">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{message}</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <button onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'}
              disabled={loading}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
