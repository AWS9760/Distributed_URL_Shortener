import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive
      ? 'text-primary-600 dark:text-primary-400'
      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50'
    }`;

  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-white/5 dark:bg-slate-950/80 transition-colors duration-200 sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          {darkMode ? (
            <img src="/features/logodark.png" alt="LinkShort Logo" className="h-10 w-auto object-contain" />
          ) : (
            <img src="/features/logolight.png" alt="LinkShort Logo" className="h-10 w-auto object-contain" />
          )}
        </Link>

        <div className="flex items-center gap-6">
          <button
            onClick={toggleDarkMode}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 transition-all"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          {isAuthenticated ? (
            <>
              <NavLink to="/" className={linkClass}>
                Home
              </NavLink>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/analytics" className={linkClass}>
                Analytics
              </NavLink>
              <span className="hidden text-sm font-medium text-slate-500 dark:text-slate-400 sm:inline">
                Hi, {user?.username}
              </span>
              <button onClick={handleLogout} className="btn-secondary !py-2 text-sm hover:!bg-red-600 hover:!text-white hover:!border-red-600 dark:hover:!bg-red-600 dark:hover:!text-white dark:hover:!border-red-600 transition-all">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <Link to="/register" className="btn-primary !py-2">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
