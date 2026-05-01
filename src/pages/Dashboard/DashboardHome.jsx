import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function DashboardHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Receivable', val: '₨ 0', icon: 'fa-arrow-down', color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Money to Receive' },
    { label: 'Total Payable', val: '₨ 0', icon: 'fa-arrow-up', color: 'text-rose-600', bg: 'bg-rose-50', desc: 'Money to Pay' },
    { label: 'Net Cash', val: '₨ 0', icon: 'fa-wallet', color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Net Balance' },
    { label: 'Stock Value', val: '₨ 0', icon: 'fa-box', color: 'text-violet-600', bg: 'bg-violet-50', desc: 'Inventory Asset' }
  ]);

  const [topCustomers, setTopCustomers] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Stats
      const { data: custData } = await supabase.from('customers').select('current_balance');
      const { data: suppData } = await supabase.from('suppliers').select('current_balance');
      
      const totalRec = (custData || []).reduce((sum, c) => sum + parseFloat(c.current_balance || 0), 0);
      const totalPay = (suppData || []).reduce((sum, s) => sum + parseFloat(s.current_balance || 0), 0);

      // 2. Fetch Stock Alerts
      const { data: itemsData } = await supabase.from('items').select('id, current_stock, min_stock_alert');
      const lowStockCount = (itemsData || []).filter(item => 
        parseFloat(item.current_stock || 0) <= parseFloat(item.min_stock_alert || 10)
      ).length;

      setStats([
        { label: 'Total Receivable', val: `₨ ${totalRec.toLocaleString()}`, icon: 'fa-arrow-down', color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Money to Receive' },
        { label: 'Total Payable', val: `₨ ${totalPay.toLocaleString()}`, icon: 'fa-arrow-up', color: 'text-rose-600', bg: 'bg-rose-50', desc: 'Money to Pay' },
        { label: 'Net Balance', val: `₨ ${(totalRec - totalPay).toLocaleString()}`, icon: 'fa-wallet', color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Receivable - Payable' },
        { label: 'Stock Alerts', val: `${lowStockCount} Items`, icon: 'fa-bell', color: lowStockCount > 0 ? 'text-rose-600' : 'text-violet-600', bg: lowStockCount > 0 ? 'bg-rose-50' : 'bg-violet-50', desc: lowStockCount > 0 ? 'Urgent Action Needed' : 'All Levels Healthy' }
      ]);

      // 2. Fetch Top Customer (Highest Balance, > 0)
      const { data: topCust } = await supabase
        .from('customers')
        .select('*')
        .gt('current_balance', 0)
        .order('current_balance', { ascending: false })
        .limit(1);
      setTopCustomers(topCust || []);

      // 3. Fetch Top Supplier (Highest Balance, > 0)
      const { data: topSupp } = await supabase
        .from('suppliers')
        .select('*')
        .gt('current_balance', 0)
        .order('current_balance', { ascending: false })
        .limit(1);
      setTopSuppliers(topSupp || []);

      // 4. Fetch Low Stock Items
      const { data: lowItems } = await supabase
        .from('items')
        .select('*')
        .gt('current_stock', 0)
        .lte('current_stock', 10) // or compare with min_stock_alert if possible in SQL
        .limit(5);
      setLowStock(lowItems || []);

      // 5. Fetch Out of Stock Items
      const { data: outItems } = await supabase
        .from('items')
        .select('*')
        .lte('current_stock', 0)
        .limit(5);
      setOutOfStock(outItems || []);

    } catch (error) {
      toast.error('Error loading dashboard: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardLayout pageTitle="Dashboard">
      {/* Welcome Section */}
      <div className="mb-8 md:mb-10 text-center md:text-left px-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-indigo-600 underline decoration-indigo-100 underline-offset-8">{user?.user_metadata?.full_name || 'Admin'}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-sm md:text-lg">Faran Traders Inventory Management System</p>
        </div>
        <button
          onClick={fetchData}
          className="bg-white border border-slate-100 p-3 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm flex items-center justify-center"
          title="Refresh Data"
        >
          <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10 px-2 sm:px-0">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 md:p-7 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
            <div className="flex justify-between items-start mb-5">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center text-xl`}>
                <i className={`fas ${stat.icon}`}></i>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">Live</span>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3 truncate tracking-tighter">{stat.val}</h3>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${stat.color.replace('text', 'bg')}`}></div>
              <p className={`text-[10px] md:text-xs font-bold ${stat.color}`}>{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 px-2 sm:px-0 mb-10">
        {/* Top Customers */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
          <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <h3 className="font-black text-slate-900 flex items-center gap-3 text-base md:text-lg uppercase tracking-tight">
              <i className="fas fa-user-star text-indigo-600"></i> Top Customer
            </h3>
            <Link to="/customers" className="bg-white border border-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black text-indigo-600 hover:bg-indigo-50 transition-all uppercase tracking-widest shadow-sm">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="hidden md:table-header-group bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Location</th>
                  <th className="px-8 py-4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 flex flex-col md:table-row-group">
                {topCustomers.length === 0 ? (
                  <tr><td colSpan="3" className="px-8 py-10 text-center text-slate-400 font-medium italic">No customer data found</td></tr>
                ) : (
                  topCustomers.map((row, i) => (
                    <tr key={i} className="hover:bg-indigo-50/30 transition-colors flex flex-col md:table-row p-4 md:p-0">
                      <td className="px-0 md:px-8 py-1 md:py-5 flex justify-between items-center md:table-cell border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</span>
                        <div className="font-black text-slate-900">{row.name}</div>
                      </td>
                      <td className="px-0 md:px-8 py-1 md:py-5 flex justify-between items-center md:table-cell border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                        <div className="text-slate-500 font-bold">{row.city || 'N/A'}</div>
                      </td>
                      <td className="px-0 md:px-8 py-1 md:py-5 flex justify-between items-center md:table-cell md:text-right border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
                        <span className="text-rose-600 font-black bg-rose-50 px-3 py-1 rounded-full text-[10px] md:text-xs">₨ {parseFloat(row.current_balance).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
          <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <h3 className="font-black text-slate-900 flex items-center gap-3 text-base md:text-lg uppercase tracking-tight">
              <i className="fas fa-truck-loading text-emerald-600"></i> Top Supplier
            </h3>
            <Link to="/suppliers" className="bg-white border border-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black text-emerald-600 hover:bg-emerald-50 transition-all uppercase tracking-widest shadow-sm">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="hidden md:table-header-group bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Supplier</th>
                  <th className="px-8 py-4">Location</th>
                  <th className="px-8 py-4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 flex flex-col md:table-row-group">
                {topSuppliers.length === 0 ? (
                  <tr><td colSpan="3" className="px-8 py-10 text-center text-slate-400 font-medium italic">No supplier data found</td></tr>
                ) : (
                  topSuppliers.map((row, i) => (
                    <tr key={i} className="hover:bg-emerald-50/30 transition-colors flex flex-col md:table-row p-4 md:p-0">
                      <td className="px-0 md:px-8 py-1 md:py-5 flex justify-between items-center md:table-cell border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</span>
                        <div className="font-black text-slate-900">{row.name}</div>
                      </td>
                      <td className="px-0 md:px-8 py-1 md:py-5 flex justify-between items-center md:table-cell border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                        <div className="text-slate-500 font-bold">{row.city || 'N/A'}</div>
                      </td>
                      <td className="px-0 md:px-8 py-1 md:py-5 flex justify-between items-center md:table-cell md:text-right border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
                        <span className="text-rose-600 font-black bg-rose-50 px-3 py-1 rounded-full text-[10px] md:text-xs">₨ {parseFloat(row.current_balance).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
          <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <h3 className="font-black text-slate-900 flex items-center gap-3 text-base md:text-lg uppercase tracking-tight">
              <i className="fas fa-exclamation-triangle text-amber-500"></i> Low Stock
            </h3>
            <Link to="/items" className="bg-white border border-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black text-amber-600 hover:bg-amber-50 transition-all uppercase tracking-widest shadow-sm">Manage</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="hidden md:table-header-group bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Item Name</th>
                  <th className="px-8 py-4 text-right">In Stock</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 flex flex-col md:table-row-group">
                {lowStock.length === 0 ? (
                  <tr><td colSpan="2" className="px-8 py-10 text-center text-slate-400 font-medium italic">No low stock items</td></tr>
                ) : (
                  lowStock.map((row, i) => (
                    <tr key={i} className="hover:bg-amber-50/30 transition-colors flex flex-col md:table-row p-4 md:p-0">
                      <td className="px-0 md:px-8 py-1 md:py-5 flex justify-between items-center md:table-cell border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</span>
                        <div className="font-black text-slate-900">{row.name}</div>
                      </td>
                      <td className="px-0 md:px-8 py-1 md:py-5 flex justify-between items-center md:table-cell md:text-right border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining</span>
                        <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-black">{row.current_stock} {row.unit}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Out of Stock Items */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
          <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
            <h3 className="font-black text-slate-900 flex items-center gap-3 text-base md:text-lg uppercase tracking-tight">
              <i className="fas fa-times-circle text-rose-600"></i> Out of Stock
            </h3>
            <Link to="/items" className="bg-white border border-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black text-rose-600 hover:bg-rose-50 transition-all uppercase tracking-widest shadow-sm">Restock</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="hidden md:table-header-group bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Item Name</th>
                  <th className="px-8 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 flex flex-col md:table-row-group">
                {outOfStock.length === 0 ? (
                  <tr><td colSpan="2" className="px-8 py-10 text-center text-slate-400 font-medium italic">No items out of stock</td></tr>
                ) : (
                  outOfStock.map((row, i) => (
                    <tr key={i} className="hover:bg-rose-50/30 transition-colors flex flex-col md:table-row p-4 md:p-0">
                      <td className="px-0 md:px-8 py-1 md:py-5 flex justify-between items-center md:table-cell border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</span>
                        <div className="font-black text-slate-900">{row.name}</div>
                      </td>
                      <td className="px-0 md:px-8 py-1 md:py-5 flex justify-between items-center md:table-cell md:text-right border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                        <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest">Empty</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardHome;


