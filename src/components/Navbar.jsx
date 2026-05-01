import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const linkClass = ({ isActive }) => 
    `text-sm md:text-xs lg:text-sm font-bold transition-all duration-300 no-underline px-4 py-2 rounded-xl ${
      isActive 
        ? 'text-indigo-600 bg-indigo-50' 
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`;

  const mobileLinkClass = ({ isActive }) => 
    `text-lg font-black transition-all duration-300 no-underline px-6 py-4 rounded-2xl flex items-center justify-between ${
      isActive 
        ? 'text-indigo-600 bg-indigo-50/50' 
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <nav className={`w-full sticky top-0 z-[100] border-b border-slate-100 transition-colors duration-300 ${isOpen ? 'bg-white' : 'bg-white/80 backdrop-blur-xl'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 no-underline group shrink-0" onClick={() => setIsOpen(false)}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
            F
          </div>
          <h2 className="text-xl font-heading font-black tracking-tighter text-slate-900 m-0">
            FARAN<span className="text-indigo-600">TRADERS</span>
          </h2>
        </NavLink>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/features" className={linkClass}>Features</NavLink>
          <NavLink to="/about" className={linkClass}>About</NavLink>
          
          <div className="w-px h-6 bg-slate-200 mx-2 lg:mx-4" />
          
          {user ? (
            <Link to="/dashboard" className="bg-indigo-600 text-white px-5 lg:px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-100 transition-all hover:-translate-y-0.5 active:translate-y-0 no-underline inline-block">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="bg-slate-900 text-white px-5 lg:px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-100 transition-all hover:-translate-y-0.5 active:translate-y-0 no-underline inline-block">
              Admin Portal
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden w-11 h-11 flex items-center justify-center text-slate-900 bg-slate-100 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95"
        >
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars-staggered'} text-lg`}></i>
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 top-20 bg-white z-[90] md:hidden transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
        <div className="p-6 flex flex-col gap-3 h-[calc(100vh-80px)] overflow-y-auto bg-white">
          <NavLink to="/" onClick={() => setIsOpen(false)} className={mobileLinkClass}>
            <span className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-active:text-indigo-600">
                <i className="fas fa-home"></i>
              </div>
              Home
            </span>
            <i className="fas fa-chevron-right text-xs opacity-30"></i>
          </NavLink>
          <NavLink to="/features" onClick={() => setIsOpen(false)} className={mobileLinkClass}>
            <span className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <i className="fas fa-star"></i>
              </div>
              Features
            </span>
            <i className="fas fa-chevron-right text-xs opacity-30"></i>
          </NavLink>
          <NavLink to="/about" onClick={() => setIsOpen(false)} className={mobileLinkClass}>
            <span className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <i className="fas fa-info-circle"></i>
              </div>
              About
            </span>
            <i className="fas fa-chevron-right text-xs opacity-30"></i>
          </NavLink>
          
          <div className="mt-auto pb-10 space-y-4">
            <div className="h-px bg-slate-100 w-full mb-8"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center mb-6">Management Access</p>
            {user ? (
              <Link 
                to="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-3 w-full bg-indigo-600 text-white py-5 rounded-[24px] text-lg font-black shadow-2xl shadow-indigo-200 no-underline"
              >
                Go to Dashboard <i className="fas fa-arrow-right"></i>
              </Link>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-3 w-full bg-slate-900 text-white py-5 rounded-[24px] text-lg font-black shadow-2xl shadow-slate-200 no-underline"
              >
                Admin Login <i className="fas fa-shield-alt"></i>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


export default Navbar;
