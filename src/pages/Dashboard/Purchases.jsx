import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import DeleteConfirmModal from '../../components/Dashboard/DeleteConfirmModal';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSupplier, setSelectedSupplier] = useState('0');
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: suppData } = await supabase.from('suppliers').select('id, name');
      setSuppliers(suppData || []);

      let query = supabase
        .from('purchases')
        .select(`
          *,
          suppliers(name),
          purchase_items(
            quantity,
            items(name)
          )
        `)
        .gte('purchase_date', startDate)
        .lte('purchase_date', endDate)
        .order('purchase_date', { ascending: false });

      if (selectedSupplier !== '0') {
        query = query.eq('supplier_id', selectedSupplier);
      }

      const { data: purchaseData, error } = await query;
      if (error) throw error;
      setPurchases(purchaseData || []);
    } catch (error) {
      toast.error('Error fetching purchases: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, selectedSupplier]);

  const handleDeleteClick = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteModal.id;
    try {
      setLoading(true);

      // 1. Fetch items to subtract from stock
      const { data: itemsToRemove, error: fetchErr } = await supabase
        .from('purchase_items')
        .select('item_id, quantity')
        .eq('purchase_id', id);

      if (fetchErr) throw fetchErr;

      // 2. Subtract stock
      if (itemsToRemove) {
        for (const item of itemsToRemove) {
          const { data: currentItem } = await supabase.from('items').select('current_stock').eq('id', item.item_id).single();
          if (currentItem) {
            const newStock = parseFloat(currentItem.current_stock) - parseFloat(item.quantity);
            await supabase.from('items').update({ current_stock: newStock }).eq('id', item.item_id);
          }
        }
      }

      // 3. Delete Purchase
      const { error: deleteErr } = await supabase.from('purchases').delete().eq('id', id);
      if (deleteErr) throw deleteErr;

      toast.success('Purchase deleted and stock adjusted');
      setDeleteModal({ isOpen: false, id: null });
      fetchData();
    } catch (error) {
      toast.error('Error deleting: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Purchases">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-3">
            <i className="fas fa-truck-loading text-indigo-600"></i> Purchases
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Track your stock arrivals and supplier payments</p>
        </div>
        <button 
          onClick={() => navigate('/purchase-form')}
          className="bg-indigo-600 text-white px-6 py-4 md:py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 w-full md:w-auto uppercase tracking-wider"
        >
          <i className="fas fa-plus text-sm"></i> New Purchase
        </button>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm mb-6 md:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="space-y-2 text-center md:text-left">
            <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">From Date</label>
            <input type="date" className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">To Date</label>
            <input type="date" className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="space-y-2 text-center md:text-left sm:col-span-2 lg:col-span-1">
            <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Supplier</label>
            <select className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all appearance-none cursor-pointer" value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
              <option value="0">All Suppliers</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-10 min-h-[400px] relative">
        <div className="p-5 md:p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-slate-900 tracking-tight text-base md:text-lg">Purchase Logs</h3>
          <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{purchases.length} Invoices</span>
        </div>

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="hidden md:table-header-group bg-slate-50 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5">Invoice</th>
                  <th className="px-8 py-5">Supplier</th>
                  <th className="px-8 py-5">Products</th>
                  <th className="px-8 py-5">Financials</th>
                  <th className="px-8 py-5 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 flex flex-col md:table-row-group">
                {purchases.length === 0 ? (
                  <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 italic font-medium">No purchase records found...</td></tr>
                ) : (
                  purchases.map((pur) => (
                    <tr key={pur.id} className="hover:bg-slate-50/50 transition-colors group flex flex-col md:table-row p-4 md:p-0 border-b md:border-b-0 border-slate-50">
                      <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center md:items-start border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice</span>
                        <div>
                          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] md:text-xs font-black uppercase tracking-wider">{pur.invoice_no}</span>
                          <div className="mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{new Date(pur.purchase_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                        </div>
                      </td>
                      <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</span>
                        <div className="font-black text-slate-900 text-sm">{pur.suppliers?.name}</div>
                      </td>
                      <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Products</span>
                        <div className="flex flex-wrap gap-1 md:max-w-[200px] justify-end md:justify-start">
                          {pur.purchase_items?.map((pi, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight">{pi.items?.name} <span className="text-indigo-600 ml-1">x{pi.quantity}</span></span>
                          ))}
                        </div>
                      </td>
                      <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-start border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Financials</span>
                        <div className="text-right md:text-left space-y-1">
                          <div className="flex items-center md:justify-start gap-2"><span className="text-[10px] font-bold text-slate-400 uppercase w-10">Total:</span><span className="font-black text-slate-900 text-sm">₨ {parseFloat(pur.total_amount).toLocaleString()}</span></div>
                          <div className="flex items-center md:justify-start gap-2 text-emerald-600"><span className="text-[10px] font-bold opacity-60 uppercase w-10">Paid:</span><span className="font-black text-xs">₨ {parseFloat(pur.payment_made).toLocaleString()}</span></div>
                          {parseFloat(pur.balance) > 0 && <div className="flex items-center md:justify-start gap-2 text-rose-500"><span className="text-[10px] font-bold opacity-60 uppercase w-10">Bal:</span><span className="font-black text-xs bg-rose-50 px-1.5 py-0.5 rounded">₨ {parseFloat(pur.balance).toLocaleString()}</span></div>}
                        </div>
                      </td>
                      <td className="px-0 md:px-8 py-4 md:py-5 md:table-cell border-none no-print">
                        <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => navigate(`/purchases/print/${pur.id}`)} className="flex-grow md:flex-grow-0 h-11 md:h-9 px-4 md:px-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-200 font-black text-[10px] uppercase tracking-wider"><i className="fas fa-print text-[10px]"></i> Print</button>
                          <button onClick={() => navigate(`/edit-purchase/${pur.id}`)} className="flex-grow md:flex-grow-0 h-11 md:h-9 px-4 md:px-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-indigo-100 font-black text-[10px] uppercase tracking-wider"><i className="fas fa-edit text-[10px]"></i> Edit</button>
                          <button onClick={() => handleDeleteClick(pur.id)} className="flex-grow md:flex-grow-0 h-11 md:h-9 px-4 md:px-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-rose-100 font-black text-[10px] uppercase tracking-wider" title="Delete"><i className="fas fa-trash-alt text-[10px]"></i> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Purchase Invoice"
        message="Are you sure you want to delete this purchase invoice? This action will permanently remove the record and may affect your inventory and ledger balances."
      />
    </DashboardLayout>
  );
}

export default Purchases;
