import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

function SaleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNo: '', // Will be generated
    items: [{ itemId: '', quantity: 1, rate: 0, total: 0 }],
    discount: 0,
    labor: 0,
    paidAmount: 0,
    isCash: false,
    notes: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [{ data: custData, error: custErr }, { data: prodData, error: prodErr }] = await Promise.all([
        supabase.from('customers').select('id, name'),
        supabase.from('items').select('id, name, current_stock, min_stock_alert')
      ]);
      
      if (custErr) console.error('Customer Fetch Error:', custErr);
      if (prodErr) console.error('Product Fetch Error:', prodErr);

      setCustomers(custData || []);
      setProducts(prodData || []);

      // Generate Invoice Number if not editing
      if (!isEdit) {
        const { count, error: countErr } = await supabase
          .from('sales')
          .select('*', { count: 'exact', head: true });
        
        if (!countErr) {
          const nextNum = (count || 0) + 1;
          const formattedNum = String(nextNum).padStart(3, '0');
          setFormData(prev => ({ ...prev, invoiceNo: `INV-${formattedNum}` }));
        }
      }

      if (isEdit) {
        fetchSaleDetails();
      }
    } catch (error) {
      toast.error('Error loading initial data');
      console.error(error);
    }
  };

  const fetchSaleDetails = async () => {
    try {
      setLoading(true);
      const { data: sale, error } = await supabase
        .from('sales')
        .select('*, sale_items(*)')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        customerId: sale.customer_id || '',
        date: sale.sale_date,
        invoiceNo: sale.invoice_no,
        items: sale.sale_items.map(item => ({
          itemId: item.item_id,
          quantity: item.quantity,
          rate: item.rate,
          total: item.amount
        })),
        discount: 0, 
        labor: 0,    
        paidAmount: sale.payment_received,
        isCash: sale.payment_method === 'Cash',
        notes: sale.notes || ''
      });
    } catch (error) {
      toast.error('Error fetching sale details');
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
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'itemId') {
      const prod = products.find(p => p.id === parseInt(value));
      // PHP logic main rate manually enter hota ha ya item table main price nahi ha
      // Is liye yahan hum rate auto-set nahi kryn gay taake error na aaye
    }
    
    newItems[index].total = (parseFloat(newItems[index].quantity) || 0) * (parseFloat(newItems[index].rate) || 0);
    setFormData({ ...formData, items: newItems });
  };

  const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
  const grandTotal = subtotal - (parseFloat(formData.discount) || 0) + (parseFloat(formData.labor) || 0);
  const balance = grandTotal - (formData.isCash ? grandTotal : (parseFloat(formData.paidAmount) || 0));

  useEffect(() => {
    if (formData.isCash) {
      setFormData(prev => ({
        ...prev,
        customerId: '',
        paidAmount: grandTotal
      }));
    }
  }, [formData.isCash, grandTotal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.isCash && !formData.customerId) {
      toast.error('Please select a Customer or mark as Cash Sale');
      return;
    }

    try {
      setLoading(true);

      const salePayload = {
        invoice_no: formData.invoiceNo,
        customer_id: formData.isCash ? null : (formData.customerId || null),
        sale_date: formData.date,
        total_amount: grandTotal,
        payment_received: formData.isCash ? grandTotal : (parseFloat(formData.paidAmount) || 0),
        balance: balance,
        payment_method: formData.isCash ? 'Cash' : 'Credit',
        notes: formData.notes
      };

      let saleId;
      if (isEdit) {
        const { error } = await supabase.from('sales').update(salePayload).eq('id', id);
        if (error) throw error;
        saleId = id;
        // Delete old items first for simplicity in edit mode
        await supabase.from('sale_items').delete().eq('sale_id', id);
      } else {
        const { data, error } = await supabase.from('sales').insert(salePayload).select().single();
        if (error) throw error;
        saleId = data.id;
      }

      // Insert items
      const itemsPayload = formData.items.map(item => ({
        sale_id: saleId,
        item_id: item.itemId,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.total
      }));

      const { error: itemsError } = await supabase.from('sale_items').insert(itemsPayload);
      if (itemsError) throw itemsError;

      // Update Stock (Subtract quantity)
      for (const item of formData.items) {
        const product = products.find(p => p.id === parseInt(item.itemId));
        if (product) {
          const newStock = parseFloat(product.current_stock) - parseFloat(item.quantity);
          await supabase.from('items').update({ current_stock: newStock }).eq('id', item.itemId);

          // Dynamic Notification Generation
          const minAlert = parseFloat(product.min_stock_alert) || 10;
          if (newStock <= 0) {
            await supabase.from('notifications').insert([{
              notification_type: 'Out of Stock',
              title: 'Item Out of Stock',
              message: `${product.name} is completely out of stock!`,
              reference_id: product.id,
              reference_type: 'items'
            }]);
          } else if (newStock <= minAlert) {
            await supabase.from('notifications').insert([{
              notification_type: 'Low Stock',
              title: 'Low Stock Alert',
              message: `${product.name} is running low (${newStock} units left).`,
              reference_id: product.id,
              reference_type: 'items'
            }]);
          }
        }
      }

      // Update Ledger & Customer Balance (If not cash)
      if (!formData.isCash && formData.customerId) {
        
        // 1. Ledger Entries
        const ledgerEntries = [];
        
        // Sale Bill (Debit)
        ledgerEntries.push({
          transaction_type: 'Sale',
          party_type: 'Customer',
          party_id: formData.customerId,
          transaction_date: formData.date,
          invoice_no: formData.invoiceNo,
          description: `Sale Invoice #${formData.invoiceNo}`,
          debit: grandTotal,
          credit: 0
        });

        // Payment Received (Credit)
        const paymentAmount = parseFloat(formData.paidAmount) || 0;
        if (paymentAmount > 0) {
          ledgerEntries.push({
            transaction_type: 'Receipt',
            party_type: 'Customer',
            party_id: formData.customerId,
            transaction_date: formData.date,
            invoice_no: formData.invoiceNo,
            description: `Payment against Invoice #${formData.invoiceNo}`,
            debit: 0,
            credit: paymentAmount
          });
        }

        if (isEdit) {
           await supabase.from('transactions').delete().eq('invoice_no', formData.invoiceNo);
        }

        const { error: ledgerError } = await supabase.from('transactions').insert(ledgerEntries);
        if (ledgerError) throw ledgerError;

        // 2. Update Customer Balance
        const { data: customer } = await supabase
          .from('customers')
          .select('current_balance')
          .eq('id', formData.customerId)
          .single();
        
        if (customer) {
          const newCustBalance = (parseFloat(customer.current_balance) || 0) + balance;
          await supabase
            .from('customers')
            .update({ current_balance: newCustBalance })
            .eq('id', formData.customerId);
            
          // Large Receivable Notification
          if (newCustBalance >= 50000) {
            const custName = customers.find(c => c.id === parseInt(formData.customerId))?.name || 'Customer';
            await supabase.from('notifications').insert([{
              notification_type: 'Large Receivable',
              title: 'Large Receivable Warning',
              message: `${custName}'s outstanding balance has reached ₨ ${newCustBalance.toLocaleString()}.`,
              reference_id: parseInt(formData.customerId),
              reference_type: 'customers'
            }]);
          }
        }
      }

      toast.success(isEdit ? 'Sale updated successfully' : 'Sale saved successfully');
      navigate('/sales');
    } catch (error) {
      toast.error('Error saving sale: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle={isEdit ? "Edit Sale" : "New Sale"}>
      <div className="max-w-6xl mx-auto pb-10 px-4 sm:px-6 relative">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-[32px]">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Form Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="text-center md:text-left">
            <button 
              onClick={() => navigate('/sales')}
              className="text-slate-400 hover:text-indigo-600 font-bold flex items-center justify-center md:justify-start gap-2 mb-2 transition-colors mx-auto md:mx-0"
            >
              <i className="fas fa-arrow-left text-sm"></i> Back to Sales
            </button>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">
              {isEdit ? 'Update Sale Invoice' : 'Create New Sale'}
            </h1>
          </div>
          <div className="text-center md:text-right bg-indigo-50 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Number</p>
            <p className="text-lg md:text-xl font-black text-indigo-600">#{formData.invoiceNo}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Customer</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded accent-indigo-600"
                        checked={formData.isCash}
                        onChange={(e) => setFormData({...formData, isCash: e.target.checked})}
                      />
                      <span className="text-[9px] font-black text-indigo-700 uppercase tracking-tighter">Cash Sale</span>
                    </label>
                  </div>
                  <select 
                    className={`w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all ${formData.isCash ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={formData.isCash}
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                    required={!formData.isCash}
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 text-center md:text-left">
                  <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Sale Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 md:p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-bold text-slate-900 text-sm md:text-base">Invoice Items</h3>
                <button 
                  type="button"
                  onClick={handleAddItem}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                >
                  <i className="fas fa-plus mr-1"></i> Add
                </button>
              </div>
              <div className="p-0 sm:p-6 overflow-x-auto">
                <table className="w-full min-w-[600px] sm:min-w-0">
                  <thead>
                    <tr className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="px-4 py-4 text-left">Product</th>
                      <th className="px-4 py-4 text-center w-24">Qty</th>
                      <th className="px-4 py-4 text-center w-32">Rate</th>
                      <th className="px-4 py-4 text-right">Total</th>
                      <th className="px-4 py-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {formData.items.map((item, index) => (
                      <tr key={index} className="group">
                        <td className="px-4 py-4">
                          <select 
                            className="w-full px-3 py-2.5 bg-slate-50 border-none rounded-xl text-xs md:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600/20 outline-none"
                            value={item.itemId}
                            onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                            required
                          >
                            <option value="">Select...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.current_stock})</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-xs md:text-sm font-bold text-center focus:bg-white focus:ring-2 focus:ring-indigo-600/20 outline-none"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            required
                          />
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            className="w-full px-2 py-2.5 bg-slate-50 border-none rounded-xl text-xs md:text-sm font-bold text-center focus:bg-white focus:ring-2 focus:ring-indigo-600/20 outline-none"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                            required
                          />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-black text-slate-900 text-xs md:text-sm">₨ {item.total.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-600 transition-colors p-2"
                          >
                            <i className="fas fa-trash-alt text-xs"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base">
                <i className="fas fa-sticky-note text-indigo-600"></i> Additional Notes
              </h3>
              <textarea 
                className="w-full p-4 md:p-6 bg-slate-50 border-2 border-transparent rounded-2xl md:rounded-3xl text-sm font-medium focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all"
                rows="3"
                placeholder="Sale details..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              ></textarea>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900 border-b border-slate-50 pb-4 text-sm md:text-base">Sale Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="text-slate-500 font-medium">Sub Total</span>
                  <span className="font-bold text-slate-900">₨ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Discount (-)</span>
                  <input 
                    type="number" 
                    className="w-24 px-3 py-1.5 bg-slate-50 border-none rounded-lg text-right text-xs md:text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-600/20 outline-none"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                  />
                </div>
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Labor (+)</span>
                  <input 
                    type="number" 
                    className="w-24 px-3 py-1.5 bg-slate-50 border-none rounded-lg text-right text-xs md:text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-600/20 outline-none"
                    value={formData.labor}
                    onChange={(e) => setFormData({...formData, labor: e.target.value})}
                  />
                </div>
                
                <div className="pt-4 border-t border-slate-50">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Grand Total</span>
                    <span className="font-black text-2xl md:text-3xl text-indigo-600">₨ {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paid Amount</label>
                    <input 
                      type="number" 
                      className={`w-full px-5 py-4 bg-slate-900 text-white border-none rounded-2xl text-xl font-black focus:ring-4 focus:ring-indigo-600/20 outline-none transition-all ${formData.isCash ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={formData.isCash}
                      value={formData.isCash ? grandTotal : formData.paidAmount}
                      onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                    />
                  </div>

                  <div className={`p-4 rounded-2xl transition-colors ${balance > 0 ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>Balance</span>
                      <span className={`text-base font-black ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ₨ {balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-4 md:py-5 rounded-2xl font-black text-base md:text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEdit ? 'Update Invoice' : 'Save & Print Invoice'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default SaleForm;
