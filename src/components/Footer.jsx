import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-100 pt-16 pb-8 mt-20 print:hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 no-underline group mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-200">
                F
              </div>
              <h2 className="text-xl font-heading font-black tracking-tighter text-slate-900 m-0">
                FARAN<span className="text-indigo-600">TRADERS</span>
              </h2>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed font-semibold">
              Modern ERP and Point of Sale solution designed to streamline business operations, manage inventory, and optimize financial tracking with ease.
            </p>
          </div>

          {/* Links Col 1 */}
          <div className="md:col-span-1">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">Product</h3>
            <ul className="space-y-4 m-0 p-0 list-none">
              <li><Link to="/features" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-semibold no-underline">Features</Link></li>
              <li><Link to="/about" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-semibold no-underline">About Us</Link></li>
              <li><Link to="/login" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-semibold no-underline">Admin Login</Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="md:col-span-1">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">Resources</h3>
            <ul className="space-y-4 m-0 p-0 list-none">
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-semibold no-underline">Help Center</a></li>
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-semibold no-underline">Documentation</a></li>
              <li><a href="#" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-semibold no-underline">System Status</a></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="md:col-span-1">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">Contact</h3>
            <ul className="space-y-4 m-0 p-0 list-none">
              <li className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
                <i className="fas fa-envelope text-indigo-400"></i> support@farantraders.com
              </li>
              <li className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
                <i className="fas fa-phone text-indigo-400"></i> +92 300 1234567
              </li>
              <li className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
                <i className="fas fa-map-marker-alt text-indigo-400"></i> Sohdra Wazirabad, Pakistan
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs font-semibold m-0">
            &copy; {currentYear} Faran Traders Management System. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><i className="fab fa-twitter"></i></a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><i className="fab fa-linkedin"></i></a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><i className="fab fa-facebook"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
