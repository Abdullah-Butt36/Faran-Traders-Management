import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import DeleteConfirmModal from '../../components/Dashboard/DeleteConfirmModal';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

function Items() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'Bags',
    current_stock: 0,
    min_stock_alert: 10
  });

  const [adjustData, setAdjustData] = useState({
    type: 'Add',
    quantity: 0,
    reason: ''
  });

  // Fetch Items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      toast.error('Error fetching items: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      unit: 'Bags',
      current_stock: 0,
      min_stock_alert: 10
    });
    setSelectedItem(null);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category || '',
      unit: item.unit || 'Bags',
      current_stock: item.current_stock || 0,
      min_stock_alert: item.min_stock_alert || 10
    });
    setShowItemModal(true);
  };

  const handleSubmitItem = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        current_stock: parseFloat(formData.current_stock),
        min_stock_alert: parseFloat(formData.min_stock_alert)
      };

      if (modalMode === 'add') {
        const { error } = await supabase.from('items').insert([payload]);
        if (error) throw error;
        toast.success('Item added successfully!');
      } else {
        const { error } = await supabase
          .from('items')
          .update(payload)
          .eq('id', selectedItem.id);
        if (error) throw error;
        toast.success('Item updated successfully!');
      }

      setShowItemModal(false);
      resetForm();
      fetchItems();
    } catch (error) {
      toast.error('Error saving item: ' + error.message);
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
        .from('items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Item deleted successfully');
      setDeleteModal({ isOpen: false, id: null });
      fetchItems();
    } catch (error) {
      toast.error('Error deleting item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const qty = parseFloat(adjustData.quantity);
      const newStock = adjustData.type === 'Add' 
        ? (parseFloat(selectedItem.current_stock) || 0) + qty 
        : (parseFloat(selectedItem.current_stock) || 0) - qty;

      // 1. Update Items table
      const { error: itemErr } = await supabase
        .from('items')
        .update({ current_stock: newStock })
        .eq('id', selectedItem.id);

      if (itemErr) throw itemErr;

      // 2. Insert into Stock Logs for history
      const { error: logErr } = await supabase
        .from('stock_logs')
        .insert({
          item_id: selectedItem.id,
          adjustment_type: adjustData.type,
          quantity: qty,
          reason: adjustData.reason
        });

      if (logErr) throw logErr;

      toast.success('Stock adjusted and history logged!');
      setShowAdjustModal(false);
      setAdjustData({ type: 'Add', quantity: 0, reason: '' });
      fetchItems();
    } catch (error) {
      toast.error('Error adjusting stock: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatus = (item) => {
    const stock = parseFloat(item.current_stock || 0);
    const alert = parseFloat(item.min_stock_alert || 0);
    if (stock <= 0) return { label: 'Out of Stock', class: 'bg-rose-100 text-rose-600' };
    if (stock <= alert) return { label: 'Low Stock', class: 'bg-amber-100 text-amber-600' };
    return { label: 'Healthy', class: 'bg-emerald-100 text-emerald-600' };
  };

  return (
    <DashboardLayout pageTitle="Items">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-3">
            <i className="fas fa-box text-indigo-600"></i> Items
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Manage your products and real-time stock levels</p>
        </div>
        <button 
          onClick={() => { resetForm(); setModalMode('add'); setShowItemModal(true); }}
          className="bg-indigo-600 text-white px-6 py-4 md:py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <i className="fas fa-plus text-sm"></i> Add New Item
        </button>
      </div>

      {/* Search Section */}
      <div className="max-w-2xl mx-auto mb-6 md:mb-8 text-center">
        <div className="relative group text-left">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Search item name or category..."
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 md:py-4 pl-14 pr-6 text-sm md:text-base font-medium focus:border-indigo-600/30 focus:outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-10 min-h-[400px] relative">
        <div className="p-5 md:p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-slate-900 tracking-tight text-base md:text-lg">Inventory List</h3>
          <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {filteredItems.length} Items Listed
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
                  <th className="px-8 py-5">Item Details</th>
                  <th className="px-8 py-5 text-center">Category</th>
                  <th className="px-8 py-5 text-right">Stock Level</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50 flex flex-col md:table-row-group">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium italic">
                      No items found...
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const status = getStatus(item);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors flex flex-col md:table-row p-4 md:p-0 border-b md:border-b-0 border-slate-50 group">
                        <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center border-none">
                          <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</span>
                          <div className="font-black text-slate-900 text-sm md:text-base text-right md:text-left">{item.name}</div>
                        </td>

                        <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center md:text-center border-none">
                          <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</span>
                          <div className="text-slate-500 font-bold bg-slate-50 md:bg-transparent px-2 py-0.5 rounded md:px-0 uppercase text-[10px] md:text-xs tracking-widest">{item.category || 'N/A'}</div>
                        </td>

                        <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center md:text-right border-none">
                          <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">In Stock</span>
                          <div className={`font-black text-base md:text-lg ${item.current_stock <= item.min_stock_alert ? 'text-rose-600' : 'text-slate-900'}`}>
                            {item.current_stock} <span className="text-[10px] text-slate-400 font-black ml-0.5 uppercase">{item.unit}</span>
                          </div>
                        </td>

                        <td className="px-0 md:px-8 py-2 md:py-5 md:table-cell flex justify-between items-center md:text-center border-none">
                          <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                          <span className={`px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest ${status.class}`}>
                            {status.label}
                          </span>
                        </td>

                        <td className="px-0 md:px-8 py-4 md:py-5 md:table-cell border-none no-print">
                          <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setSelectedItem(item); setAdjustData({...adjustData, quantity: 0}); setShowAdjustModal(true); }}
                              className="flex-grow md:flex-grow-0 h-11 md:h-9 px-4 md:px-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-emerald-100 font-black text-[10px] uppercase tracking-wider"
                            >
                              <i className="fas fa-sync-alt text-[10px]"></i> Update
                            </button>
                            <button 
                              onClick={() => handleEdit(item)}
                              className="flex-grow md:flex-grow-0 h-11 md:h-9 px-4 md:px-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 border border-slate-200 font-black text-[10px] uppercase tracking-wider"
                            >
                              <i className="fas fa-edit text-[10px]"></i> Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(item.id)}
                              className="flex-grow md:flex-grow-0 h-11 md:h-9 px-4 md:px-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-rose-100 font-black text-[10px] uppercase tracking-wider"
                              title="Delete"
                            >
                              <i className="fas fa-trash-alt text-[10px]"></i> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-[24px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-slideUp">
            <div className="px-6 py-6 md:px-10 md:py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">{modalMode === 'add' ? 'Add Item' : 'Edit Item'}</h2>
                <p className="text-xs md:text-sm font-medium text-slate-500 mt-1">Product and inventory details</p>
              </div>
              <button onClick={() => setShowItemModal(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmitItem} className="p-6 md:p-10 space-y-4 md:space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Item Name *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 md:px-5 md:py-4 bg-slate-100 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all"
                  placeholder="e.g. Organic Cotton Tee"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Category</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 md:px-5 md:py-4 bg-slate-100 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all"
                    placeholder="Apparel"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Unit *</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 md:px-5 md:py-4 bg-slate-100 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all"
                    placeholder="Pcs, Pairs, Bags"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Current Stock</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 md:px-5 md:py-4 bg-slate-100 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all"
                    placeholder="0"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({...formData, current_stock: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Alert Level (Min Stock)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 md:px-5 md:py-4 bg-slate-100 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all"
                    placeholder="10"
                    value={formData.min_stock_alert}
                    onChange={(e) => setFormData({...formData, min_stock_alert: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 md:pt-6 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
                <button 
                  type="button"
                  onClick={() => setShowItemModal(false)}
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
                  {modalMode === 'add' ? 'Save Item' : 'Update Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[24px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-slideUp">
            <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-50 flex justify-between items-center bg-emerald-50/30 text-emerald-900">
              <h2 className="text-lg md:text-xl font-black">Adjust Stock: {selectedItem?.name}</h2>
              <button onClick={() => setShowAdjustModal(false)} className="w-10 h-10 flex items-center justify-center text-emerald-400 hover:text-emerald-900 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleAdjustStock} className="p-6 md:p-8 space-y-4 md:space-y-6">
              <p className="text-xs md:text-sm font-medium text-slate-500 bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100">
                <i className="fas fa-info-circle mr-2 text-indigo-500"></i>
                Current Stock: <span className="text-slate-900 font-bold">{selectedItem?.current_stock} {selectedItem?.unit}</span>
              </p>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Action Type</label>
                <select 
                  className="w-full px-4 py-3 md:px-5 md:py-4 bg-slate-100 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-600/30 focus:outline-none transition-all appearance-none cursor-pointer"
                  value={adjustData.type}
                  onChange={(e) => setAdjustData({...adjustData, type: e.target.value})}
                >
                  <option value="Add">Add Stock (+)</option>
                  <option value="Subtract">Subtract Stock (-)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Quantity</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 md:px-5 md:py-4 bg-slate-100 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-600/30 focus:outline-none transition-all"
                  placeholder="0.00"
                  value={adjustData.quantity}
                  onChange={(e) => setAdjustData({...adjustData, quantity: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Reason</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 md:px-5 md:py-4 bg-slate-100 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-600/30 focus:outline-none transition-all"
                  placeholder="Damage, Correction, etc."
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({...adjustData, reason: e.target.value})}
                  required
                />
              </div>

              <div className="pt-2 md:pt-4 flex gap-3 md:gap-4">
                <button 
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-grow py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm md:text-base"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-grow bg-emerald-600 text-white py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all text-sm md:text-base flex items-center justify-center gap-2"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Update
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
        title="Delete Item"
        message="Are you sure you want to delete this item? All related stock records and historical data will be permanently removed."
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

export default Items;
