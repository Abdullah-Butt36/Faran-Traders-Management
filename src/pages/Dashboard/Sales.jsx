import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import DeleteConfirmModal from '../../components/Dashboard/DeleteConfirmModal';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

function Sales() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCustomer, setSelectedCustomer] = useState('0');
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch customers for filter
      const { data: custData } = await supabase.from('customers').select('id, name');
      setCustomers(custData || []);

      // Fetch sales with items
      let query = supabase
        .from('sales')
        .select(`
          *,
          customers(name),
          sale_items(
            quantity,
            items(name)
          )
        `)
        .gte('sale_date', startDate)
        .lte('sale_date', endDate)
        .order('sale_date', { ascending: false });

      if (selectedCustomer !== '0') {
        query = query.eq('customer_id', selectedCustomer);
      }

      const { data: salesData, error } = await query;
      if (error) throw error;
      setSales(salesData || []);
    } catch (error) {
      toast.error('Error fetching sales: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, selectedCustomer]);

  const handleDeleteClick = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteModal.id;
    try {
      setLoading(true);

      // 1. Fetch sale items first to know what to restore
      const { data: itemsToRestore, error: fetchErr } = await supabase
        .from('sale_items')
        .select('item_id, quantity')
        .eq('sale_id', id);

      if (fetchErr) throw fetchErr;

      // 2. Restore stock for each item
      if (itemsToRestore && itemsToRestore.length > 0) {
        for (const item of itemsToRestore) {
          // Get current stock
          const { data: currentItem } = await supabase
            .from('items')
            .select('current_stock')
            .eq('id', item.item_id)
            .single();

          if (currentItem) {
            const restoredStock = parseFloat(currentItem.current_stock) + parseFloat(item.quantity);
            await supabase
              .from('items')
              .update({ current_stock: restoredStock })
              .eq('id', item.item_id);
          }
        }
      }

      // 3. Fetch sale details to revert customer balance and ledger
      const { data: saleToDel } = await supabase.from('sales').select('customer_id, balance, invoice_no').eq('id', id).single();

      if (saleToDel) {
        // Revert Customer Balance
        if (saleToDel.customer_id && saleToDel.balance) {
          const { data: customer } = await supabase.from('customers').select('current_balance').eq('id', saleToDel.customer_id).single();
          if (customer) {
            const revertedBalance = (parseFloat(customer.current_balance) || 0) - parseFloat(saleToDel.balance);
            await supabase.from('customers').update({ current_balance: revertedBalance }).eq('id', saleToDel.customer_id);
          }
        }
        
        // Delete Ledger Entries
        if (saleToDel.invoice_no) {
          await supabase.from('transactions').delete().eq('invoice_no', saleToDel.invoice_no);
        }
      }

      // 4. Now delete the sale (sale_items will be deleted automatically due to CASCADE)
      const { error: deleteErr } = await supabase.from('sales').delete().eq('id', id);
      if (deleteErr) throw deleteErr;

      toast.success('Invoice deleted and stock restored!');
      setDeleteModal({ isOpen: false, id: null });
      fetchData();
    } catch (error) {
      toast.error('Error during deletion: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Sales">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-3">
            <i className="fas fa-shopping-cart text-indigo-600"></i> Sales
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Manage and track your sales invoices</p>
        </div>
        <button 
          onClick={() => navigate('/sale-form')}
          className="bg-indigo-600 text-white px-6 py-4 md:py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 w-full md:w-auto uppercase tracking-wider"
        >
          <i className="fas fa-plus text-sm"></i> New Sale
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm mb-6 md:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="space-y-2 text-center md:text-left">
            <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">From Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">To Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2 text-center md:text-left sm:col-span-2 lg:col-span-1">
            <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Customer</label>
            <select 
              className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all appearance-none cursor-pointer"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="0">All Customers</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-10 min-h-[400px] relative">
        <div className="p-5 md:p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-slate-900 tracking-tight text-base md:text-lg">Sales History</h3>
          <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {sales.length} Invoices
          </span>
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
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5">Products</th>
                  <th className="px-8 py-5">Financials</th>
                  <th className="px-8 py-5 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 flex flex-col md:table-row-group">
                {sales.length === 0 ? (
                  <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-400 italic font-medium">No sales records found...</td></tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group flex flex-col md:table-row p-4 md:p-0 border-b md:border-b-0 border-slate-50">
                      <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center md:items-start border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice</span>
                        <div>
                          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] md:text-xs font-black uppercase tracking-wider">
                            {sale.invoice_no}
                          </span>
                          <div className="mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            {new Date(sale.sale_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                          </div>
                        </div>
                      </td>

                      <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</span>
                        <div className="text-right md:text-left">
                          <div className="font-black text-slate-900 text-sm md:text-sm">{sale.customers?.name || 'Cash Sale'}</div>
                        </div>
                      </td>

                      <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Products</span>
                        <div className="flex flex-wrap gap-1 md:max-w-[200px] justify-end md:justify-start">
                          {sale.sale_items?.map((si, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight">
                              {si.items?.name} <span className="text-indigo-600 ml-1">x{si.quantity}</span>
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-start border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Financials</span>
                        <div className="text-right md:text-left space-y-1">
                          <div className="flex items-center md:justify-start gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase w-10">Total:</span>
                            <span className="font-black text-slate-900 text-sm">₨ {parseFloat(sale.total_amount).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center md:justify-start gap-2 text-emerald-600">
                            <span className="text-[10px] font-bold opacity-60 uppercase w-10">Paid:</span>
                            <span className="font-black text-xs">₨ {parseFloat(sale.payment_received).toLocaleString()}</span>
                          </div>
                          {parseFloat(sale.balance) > 0 && (
                            <div className="flex items-center md:justify-start gap-2 text-rose-500">
                              <span className="text-[10px] font-bold opacity-60 uppercase w-10">Bal:</span>
                              <span className="font-black text-xs bg-rose-50 px-1.5 py-0.5 rounded">₨ {parseFloat(sale.balance).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-0 md:px-8 py-4 md:py-5 md:table-cell border-none no-print">
                        <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => navigate(`/sales/print/${sale.id}`)}
                            className="flex-grow md:flex-grow-0 h-11 md:h-9 px-4 md:px-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-200 font-black text-[10px] uppercase tracking-wider"
                          >
                            <i className="fas fa-print text-[10px]"></i> Print
                          </button>
                          <button 
                            onClick={() => navigate(`/edit-sale/${sale.id}`)}
                            className="flex-grow md:flex-grow-0 h-11 md:h-9 px-4 md:px-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-indigo-100 font-black text-[10px] uppercase tracking-wider"
                          >
                            <i className="fas fa-edit text-[10px]"></i> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(sale.id)}
                            className="flex-grow md:flex-grow-0 h-11 md:h-9 px-4 md:px-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-rose-100 font-black text-[10px] uppercase tracking-wider"
                            title="Delete"
                          >
                            <i className="fas fa-trash-alt text-[10px]"></i> Delete
                          </button>
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
        title="Delete Sale Invoice"
        message="Are you sure you want to delete this sale invoice? This action will permanently remove the record and may affect your inventory and ledger balances."
      />
    </DashboardLayout>
  );
}

export default Sales;
