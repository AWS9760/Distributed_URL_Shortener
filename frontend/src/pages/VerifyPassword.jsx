import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const VerifyPassword = () => {
  const { shortCode } = useParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [expired, setExpired] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const checkUrl = async () => {
      try {
        await api.get(`/api/url/info/${shortCode}`);
      } catch (err) {
        if (err.response?.status === 410) setExpired(true);
        else if (err.response?.status === 404) setNotFound(true);
      } finally {
        setChecking(false);
      }
    };
    checkUrl();
  }, [shortCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(`/api/url/verify/${shortCode}`, { password });
      await api.post(`/api/url/track/${shortCode}`);
      window.location.href = data.originalUrl;
    } catch (err) {
      if (err.response?.status === 410) {
        setExpired(true);
      } else {
        toast.error(err.response?.data?.message || 'Incorrect password');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="card max-w-md text-center">
          <div className="text-5xl">🔗</div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Link Not Found</h1>
          <p className="mt-2 text-slate-600">This short URL does not exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="card max-w-md text-center">
          <div className="text-5xl">⏰</div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Link Expired</h1>
          <p className="mt-2 text-slate-600">This short URL has expired and is no longer accessible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-md">
        <div className="text-center">
          <div className="text-4xl">🔒</div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Password Protected</h1>
          <p className="mt-2 text-sm text-slate-600">
            This link is protected. Enter the password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              autoFocus
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Continue to Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyPassword;
