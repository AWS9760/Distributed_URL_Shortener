import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === undefined || value === null) return;

    const duration = 500; // Increased speed
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setDisplayValue(Math.floor(easeProgress * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue}</>;
};

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [browserStats, setBrowserStats] = useState([]);
  const [clicksPerDay, setClicksPerDay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, browserRes, clicksRes] = await Promise.all([
          api.get('/api/analytics/overview'),
          api.get('/api/analytics/browser-stats'),
          api.get('/api/analytics/clicks-per-day'),
        ]);
        setOverview(overviewRes.data.overview);
        setBrowserStats(browserRes.data.browserStats);
        setClicksPerDay(clicksRes.data.clicksPerDay);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setChartReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const barData = {
    labels: clicksPerDay.map((d) => d.date),
    datasets: [
      {
        label: 'Clicks',
        data: chartReady ? clicksPerDay.map((d) => d.clicks) : clicksPerDay.map(() => 0),
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        borderRadius: 6,
      },
    ],
  };

  const pieData = {
    labels: browserStats.map((b) => b.browser),
    datasets: [
      {
        data: chartReady ? browserStats.map((b) => b.count) : browserStats.map(() => 0),
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    animation: {
      duration: 1000,
    },
  };

  const pieOptions = {
    responsive: true,
    animation: {
      duration: 1000,
    },
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Analytics</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Track performance of your shortened URLs</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="card flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total URLs Created</p>
              <p className="mt-2 text-3xl font-bold text-primary-600 dark:text-primary-400">
                <AnimatedNumber value={overview?.totalUrls || 0} />
              </p>
            </div>
            <div className="rounded-full bg-primary-100 p-3 dark:bg-primary-900/30">
              <svg className="h-8 w-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
          <div className="card flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Clicks</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                <AnimatedNumber value={overview?.totalClicks || 0} />
              </p>
            </div>
            <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">Clicks Per Day</h2>
            {clicksPerDay.length > 0 ? (
              <Bar data={barData} options={chartOptions} />
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">No click data yet</p>
            )}
          </div>
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">Browser Distribution</h2>
            {browserStats.length > 0 ? (
              <Pie data={pieData} options={pieOptions} />
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">No browser data yet</p>
            )}
          </div>
        </div>

        <div className="mt-8 card">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">Most Visited URLs</h2>
          {overview?.topUrls?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Original URL</th>
                    <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Short Code</th>
                    <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {overview.topUrls.map((url) => (
                    <tr key={url.shortCode}>
                      <td className="py-3">
                        <a
                          href={url.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline transition-colors"
                        >
                          {url.originalUrl.length > 50
                            ? url.originalUrl.substring(0, 50) + '...'
                            : url.originalUrl}
                        </a>
                      </td>
                      <td className="py-3 font-mono dark:text-slate-300">{url.shortCode}</td>
                      <td className="py-3 font-medium text-slate-900 dark:text-slate-100">{url.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">No URLs yet</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
