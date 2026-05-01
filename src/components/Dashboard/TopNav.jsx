import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

function TopNav({ pageTitle = 'Dashboard', onMenuClick }) {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState({ customers: [], suppliers: [], items: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef(null);
  
  const [showProfile, setShowProfile] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isNotiPage = location.pathname === '/dashboard/notifications';

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (search.length < 2) {
        setSearchResults({ customers: [], suppliers: [], items: [] });
        return;
      }
      
      setIsSearching(true);
      try {
        const [
          { data: customers },
          { data: suppliers },
          { data: items }
        ] = await Promise.all([
          supabase.from('customers').select('id, name, city').ilike('name', `%${search}%`).limit(3),
          supabase.from('suppliers').select('id, name, city').ilike('name', `%${search}%`).limit(3),
          supabase.from('items').select('id, name, current_stock').ilike('name', `%${search}%`).limit(3)
        ]);

        setSearchResults({
          customers: customers || [],
          suppliers: suppliers || [],
          items: items || []
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);
        
        if (!error && count !== null) {
          setUnreadCount(count);
        }
      } catch (err) {
        console.error('Error fetching unread notifications:', err);
      }
    };

    fetchUnreadCount();

    const subscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 flex-shrink-0 relative print:hidden">
      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="absolute inset-0 z-[60] bg-white flex flex-col px-4 pt-4 animate-fadeIn">
          <div className="relative flex items-center gap-3 w-full">
            <i className={`fas ${isSearching ? 'fa-spinner fa-spin' : 'fa-search'} absolute left-0 top-1/2 -translate-y-1/2 text-slate-400`}></i>
            <input 
              autoFocus
              type="text" 
              placeholder="Search everything..."
              className="w-full bg-transparent border-none py-4 pl-8 text-base font-medium focus:ring-0 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button 
              onClick={() => { setIsMobileSearchOpen(false); setSearch(''); }}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* Mobile Dropdown Results */}
          {search.length >= 2 && (
            <div className="flex-grow overflow-y-auto mt-2 pb-4">
              {/* Customers */}
              {searchResults.customers.length > 0 && (
                <div className="mb-4">
                  <p className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Customers</p>
                  {searchResults.customers.map(c => (
                    <Link key={c.id} to={`/ledger?type=Customer&id=${c.id}`} onClick={() => { setSearch(''); setIsMobileSearchOpen(false); }} className="block px-2 py-3 border-b border-slate-50 active:bg-indigo-50">
                      <p className="text-sm font-bold text-slate-900">{c.name}</p>
                      <p className="text-[10px] text-slate-500">{c.city || 'N/A'}</p>
                    </Link>
                  ))}
                </div>
              )}
              {/* Suppliers */}
              {searchResults.suppliers.length > 0 && (
                <div className="mb-4">
                  <p className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Suppliers</p>
                  {searchResults.suppliers.map(s => (
                    <Link key={s.id} to={`/ledger?type=Supplier&id=${s.id}`} onClick={() => { setSearch(''); setIsMobileSearchOpen(false); }} className="block px-2 py-3 border-b border-slate-50 active:bg-emerald-50">
                      <p className="text-sm font-bold text-slate-900">{s.name}</p>
                      <p className="text-[10px] text-slate-500">{s.city || 'N/A'}</p>
                    </Link>
                  ))}
                </div>
              )}
              {/* Items */}
              {searchResults.items.length > 0 && (
                <div className="mb-4">
                  <p className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Items</p>
                  {searchResults.items.map(i => (
                    <Link key={i.id} to="/items" onClick={() => { setSearch(''); setIsMobileSearchOpen(false); }} className="block px-2 py-3 border-b border-slate-50 active:bg-violet-50">
                      <p className="text-sm font-bold text-slate-900">{i.name}</p>
                      <p className="text-[10px] text-slate-500">In Stock: {i.current_stock}</p>
                    </Link>
                  ))}
                </div>
              )}
              {searchResults.customers.length === 0 && searchResults.suppliers.length === 0 && searchResults.items.length === 0 && !isSearching && (
                <div className="p-4 text-center text-slate-500 text-sm font-medium">No matches found</div>
              )}
            </div>
          )}
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

      <div className="flex-grow max-w-xl px-4 md:px-12 hidden md:block" ref={searchRef}>
        <div className="relative group">
          <i className={`fas ${isSearching ? 'fa-spinner fa-spin' : 'fa-search'} absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors`}></i>
          <input 
            type="text" 
            placeholder="Search customers, suppliers, items..."
            className="w-full bg-slate-100 border-none rounded-2xl py-2.5 pl-12 pr-6 text-sm focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          {/* Dropdown Results */}
          {search.length >= 2 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-[100] max-h-[400px] overflow-y-auto animate-fadeIn">
              {/* Customers */}
              {searchResults.customers.length > 0 && (
                <div className="mb-2">
                  <p className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Customers</p>
                  {searchResults.customers.map(c => (
                    <Link key={c.id} to={`/ledger?type=Customer&id=${c.id}`} onClick={() => setSearch('')} className="block px-4 py-2 hover:bg-indigo-50 transition-colors">
                      <p className="text-sm font-bold text-slate-900">{c.name}</p>
                      <p className="text-[10px] text-slate-500">{c.city || 'N/A'}</p>
                    </Link>
                  ))}
                </div>
              )}
              {/* Suppliers */}
              {searchResults.suppliers.length > 0 && (
                <div className="mb-2">
                  <p className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Suppliers</p>
                  {searchResults.suppliers.map(s => (
                    <Link key={s.id} to={`/ledger?type=Supplier&id=${s.id}`} onClick={() => setSearch('')} className="block px-4 py-2 hover:bg-emerald-50 transition-colors">
                      <p className="text-sm font-bold text-slate-900">{s.name}</p>
                      <p className="text-[10px] text-slate-500">{s.city || 'N/A'}</p>
                    </Link>
                  ))}
                </div>
              )}
              {/* Items */}
              {searchResults.items.length > 0 && (
                <div>
                  <p className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Items</p>
                  {searchResults.items.map(i => (
                    <Link key={i.id} to="/items" onClick={() => setSearch('')} className="block px-4 py-2 hover:bg-violet-50 transition-colors">
                      <p className="text-sm font-bold text-slate-900">{i.name}</p>
                      <p className="text-[10px] text-slate-500">In Stock: {i.current_stock}</p>
                    </Link>
                  ))}
                </div>
              )}
              {searchResults.customers.length === 0 && searchResults.suppliers.length === 0 && searchResults.items.length === 0 && !isSearching && (
                <div className="p-4 text-center text-slate-500 text-sm font-medium">No matches found</div>
              )}
            </div>
          )}
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
          {!isNotiPage && unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-black text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
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
