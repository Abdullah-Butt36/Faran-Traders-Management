import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Sidebar({ isOpen, setIsOpen }) {
  const { user, signOut } = useAuth();
  
  const menuItems = [
    { name: 'Dashboard', icon: 'fa-th-large', path: '/dashboard' },
    { name: 'Customers', icon: 'fa-users', path: '/customers' },
    { name: 'Suppliers', icon: 'fa-truck', path: '/suppliers' },
    { name: 'Items', icon: 'fa-box', path: '/items' },
    { name: 'Sales', icon: 'fa-shopping-cart', path: '/sales' },
    { name: 'Purchases', icon: 'fa-shopping-bag', path: '/purchases' },
    { name: 'Ledger', icon: 'fa-book', path: '/ledger' },
    { name: 'Expenses', icon: 'fa-money-bill-wave', path: '/expenses' },
    { name: 'Stock Report', icon: 'fa-file-invoice', path: '/stock-report' },
    { name: 'Profit & Loss', icon: 'fa-chart-pie', path: '/reports' },
    { name: 'Settings', icon: 'fa-cog', path: '/settings' }
  ];

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 text-slate-400 border-r border-slate-800 flex flex-col z-[100] transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex-shrink-0 print:hidden`}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            FT
          </div>
          <span className="text-white font-black tracking-tight text-xl uppercase">Faran<span className="text-indigo-500">Traders</span></span>
        </div>
      </div>

      <nav className="flex-grow px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 no-underline font-medium ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <i className={`fas ${item.icon} w-5 text-center`}></i>
            <span className="text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors font-bold text-sm"
        >
          <i className="fas fa-sign-out-alt w-5 text-center"></i>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
