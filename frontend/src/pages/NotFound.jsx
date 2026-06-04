import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const NotFound = () => (
  <Layout>
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600">404</h1>
        <p className="mt-4 text-xl text-slate-700">Page not found</p>
        <Link to="/" className="btn-primary mt-6 inline-block">
          Go Home
        </Link>
      </div>
    </div>
  </Layout>
);

export default NotFound;
