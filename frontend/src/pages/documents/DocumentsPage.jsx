import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentsAPI, clientsAPI, projectsAPI } from '../../api/services';
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  Building,
  FolderKanban,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  Image,
  FileCheck
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const DOC_TYPES = [
  { id: 'contract', label: 'Contract' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'agreement', label: 'Agreement' },
  { id: 'project_file', label: 'Project File' },
  { id: 'brand_asset', label: 'Brand Asset' },
  { id: 'report', label: 'Report' },
  { id: 'other', label: 'Other' },
];

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');

  // Upload Modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    document_type: 'contract',
    client: '',
    project: '',
    description: '',
  });
  const [fileObject, setFileObject] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (typeFilter) params.document_type = typeFilter;
      if (clientFilter) params.client = clientFilter;

      const res = await documentsAPI.list(params);
      setDocuments(res.data.results || res.data || []);
    } catch {
      toast.error('Failed to load documents');
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
    fetchDocuments();
  }, [search, typeFilter, clientFilter]);

  useEffect(() => {
    fetchMeta();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!fileObject) {
      toast.error('Please choose a file to upload');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name || fileObject.name);
      data.append('document_type', formData.document_type);
      if (formData.client) data.append('client', formData.client);
      if (formData.project) data.append('project', formData.project);
      if (formData.description) data.append('description', formData.description);
      data.append('file', fileObject);

      await documentsAPI.create(data);
      toast.success('Document uploaded successfully');
      setIsUploadOpen(false);
      setFormData({
        name: '',
        document_type: 'contract',
        client: '',
        project: '',
        description: '',
      });
      setFileObject(null);
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await documentsAPI.delete(deletingId);
      toast.success('Document removed');
      setDeletingId(null);
      fetchDocuments();
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getDocIcon = (type) => {
    switch (type) {
      case 'contract':
      case 'agreement':
        return <FileCheck className="text-emerald-500" size={24} />;
      case 'report':
        return <FileSpreadsheet className="text-blue-500" size={24} />;
      case 'brand_asset':
        return <Image className="text-purple-500" size={24} />;
      default:
        return <FileText className="text-indigo-500" size={24} />;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Repository</h1>
          <p className="page-subtitle">
            Secure client contracts, project proposals, agreements, and digital deliverables
          </p>
        </div>

        <button onClick={() => setIsUploadOpen(true)} className="btn-primary">
          <UploadCloud size={18} /> Upload Document
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="form-select text-xs w-full sm:w-40"
          >
            <option value="">All Document Types</option>
            {DOC_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
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

      {/* Documents Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents uploaded"
          description="Upload files to centralize contracts, proposals, and client deliverables."
          action={
            <button onClick={() => setIsUploadOpen(true)} className="btn-primary">
              <UploadCloud size={16} /> Upload First File
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="card-hover p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                    {getDocIcon(doc.document_type)}
                  </div>

                  <span className="badge-gray uppercase text-[10px] tracking-wider font-bold">
                    {doc.document_type?.replace(/_/g, ' ')}
                  </span>
                </div>

                <h4 className="font-extrabold text-gray-900 text-sm mt-3 line-clamp-1" title={doc.name}>
                  {doc.name}
                </h4>

                {doc.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {doc.description}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-500">
                  {doc.client_name && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Building size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">Client: <strong className="text-gray-700">{doc.client_name}</strong></span>
                    </div>
                  )}

                  {doc.project_name && (
                    <div className="flex items-center gap-1.5 truncate">
                      <FolderKanban size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate">Project: <strong className="text-gray-700">{doc.project_name}</strong></span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                    <span>{formatFileSize(doc.file_size)} • {doc.file_type || 'FILE'}</span>
                    <span>{formatDate(doc.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                {doc.file ? (
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                  >
                    <Download size={14} /> Download File
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">File unavailable</span>
                )}

                <button
                  onClick={() => setDeletingId(doc.id)}
                  className="btn-icon w-8 h-8 text-gray-400 hover:text-red-600"
                  title="Delete Document"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Document"
        size="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="form-label">Document Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Master Services Agreement 2026"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Document Type *</label>
            <select
              value={formData.document_type}
              onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
              className="form-select"
            >
              {DOC_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Tag Client</label>
              <select
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="form-select"
              >
                <option value="">None (Internal)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Tag Project</label>
              <select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="form-select"
              >
                <option value="">None (General)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Choose File *</label>
            <input
              type="file"
              required
              onChange={(e) => {
                const f = e.target.files?.[0];
                setFileObject(f || null);
                if (f && !formData.name) setFormData((prev) => ({ ...prev, name: f.name }));
              }}
              className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="form-label">Description / Summary</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Scope and version details..."
              className="form-input"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document from the repository?"
        confirmText="Delete Document"
      />
    </div>
  );
}
