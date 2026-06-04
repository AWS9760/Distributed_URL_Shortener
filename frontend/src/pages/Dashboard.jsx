import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import CopyButton from '../components/CopyButton';
import api from '../utils/api';

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Edit Modal State
  const [editingUrl, setEditingUrl] = useState(null);
  const [editPassword, setEditPassword] = useState('');
  const [editExpiresAt, setEditExpiresAt] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchUrls = useCallback(async () => {
    try {
      const params = search ? { search } : {};
      const { data } = await api.get('/api/url/all', { params });
      setUrls(data.urls);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load URLs');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchUrls, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchUrls, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this URL?')) return;

    setDeletingId(id);
    try {
      await api.delete(`/api/url/${id}`);
      setUrls((prev) => prev.filter((u) => u.id !== id));
      toast.success('URL deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete URL');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (url) => {
    setEditingUrl(url);
    setEditPassword('');
    setEditExpiresAt(url.expiresAt ? new Date(url.expiresAt).toISOString().split('T')[0] : '');
    setShowEditPassword(false);
  };

  const closeEditModal = () => {
    setEditingUrl(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { expiresAt: editExpiresAt };
      if (editPassword) {
        payload.password = editPassword;
      }
      const { data } = await api.put(`/api/url/${editingUrl.id}`, payload);
      setUrls((prev) => prev.map((u) => (u.id === data.url.id ? data.url : u)));
      toast.success('URL updated successfully');
      closeEditModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update URL');
    } finally {
      setSaving(false);
    }
  };

  const removePassword = async () => {
    if (!window.confirm('Are you sure you want to remove the password protection?')) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/api/url/${editingUrl.id}`, { password: '' });
      setUrls((prev) => prev.map((u) => (u.id === data.url.id ? data.url : u)));
      toast.success('Password removed');
      closeEditModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove password');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const truncate = (str, len = 40) =>
    str.length > len ? str.substring(0, len) + '...' : str;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Manage all your shortened URLs</p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by URL, short code, or alias..."
            className="input-field max-w-sm"
          />
        </div>

        <div className="mt-8 card overflow-hidden !p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            </div>
          ) : urls.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-500 dark:text-slate-400">No URLs found. Create your first short URL on the home page.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-300">Original URL</th>
                    <th className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-300">Short URL</th>
                    <th className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-300">Clicks</th>
                    <th className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-300">Created</th>
                    <th className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {urls.map((url) => (
                    <tr key={url.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <a
                          href={url.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline transition-colors"
                          title={url.originalUrl}
                        >
                          {truncate(url.originalUrl)}
                        </a>
                        {url.hasPassword && (
                          <span className="ml-2 inline-flex rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            🔒
                          </span>
                        )}
                        {url.expiresAt && (
                          <span className="ml-1 inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Exp: {formatDate(url.expiresAt)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-primary-600 dark:text-primary-400">{url.shortCode}</span>
                          <CopyButton text={url.shortUrl} label="Copy" />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{url.clicks}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatDate(url.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(url)}
                            className="btn-secondary !px-2 !py-1 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(url.id)}
                            disabled={deletingId === url.id}
                            className="btn-danger !px-2 !py-1 text-xs"
                          >
                            {deletingId === url.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md bg-white dark:bg-slate-950">
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-50">Edit URL Settings</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  New Password (leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder={editingUrl.hasPassword ? "Enter new password" : "Add a password"}
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                  >
                    {showEditPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {editingUrl.hasPassword && (
                  <button
                    type="button"
                    onClick={removePassword}
                    className="mt-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Remove Password Protection
                  </button>
                )}
              </div>
              
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={editExpiresAt}
                  onChange={(e) => setEditExpiresAt(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeEditModal} className="btn-secondary" disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
