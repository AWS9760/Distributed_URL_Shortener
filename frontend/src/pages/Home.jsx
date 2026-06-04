import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import CopyButton from '../components/CopyButton';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [originalUrl, setOriginalUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to create short URLs');
      return;
    }

    setLoading(true);
    try {
      const payload = { originalUrl };
      if (alias) payload.alias = alias;
      if (expiresAt) payload.expiresAt = expiresAt;
      if (password) payload.password = password;

      const { data } = await api.post('/api/url/shorten', payload);
      setShortUrl(data.shortUrl);
      toast.success('URL shortened successfully!');
      setOriginalUrl('');
      setAlias('');
      setExpiresAt('');
      setPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 px-4 py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggIGQ9Ik0zNiAzNGg0djJoLTR6bTAtNGg0djJoLTR6bTAtNGg0djJoLTR6bS0yIDRoNHYyaC00em0wLTRoNHYyaC00em0wLTRoNHYyaC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Shorten URLs. Track Analytics.
          </h1>
          <p className="mt-4 text-lg text-slate-300 dark:text-slate-400">
            Create powerful short links with custom aliases, password protection, and detailed analytics.
          </p>

          <div className="mt-10 card mx-auto max-w-2xl text-left">
            {!isAuthenticated && (
              <div className="mb-4 rounded-lg bg-red-200 p-3 text-sm text-red-900">
                <Link to="/login" className="font-semibold underline">
                  Login
                </Link>{' '}
                or{' '}
                <Link to="/register" className="font-semibold underline">
                  register
                </Link>{' '}
                to create short URLs.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="url" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Enter your long URL
                </label>
                <input
                  id="url"
                  type="url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://example.com/very-long-url"
                  className="input-field"
                  required
                  disabled={!isAuthenticated}
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                {showAdvanced ? '− Hide' : '+ Show'} advanced options
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${showAdvanced ? 'max-h-[400px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                  }`}
              >
                <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/5 dark:bg-slate-900/60 dark:backdrop-blur-sm">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Custom alias (optional)
                    </label>
                    <input
                      type="text"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      placeholder="my-custom-link"
                      className="input-field"
                      disabled={!isAuthenticated}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Expiry date (optional)
                    </label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="input-field"
                      disabled={!isAuthenticated}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Password protection (optional)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="input-field pr-10"
                        disabled={!isAuthenticated}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                        disabled={!isAuthenticated}
                      >
                        {showPassword ? (
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
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={loading || !isAuthenticated}>
                {loading ? 'Generating...' : 'Shorten URL'}
              </button>
            </form>

            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${shortUrl ? 'max-h-[200px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                }`}
            >
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:backdrop-blur-sm">
                <p className="mb-2 text-sm font-medium text-emerald-800 dark:text-emerald-400">Your shortened URL:</p>
                <div className="flex items-center gap-2">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate font-mono text-sm text-emerald-700 hover:underline dark:text-emerald-300"
                  >
                    {shortUrl}
                  </a>
                  <CopyButton text={shortUrl} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { title: 'Lightning Fast', desc: 'Redis-powered caching for instant redirects.', icon: '/features/lightning.png' },
            { title: 'Rich Analytics', desc: 'Track clicks, browsers, devices, and trends.', icon: '/features/graph.png' },
            { title: 'Secure Links', desc: 'Password protection and expiry dates.', icon: '/features/lock.png' },
          ].map((feature) => (
            <div key={feature.title} className="card text-center flex flex-col items-center">
              <img src={feature.icon} alt={feature.title} className="h-12 w-12 object-contain" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Home;
