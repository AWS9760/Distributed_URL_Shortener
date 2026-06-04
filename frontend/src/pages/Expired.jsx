import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Expired = () => (
  <Layout>
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4">
      <div className="card max-w-md text-center">
        <div className="text-5xl">⏰</div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Link Expired</h1>
        <p className="mt-2 text-slate-600">This short URL has expired and is no longer accessible.</p>
        <Link to="/" className="btn-primary mt-6 inline-block">
          Go Home
        </Link>
      </div>
    </div>
  </Layout>
);

export default Expired;
