import Navbar from './Navbar';

const Layout = ({ children }) => (
  <div className="min-h-screen">
    <Navbar />
    <main>{children}</main>
  </div>
);

export default Layout;
