import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

function StockReport() {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedItem, setSelectedItem] = useState('');
  const [reportData, setReportData] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all items for the dropdown and report
      const { data: itemsData, error: itemsErr } = await supabase
        .from('items')
        .select('id, name, unit, current_stock');
      
      if (itemsErr) throw itemsErr;
      setAllItems(itemsData || []);

      // Fetch all-time purchases and sales to calculate movements
      // Note: In a large DB, this should be done via RPC/Functions
      const [ {data: pData}, {data: sData} ] = await Promise.all([
        supabase.from('purchase_items').select('item_id, quantity, purchases(purchase_date)'),
        supabase.from('sale_items').select('item_id, quantity, sales(sale_date)')
      ]);

      const processed = itemsData.map(item => {
        // All-time totals to derive opening stock
        // Note: min_stock is not in DB, using 10 as default
        const min_stock = 10; 
        const totalIn = (pData || []).filter(p => p.item_id === item.id).reduce((sum, p) => sum + parseFloat(p.quantity), 0);
        const totalOut = (sData || []).filter(s => s.item_id === item.id).reduce((sum, s) => sum + parseFloat(s.quantity), 0);
        
        // Movement in selected period
        const periodIn = (pData || []).filter(p => 
          p.item_id === item.id && 
          p.purchases.purchase_date >= startDate && 
          p.purchases.purchase_date <= endDate
        ).reduce((sum, p) => sum + parseFloat(p.quantity), 0);

        const periodOut = (sData || []).filter(s => 
          s.item_id === item.id && 
          s.sales.sale_date >= startDate && 
          s.sales.sale_date <= endDate
        ).reduce((sum, s) => sum + parseFloat(s.quantity), 0);

        // Opening Stock at startDate = Current - (AllTimeIn after startDate) + (AllTimeOut after startDate)
        // Simplified for this version: Opening = Current - PeriodIn + PeriodOut (Assumes report is for current state)
        const opening = parseFloat(item.current_stock) - periodIn + periodOut;

        return {
          ...item,
          opening,
          in: periodIn,
          out: periodOut,
          current: item.current_stock
        };
      });

      setReportData(processed);
    } catch (error) {
      toast.error('Error fetching report data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const getStatus = (current, min) => {
    const minVal = min || 10;
    if (current <= 0) return { label: 'Empty', class: 'bg-rose-100 text-rose-600' };
    if (current <= minVal) return { label: 'Low', class: 'bg-amber-100 text-amber-600' };
    return { label: 'Healthy', class: 'bg-emerald-100 text-emerald-600' };
  };

  return (
    <DashboardLayout pageTitle="Stock Report">
      {/* Print Header (Only visible in print) */}
      <div className="hidden print:block text-center mb-10 border-b-2 border-emerald-600 pb-4">
        <h1 className="text-3xl font-black text-emerald-900">FARAN TRADERS</h1>
        <h2 className="text-xl font-bold text-slate-500 mt-1">Stock Movement Report</h2>
        <p className="text-sm font-medium text-slate-400 mt-1">Period: {startDate} to {endDate}</p>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10 no-print">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-emerald-900 flex items-center justify-center md:justify-start gap-3">
            <i className="fas fa-file-invoice"></i> Stock Movement
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Detailed overview of purchases, sales, and levels</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-white text-emerald-700 px-6 py-4 md:py-3 rounded-2xl font-bold border border-emerald-100 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 w-full md:w-auto shadow-sm"
        >
          <i className="fas fa-print text-sm"></i> Print Report
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border-t-4 border-emerald-500 shadow-sm mb-6 md:mb-8 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name</label>
            <select 
              className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-600/30 focus:outline-none transition-all"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              <option value="">All Items</option>
              {allItems.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-600/30 focus:outline-none transition-all"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-600/30 focus:outline-none transition-all"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setSelectedItem(''); setStartDate(new Date().toISOString().split('T')[0]); setEndDate(new Date().toISOString().split('T')[0]); }}
            className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 text-slate-500 rounded-xl md:rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all h-[48px] md:h-[54px]"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="hidden md:table-header-group bg-emerald-50 text-[10px] md:text-[11px] font-black text-emerald-900/60 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Product Details</th>
                <th className="px-6 py-5 text-center">Opening</th>
                <th className="px-6 py-5 text-center">In / Out</th>
                <th className="px-8 py-5 text-center bg-slate-50/50">Current Stock</th>
                <th className="px-6 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50 flex flex-col md:table-row-group">
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center text-slate-400 italic">Calculating stock movement...</td></tr>
              ) : (
                reportData
                  .filter(item => selectedItem === '' || item.id === parseInt(selectedItem))
                  .map((item) => {
                    const status = getStatus(item.current, item.min_stock);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors flex flex-col md:table-row p-4 md:p-0 border-b md:border-b-0 border-slate-50 group">
                        <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center md:items-start border-none">
                          <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</span>
                          <div className="text-right md:text-left">
                            <div className="font-black text-slate-900 text-sm md:text-base">{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Unit: {item.unit || 'Pcs'}</div>
                          </div>
                        </td>

                        <td className="px-0 md:px-6 py-2 md:py-5 md:table-cell flex justify-between items-center md:text-center border-none">
                          <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Opening Stock</span>
                          <div className="font-bold text-slate-500 bg-slate-50 md:bg-transparent px-2 py-0.5 rounded md:px-0">{item.opening}</div>
                        </td>

                        <td className="px-0 md:px-6 py-2 md:py-5 md:table-cell flex justify-between items-center md:text-center border-none">
                          <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Movement</span>
                          <div className="flex md:flex-col items-center md:justify-center gap-3 md:gap-0">
                            <div className="font-black text-emerald-600 text-[10px] md:text-xs">+{item.in} <span className="md:hidden opacity-50">In</span></div>
                            <div className="font-black text-rose-600 text-[10px] md:text-xs">-{item.out} <span className="md:hidden opacity-50">Out</span></div>
                          </div>
                        </td>

                        <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center md:text-center bg-transparent md:bg-slate-50/30 border-none">
                          <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Balance</span>
                          <div className={`text-lg md:text-xl font-black ${item.current <= (item.min_stock || 10) ? 'text-rose-600' : 'text-emerald-900'}`}>
                            {item.current}
                          </div>
                        </td>

                        <td className="px-0 md:px-6 py-2 md:py-5 md:table-cell flex justify-between items-center md:text-center border-none">
                          <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                          <span className={`px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          /* Hide everything not needed */
          .no-print, nav, aside, header, .sidebar, .top-navbar, [class*="Sidebar"], [class*="Navbar"], .no-print * { 
            display: none !important; 
          }
          
          /* Reset layout containers */
          body, html { background: white !important; padding: 0 !important; margin: 0 !important; }
          main, .main-content, .content-wrapper { 
            margin: 0 !important; 
            padding: 0 !important; 
            width: 100% !important; 
            max-width: 100% !important;
            display: block !important;
          }

          .bg-white { box-shadow: none !important; border: none !important; }
          .rounded-[24px], .rounded-[32px] { border-radius: 0 !important; }
          .shadow-sm { box-shadow: none !important; }
          
          /* Force Table Structure in Print */
          table { width: 100% !important; border-collapse: collapse !important; display: table !important; }
          thead { display: table-header-group !important; }
          tbody { display: table-row-group !important; }
          tr { display: table-row !important; border-bottom: 1px solid #e2e8f0 !important; page-break-inside: avoid; }
          td, th { 
            display: table-cell !important;
            border: 1px solid #e2e8f0 !important; 
            padding: 8px 12px !important;
            font-size: 11px !important;
            background: transparent !important;
            vertical-align: middle !important;
          }
          th { background: #f8fafc !important; font-weight: bold !important; color: #1e293b !important; }

          /* Hide mobile labels */
          .md\:hidden, [class*="md:hidden"] { 
            display: none !important; 
          }

          .text-emerald-600 { color: #059669 !important; }
          .text-rose-600 { color: #e11d48 !important; }
          .print\:block { display: block !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}

export default StockReport;
