import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

function PurchaseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNo: '', // Will be generated
    items: [{ itemId: '', quantity: 1, rate: 0, total: 0 }],
    discount: 0,
    transport: 0,
    other: 0,
    paidAmount: 0,
    isCash: false,
    notes: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [{ data: suppData }, { data: prodData }] = await Promise.all([
        supabase.from('suppliers').select('id, name'),
        supabase.from('items').select('id, name, current_stock')
      ]);
      setSuppliers(suppData || []);
      setProducts(prodData || []);

      // Generate Invoice Number if not editing
      if (!isEdit) {
        const { count, error: countErr } = await supabase
          .from('purchases')
          .select('*', { count: 'exact', head: true });
        
        if (!countErr) {
          const nextNum = (count || 0) + 1;
          const formattedNum = String(nextNum).padStart(3, '0');
          setFormData(prev => ({ ...prev, invoiceNo: `PUR-${formattedNum}` }));
        }
      }

      if (isEdit) {
        fetchPurchaseDetails();
      }
    } catch (error) {
      toast.error('Error loading initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseDetails = async () => {
    try {
      setLoading(true);
      const { data: pur, error } = await supabase
        .from('purchases')
        .select('*, purchase_items(*)')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        supplierId: pur.supplier_id || '',
        date: pur.purchase_date,
        invoiceNo: pur.invoice_no,
        items: pur.purchase_items.map(item => ({
          itemId: item.item_id,
          quantity: item.quantity,
          rate: item.rate,
          total: item.amount
        })),
        discount: 0, 
        transport: pur.transport_expense,
        other: pur.other_expense,
        paidAmount: pur.payment_made,
        isCash: pur.supplier_id === null, // Adjust if you have a specific cash logic
        notes: pur.notes || ''
      });
    } catch (error) {
      toast.error('Error fetching purchase details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemId: '', quantity: 1, rate: 0, total: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Purchase rate typically stays what you enter manually
    newItems[index].total = (parseFloat(newItems[index].quantity) || 0) * (parseFloat(newItems[index].rate) || 0);
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => formData.items.reduce((sum, item) => sum + item.total, 0);
  const subtotal = calculateSubtotal();
  const grandTotal = subtotal - (parseFloat(formData.discount) || 0) + (parseFloat(formData.transport) || 0) + (parseFloat(formData.other) || 0);
  const balance = grandTotal - (formData.isCash ? grandTotal : (parseFloat(formData.paidAmount) || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const purchasePayload = {
        invoice_no: formData.invoiceNo,
        supplier_id: formData.isCash ? null : (formData.supplierId || null),
        purchase_date: formData.date,
        total_amount: grandTotal,
        transport_expense: parseFloat(formData.transport) || 0,
        other_expense: parseFloat(formData.other) || 0,
        payment_made: formData.isCash ? grandTotal : (parseFloat(formData.paidAmount) || 0),
        balance: balance,
        notes: formData.notes || ''
      };

      let purchaseId;
      if (isEdit) {
        const { error } = await supabase.from('purchases').update(purchasePayload).eq('id', id);
        if (error) throw error;
        purchaseId = id;
        await supabase.from('purchase_items').delete().eq('purchase_id', id);
      } else {
        const { data, error } = await supabase.from('purchases').insert(purchasePayload).select().single();
        if (error) throw error;
        purchaseId = data.id;
      }

      // Insert items
      const itemsPayload = formData.items.map(item => ({
        purchase_id: purchaseId,
        item_id: item.itemId,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.total
      }));

      const { error: itemsError } = await supabase.from('purchase_items').insert(itemsPayload);
      if (itemsError) throw itemsError;

      // Update Stock (ADD quantity)
      for (const item of formData.items) {
        const product = products.find(p => p.id === parseInt(item.itemId));
        if (product) {
          const newStock = parseFloat(product.current_stock) + parseFloat(item.quantity);
          await supabase.from('items').update({ current_stock: newStock }).eq('id', item.itemId);
        }
      }

      // 4. Update Supplier Balance
      if (!formData.isCash && balance !== 0 && formData.supplierId) {
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('current_balance')
          .eq('id', formData.supplierId)
          .single();
        
        if (supplier) {
          const newSuppBalance = (parseFloat(supplier.current_balance) || 0) + balance;
          await supabase
            .from('suppliers')
            .update({ current_balance: newSuppBalance })
            .eq('id', formData.supplierId);
        }
      }

      toast.success(isEdit ? 'Purchase updated successfully' : 'Purchase saved successfully');
      navigate('/purchases');
    } catch (error) {
      toast.error('Error saving purchase: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle={isEdit ? "Edit Purchase Invoice" : "New Purchase Invoice"}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-10">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-[32px]">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {/* Form Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button 
              onClick={() => navigate('/purchases')}
              className="text-slate-400 hover:text-emerald-600 font-bold flex items-center gap-2 mb-2 transition-colors"
            >
              <i className="fas fa-arrow-left text-sm"></i> Back to Purchases
            </button>
            <h1 className="text-3xl font-black text-slate-900">
              {isEdit ? 'Update Purchase' : 'Create New Purchase'}
            </h1>
          </div>
          <div className="text-center md:text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Number</p>
            <p className="text-lg md:text-xl font-black text-indigo-600">#{formData.invoiceNo}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-widest ml-1">Supplier</label>
                  <div className="flex gap-2">
                    <select 
                      className={`flex-grow px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-600/30 focus:outline-none transition-all ${formData.isCash ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={formData.isCash}
                      value={formData.supplierId}
                      onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 bg-slate-50 px-4 rounded-2xl cursor-pointer hover:bg-emerald-50 transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded accent-emerald-600"
                        checked={formData.isCash}
                        onChange={(e) => setFormData({...formData, isCash: e.target.checked, supplierId: ''})}
                      />
                      <span className="text-[10px] font-black text-emerald-700 uppercase">Cash</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-widest ml-1">Purchase Date</label>
                  <input 
                    type="date" 
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-600/30 focus:outline-none transition-all"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Items Table Card */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Invoice Items</h3>
                <button 
                  onClick={handleAddItem}
                  className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all"
                >
                  <i className="fas fa-plus mr-1"></i> Add Item
                </button>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="pb-4 text-left pl-2">Product Name</th>
                      <th className="pb-4 text-center w-24">Qty</th>
                      <th className="pb-4 text-center w-32">Rate</th>
                      <th className="pb-4 text-right pr-2">Line Total</th>
                      <th className="pb-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {formData.items.map((item, index) => (
                      <tr key={index} className="group">
                        <td className="py-4 pr-4">
                          <select 
                            className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-600/20 outline-none"
                            value={item.itemId}
                            onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                          >
                            <option value="">Choose Product...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (Stock: {p.current_stock})</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-2">
                          <input 
                            type="number" 
                            className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold text-center focus:bg-white focus:ring-2 focus:ring-emerald-600/20 outline-none"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          />
                        </td>
                        <td className="py-4 px-2">
                          <input 
                            type="number" 
                            className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold text-center focus:bg-white focus:ring-2 focus:ring-emerald-600/20 outline-none"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          />
                        </td>
                        <td className="py-4 pl-4 text-right">
                          <span className="font-black text-slate-900">₨ {item.total.toLocaleString()}</span>
                        </td>
                        <td className="py-4 pl-4 text-right">
                          <button 
                            onClick={() => handleRemoveItem(index)}
                            className="text-slate-300 hover:text-rose-600 transition-colors p-2"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Totals & Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900 border-b border-slate-50 pb-4">Purchase Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Sub Total</span>
                  <span className="font-bold text-slate-900">₨ {subtotal.toLocaleString()}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Discount (-)</span>
                    <input 
                      type="number" 
                      className="w-24 px-3 py-1.5 bg-slate-50 border-none rounded-lg text-right text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 outline-none"
                      value={formData.discount}
                      onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Transport (+)</span>
                    <input 
                      type="number" 
                      className="w-24 px-3 py-1.5 bg-slate-50 border-none rounded-lg text-right text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 outline-none"
                      value={formData.transport}
                      onChange={(e) => setFormData({...formData, transport: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Other (+)</span>
                    <input 
                      type="number" 
                      className="w-24 px-3 py-1.5 bg-slate-50 border-none rounded-lg text-right text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600/20 outline-none"
                      value={formData.other}
                      onChange={(e) => setFormData({...formData, other: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-900 font-black text-lg">Grand Total</span>
                    <span className="font-black text-2xl text-emerald-600">₨ {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Made</label>
                    <input 
                      type="number" 
                      className={`w-full px-5 py-3.5 bg-slate-900 text-white border-none rounded-2xl text-xl font-black focus:ring-4 focus:ring-emerald-600/20 outline-none transition-all ${formData.isCash ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={formData.isCash}
                      value={formData.isCash ? grandTotal : formData.paidAmount}
                      onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                    />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining Balance</span>
                      <span className={`text-base font-black ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ₨ {balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-4 md:py-5 rounded-2xl font-black text-base md:text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEdit ? 'Update Purchase' : 'Save Purchase'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PurchaseForm;
