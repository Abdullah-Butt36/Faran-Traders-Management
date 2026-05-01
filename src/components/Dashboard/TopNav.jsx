import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function TopNav({ pageTitle = 'Dashboard', onMenuClick }) {
  const [search, setSearch] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isNotiPage = location.pathname === '/dashboard/notifications';

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 flex-shrink-0 relative print:hidden">
      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="absolute inset-0 z-[60] bg-white flex items-center px-4 animate-fadeIn">
          <div className="relative flex-grow flex items-center gap-3">
            <i className="fas fa-search absolute left-0 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              autoFocus
              type="text" 
              placeholder="Search everything..."
              className="w-full bg-transparent border-none py-4 pl-8 text-base font-medium focus:ring-0 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button 
              onClick={() => setIsMobileSearchOpen(false)}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-500 hover:text-indigo-600 bg-slate-50 rounded-xl transition-all"
        >
          <i className="fas fa-bars-staggered"></i>
        </button>
        <div className="flex items-center gap-2 md:gap-6">
          <h1 className="text-base md:text-xl font-bold text-slate-900 truncate max-w-[100px] md:max-w-none">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex-grow max-w-xl px-4 md:px-12 hidden md:block">
        <div className="relative group">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Search..."
            className="w-full bg-slate-100 border-none rounded-2xl py-2.5 pl-12 pr-6 text-sm focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        {/* Mobile Search Toggle */}
        <button 
          onClick={() => setIsMobileSearchOpen(true)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <i className="fas fa-search text-lg"></i>
        </button>

        {/* Home Icon */}
        <Link 
          to="/"
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 bg-slate-50 md:bg-transparent rounded-xl md:rounded-none transition-all"
          title="Back to Landing Page"
        >
          <i className="fas fa-home text-lg md:text-xl"></i>
        </Link>

        {/* Notification Bell */}
        <Link 
          to={isNotiPage ? "/dashboard" : "/dashboard/notifications"}
          className={`relative w-10 h-10 flex items-center justify-center transition-all group rounded-xl ${isNotiPage ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-indigo-600 bg-slate-50 md:bg-transparent md:rounded-none'}`}
          title={isNotiPage ? "Back to Dashboard" : "View Notifications"}
        >
          <i className={`fas ${isNotiPage ? 'fa-arrow-left' : 'fa-bell'} text-lg md:text-xl group-hover:shake`}></i>
          {!isNotiPage && (
            <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-black text-white">2</span>
          )}
        </Link>

        {/* Profile Section */}
        <div className="relative">
          <div 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 md:gap-3 pl-2 md:pl-6 border-l border-slate-100 group cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-none truncate max-w-[100px]">{user?.user_metadata?.full_name || 'Admin User'}</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">Administrator</p>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>

          {/* Profile Dropdown */}
          {showProfile && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowProfile(false)}
              ></div>
              <div className="absolute right-0 mt-4 w-64 bg-white rounded-[24px] md:rounded-[32px] shadow-2xl border border-slate-100 py-6 px-6 z-50 animate-slideDown">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-50">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-black text-slate-900 truncate">{user?.user_metadata?.full_name || 'Administrator'}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Link to="/profile" onClick={() => setShowProfile(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all font-bold text-sm">
                    My Profile
                  </Link>
                  <Link to="/security" onClick={() => setShowProfile(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all font-bold text-sm">
                    Security
                  </Link>
                  <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-black text-sm mt-4 border-t border-slate-50 pt-6"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
      `}</style>
    </header>
  );
}

export default TopNav;
