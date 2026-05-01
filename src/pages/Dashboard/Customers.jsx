import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import DeleteConfirmModal from '../../components/Dashboard/DeleteConfirmModal';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    type: 'Regular',
    opening_balance: 0,
    balance_type: 'debit' // 'debit' for Receivable, 'credit' for Advance
  });

  // Fetch Customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      toast.error('Error fetching customers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      city: '',
      type: 'Regular',
      opening_balance: 0,
      balance_type: 'debit'
    });
    setSelectedCustomerId(null);
  };

  const handleEdit = (customer) => {
    setModalMode('edit');
    setSelectedCustomerId(customer.id);
    
    // Determine balance type based on value
    const bal = customer.opening_balance || 0;
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      city: customer.city || '',
      type: customer.type || 'Regular',
      opening_balance: Math.abs(bal),
      balance_type: bal >= 0 ? 'debit' : 'credit'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Calculate actual opening balance value
      const actualBalance = formData.balance_type === 'debit' 
        ? parseFloat(formData.opening_balance) 
        : -parseFloat(formData.opening_balance);

      const payload = {
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        type: formData.type,
        opening_balance: actualBalance,
        current_balance: actualBalance, // Initial balance is opening balance
      };

      if (modalMode === 'add') {
        const { error } = await supabase.from('customers').insert([payload]);
        if (error) throw error;
        toast.success('Customer added successfully!');
      } else {
        const { error } = await supabase
          .from('customers')
          .update(payload)
          .eq('id', selectedCustomerId);
        if (error) throw error;
        toast.success('Customer updated successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      toast.error('Error saving customer: ' + error.message);
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
        .from('customers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      toast.error('Error deleting customer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout pageTitle="Customers">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-3">
            <i className="fas fa-users text-indigo-600"></i> Customers
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Directory of all your business clients</p>
        </div>
        <button 
          onClick={() => { resetForm(); setModalMode('add'); setShowModal(true); }}
          className="bg-indigo-600 text-white px-6 py-4 md:py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <i className="fas fa-plus text-sm"></i> Add New Customer
        </button>
      </div>

      {/* Search Section */}
      <div className="max-w-2xl mx-auto mb-6 md:mb-8 text-center">
        <div className="relative group text-left">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Search Name, Phone, or City..."
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 md:py-4 pl-14 pr-6 text-sm md:text-base font-medium focus:border-indigo-600/30 focus:outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-10 min-h-[400px] relative">
        <div className="p-5 md:p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-slate-900 tracking-tight text-base md:text-lg">Customer Directory</h3>
          <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {filteredCustomers.length} Total Customers
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
                  <th className="px-8 py-5">Name</th>
                  <th className="px-8 py-5">Contact</th>
                  <th className="px-8 py-5 text-center">Location</th>
                  <th className="px-8 py-5">Financials</th>
                  <th className="px-8 py-5 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 flex flex-col md:table-row-group">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium italic">
                      No customers found...
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors flex flex-col md:table-row p-4 md:p-0 border-b md:border-b-0 border-slate-50 group">
                      <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</span>
                        <div className="text-right md:text-left">
                          <div className="font-black text-slate-900 text-sm md:text-base">{customer.name}</div>
                          <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">{customer.type}</div>
                        </div>
                      </td>

                      <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</span>
                        <div className="text-slate-600 font-bold text-xs md:text-sm">{customer.phone || 'N/A'}</div>
                      </td>

                      <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center md:text-center border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">City</span>
                        <div className="text-slate-500 font-bold text-xs md:text-sm bg-slate-50 md:bg-transparent px-2 py-0.5 rounded md:px-0 uppercase tracking-tighter">{customer.city || 'N/A'}</div>
                      </td>

                      <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center border-none">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance Info</span>
                        <div className="text-right md:text-left">
                          {(customer.current_balance || 0) > 0 ? (
                            <div className="flex flex-col md:items-start items-end">
                              <span className="text-rose-600 font-black text-base md:text-base">₨ {customer.current_balance.toLocaleString()}</span>
                              <span className="text-[9px] font-black uppercase text-rose-400">Receivable</span>
                            </div>
                          ) : (customer.current_balance || 0) < 0 ? (
                            <div className="flex flex-col md:items-start items-end">
                              <span className="text-emerald-600 font-black text-base md:text-base">₨ {Math.abs(customer.current_balance).toLocaleString()}</span>
                              <span className="text-[9px] font-black uppercase text-emerald-400">Advance</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-black text-xs md:text-sm italic">Clear Balance</span>
                          )}
                        </div>
                      </td>

                      <td className="px-0 md:px-8 py-4 md:py-5 md:table-cell border-none no-print">
                        <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => navigate(`/ledger?type=Customer&id=${customer.id}`)}
                            className="flex-grow md:flex-grow-0 h-11 md:h-9 px-4 md:px-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-200 font-black text-[10px] uppercase tracking-wider"
                          >
                            <i className="fas fa-book text-[10px]"></i> Ledger
                          </button>
                          <button 
                            onClick={() => handleEdit(customer)}
                            className="flex-grow md:flex-grow-0 h-11 md:h-9 px-4 md:px-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 border border-slate-200 font-black text-[10px] uppercase tracking-wider"
                          >
                            <i className="fas fa-edit text-[10px]"></i> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(customer.id)}
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

      {/* Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-[24px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-slideUp">
            <div className="px-6 py-6 md:px-10 md:py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">{modalMode === 'add' ? 'Add Customer' : 'Edit Customer'}</h2>
                <p className="text-xs md:text-sm font-medium text-slate-500 mt-1">Fill in the information below</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-4 md:space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Full Name *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 md:px-5 md:py-4 bg-slate-100 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all"
                  placeholder="Enter customer name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 md:px-5 md:py-4 bg-slate-100 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all"
                    placeholder="0300-0000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">City</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 md:px-5 md:py-4 bg-slate-100 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all"
                    placeholder="Lahore"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Customer Type</label>
                  <select 
                    className="w-full px-4 py-3 md:px-5 md:py-4 bg-slate-100 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all appearance-none cursor-pointer"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Regular">Regular</option>
                    <option value="One-time">One-time</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Opening Balance</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      className="flex-grow px-4 py-3 md:px-5 md:py-4 bg-slate-100 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all"
                      placeholder="0.00"
                      value={formData.opening_balance}
                      onChange={(e) => setFormData({...formData, opening_balance: e.target.value})}
                    />
                    <select 
                      className="w-24 md:w-28 px-2 md:px-4 py-3 md:py-4 bg-slate-100 border-2 border-transparent rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold uppercase focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all appearance-none cursor-pointer"
                      value={formData.balance_type}
                      onChange={(e) => setFormData({...formData, balance_type: e.target.value})}
                    >
                      <option value="debit">Rec</option>
                      <option value="credit">Adv</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 md:pt-6 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="order-2 sm:order-1 px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm md:text-base"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="order-1 sm:order-2 bg-indigo-600 text-white px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all text-sm md:text-base flex items-center justify-center gap-2"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {modalMode === 'add' ? 'Save Customer' : 'Update Information'}
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
        title="Delete Customer"
        message="Are you sure you want to delete this customer? All their associated ledgers, invoices, and payment history will be permanently deleted."
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </DashboardLayout>
  );
}

export default Customers;
