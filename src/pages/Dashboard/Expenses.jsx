import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import DeleteConfirmModal from '../../components/Dashboard/DeleteConfirmModal';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

function Expenses() {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]); // Start of month
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    expense_type: 'Utilities',
    amount: '',
    description: ''
  });

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', startDate)
        .lte('expense_date', endDate)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      toast.error('Error fetching expenses: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const resetForm = () => {
    setFormData({
      expense_date: new Date().toISOString().split('T')[0],
      expense_type: 'Utilities',
      amount: '',
      description: ''
    });
    setSelectedExpenseId(null);
  };

  const handleEdit = (exp) => {
    setModalMode('edit');
    setSelectedExpenseId(exp.id);
    setFormData({
      expense_date: exp.expense_date,
      expense_type: exp.expense_type,
      amount: exp.amount,
      description: exp.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        expense_date: formData.expense_date,
        expense_type: formData.expense_type,
        amount: parseFloat(formData.amount),
        description: formData.description
      };

      if (modalMode === 'add') {
        const { error } = await supabase.from('expenses').insert([payload]);
        if (error) throw error;
        toast.success('Expense recorded successfully!');
      } else {
        const { error } = await supabase
          .from('expenses')
          .update(payload)
          .eq('id', selectedExpenseId);
        if (error) throw error;
        toast.success('Expense updated successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchExpenses();
    } catch (error) {
      toast.error('Error saving expense: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteModal.id;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Expense deleted successfully');
      fetchExpenses();
    } catch (error) {
      toast.error('Error deleting expense: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(exp => 
    exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.expense_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSpending = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <DashboardLayout pageTitle="Expenses">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10 no-print">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-3">
            <i className="fas fa-money-bill-wave text-rose-600"></i> Expenses
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Track and manage your business spending</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => window.print()}
            className="bg-white text-slate-600 px-6 py-4 md:py-3 rounded-2xl font-bold border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            Print
          </button>
          <button 
            onClick={() => { resetForm(); setModalMode('add'); setShowModal(true); }}
            className="bg-rose-600 text-white px-6 py-4 md:py-3 rounded-2xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2"
          >
            New Expense
          </button>
        </div>
      </div>

      {/* Stats and Filter Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 md:mb-8 no-print">
        <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border-l-8 border-rose-600 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Spending</p>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">₨ {totalSpending.toLocaleString()}</h2>
        </div>
        
        <div className="lg:col-span-2 bg-white p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm flex items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-rose-600/30 focus:outline-none transition-all"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-rose-600/30 focus:outline-none transition-all"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-6 md:mb-8 no-print text-center">
        <div className="relative group text-left">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Search description..."
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm md:text-base font-medium focus:border-rose-600/30 focus:outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-10 min-h-[400px] relative">
        <div className="p-5 md:p-6 border-b border-slate-50 flex justify-between items-center no-print bg-slate-50/30">
          <h3 className="font-bold text-slate-900 tracking-tight text-base md:text-lg">Expenses History</h3>
          <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {filteredExpenses.length} Records
          </span>
        </div>

        {/* Print Header (Visible only during printing) */}
        <div className="hidden print-block p-8 border-b-2 border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Expense Report</h1>
              <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">
                Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-black text-slate-900 uppercase">Faran Traders</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase italic">Wazirabad Sohdra, Punjab</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 no-print">
            <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse print-table">
              <thead className="hidden md:table-header-group bg-slate-50 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Description & Category</th>
                  <th className="px-8 py-5 text-right">Amount</th>
                  <th className="px-8 py-5 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 flex flex-col md:table-row-group">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-medium italic">
                      No expenses found in this range...
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors group flex flex-col md:table-row p-4 md:p-0 border-b md:border-b-0 border-slate-50">
                      <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center md:items-start border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</span>
                        <div className="text-slate-500 font-black text-xs md:text-sm">
                          {new Date(exp.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </div>
                      </td>

                      <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</span>
                        <div className="text-right md:text-left">
                          <div className="font-black text-slate-900 text-sm">{exp.description}</div>
                          <div className="mt-1">
                            <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded uppercase tracking-widest">{exp.expense_type}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center md:text-right border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
                        <div className="font-black text-rose-600 text-base md:text-sm bg-rose-50 md:bg-transparent px-3 py-1 md:px-0 rounded-lg text-right">₨ {parseFloat(exp.amount).toLocaleString()}</div>
                      </td>

                      <td className="px-0 md:px-8 py-4 md:py-5 md:table-cell border-none no-print text-right">
                        <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(exp)}
                            className="flex-grow md:flex-grow-0 h-11 md:h-9 px-5 md:px-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 border border-slate-100 font-black text-[10px] uppercase tracking-wider"
                          >
                            <i className="fas fa-edit text-[10px]"></i> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(exp.id)}
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
              {/* Table Footer for Print */}
              <tfoot className="hidden print-table-footer">
                <tr className="border-t-2 border-slate-900 bg-slate-50">
                  <td colSpan="2" className="px-8 py-4 text-right font-black text-slate-900 uppercase tracking-widest">Total Expenses:</td>
                  <td className="px-8 py-4 text-right font-black text-rose-600 text-lg">₨ {totalSpending.toLocaleString()}</td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fadeIn no-print">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-slideUp max-h-[90vh] overflow-y-auto">
            <div className={`px-6 md:px-10 py-5 md:py-6 border-b border-slate-50 flex justify-between items-center ${modalMode === 'add' ? 'bg-rose-50/50' : 'bg-indigo-50/50'}`}>
              <h2 className="text-lg md:text-xl font-black text-slate-900">{modalMode === 'add' ? 'Add New Expense' : 'Edit Expense'}</h2>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-4 md:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-rose-600/30 focus:outline-none transition-all"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-rose-600/30 focus:outline-none transition-all appearance-none cursor-pointer"
                    value={formData.expense_type}
                    onChange={(e) => setFormData({...formData, expense_type: e.target.value})}
                  >
                    <option value="Utilities">Utilities</option>
                    <option value="Rent">Rent</option>
                    <option value="Salary">Salary/Labor</option>
                    <option value="Tea/Food">Tea/Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Amount (₨)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-xl font-black text-rose-600 focus:bg-white focus:border-rose-600/30 focus:outline-none transition-all"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-rose-600/30 focus:outline-none transition-all"
                  rows="3"
                  placeholder="What was this for?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-white shadow-xl transition-all flex items-center justify-center gap-2 ${modalMode === 'add' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
                >
                  {saving && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {modalMode === 'add' ? 'Save Expense' : 'Update Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record? This will permanently remove it from your financials."
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        
        @page { size: A4; margin: 10mm; }
        @media print {
          /* Hide EVERYTHING that is not needed */
          .no-print, nav, aside, header, .sidebar, .top-navbar, [class*="Sidebar"], [class*="Navbar"], .no-print * { 
            display: none !important; 
          }
          
          /* Force header to show even if hidden on mobile */
          .print-table thead, thead.hidden { 
            display: table-header-group !important; 
          }

          /* Hide the last column (Actions) */
          .print-table th:last-child, 
          .print-table td:last-child {
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
          .rounded-[32px] { border-radius: 0 !important; }
          .shadow-sm { box-shadow: none !important; }
          
          .print-block { display: block !important; }
          .print-table-footer { display: table-footer-group !important; }
          
          .print-table { width: 100% !important; border-collapse: collapse !important; display: table !important; }
          .print-table tbody { display: table-row-group !important; }
          .print-table tr { display: table-row !important; border-bottom: 1px solid #e2e8f0 !important; page-break-inside: avoid; }
          .print-table td, .print-table th { 
            display: table-cell !important;
            border: 1px solid #e2e8f0 !important; 
            padding: 8px 12px !important;
            font-size: 11px !important;
            background: transparent !important;
            vertical-align: middle !important;
          }

          .print-table th { font-weight: bold !important; background: #f8fafc !important; }
          .print-table td:last-child { border-right: 1px solid #e2e8f0 !important; }
          
          .text-right { text-align: right !important; }

          /* Hide mobile labels in print */
          .md\:hidden, [class*="md:hidden"] { 
            display: none !important; 
          }

          .min-h-[400px] { min-height: auto !important; }
          .text-rose-600 { color: #e11d48 !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}

export default Expenses;
