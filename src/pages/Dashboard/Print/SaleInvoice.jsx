import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-toastify';

function SaleInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sale, setSale] = useState(null);
  const [items, setItems] = useState([]);
  const [prevBalance, setPrevBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);

  useEffect(() => {
    fetchInvoiceData();
  }, [id]);

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Sale details with customer info
      const { data: saleData, error: saleErr } = await supabase
        .from('sales')
        .select(`*, customers(*)`)
        .eq('id', id)
        .single();
      
      if (saleErr) throw saleErr;
      setSale(saleData);

      // 2. Fetch Sale Items with product info
      const { data: itemsData, error: itemsErr } = await supabase
        .from('sale_items')
        .select(`*, items(name, unit)`)
        .eq('sale_id', id);
      
      if (itemsErr) throw itemsErr;
      setItems(itemsData);

      // 3. Calculate Balance History (Mimic PHP Logic)
      // Logic: Previous Balance = Customer Current Balance - This Invoice Balance
      const currentInvoiceBalance = parseFloat(saleData.balance || 0);
      const customerTotalBalance = parseFloat(saleData.customers?.current_balance || 0);
      
      setClosingBalance(customerTotalBalance);
      setPrevBalance(customerTotalBalance - currentInvoiceBalance);

    } catch (error) {
      toast.error('Error loading invoice');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Loading Invoice...</div>;
  if (!sale) return <div className="p-20 text-center font-bold text-rose-600">Invoice not found!</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      {/* Controls - No Print */}
      <div className="max-w-[800px] mx-auto mb-6 flex justify-end gap-4 no-print">
        <button 
          onClick={() => window.print()}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <i className="fas fa-print"></i> Print Invoice
        </button>
        <button 
          onClick={() => navigate(-1)}
          className="bg-white text-slate-600 px-6 py-2.5 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
        >
          Back
        </button>
      </div>

      {/* Invoice Content */}
      <div className="max-w-[800px] mx-auto bg-white shadow-2xl rounded-none md:rounded-[2px] p-8 md:p-12 border border-slate-100 invoice-container">
        {/* Header */}
        <div className="flex justify-between items-start mb-10 pb-10 border-b-2 border-slate-50">
          <div>
            <h1 className="text-4xl font-black text-indigo-600 mb-4 uppercase tracking-tighter">Invoice</h1>
            <div className="space-y-1">
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Invoice No</p>
              <p className="text-xl font-black text-slate-900">#{sale.invoice_no}</p>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Date</p>
              <p className="text-base font-black text-slate-900">{new Date(sale.sale_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Faran Traders</h2>
            <div className="text-sm text-slate-600 font-bold mt-2 leading-relaxed italic">
              Wazirabad Sohdra, Punjab<br />
              Phone: +92 300 1234567<br />
              Email: info@farantraders.com
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-10">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Bill To</h3>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 inline-block min-w-[300px]">
            <p className="text-lg font-black text-slate-900 mb-1">{sale.customers?.name || 'Walk-in Customer'}</p>
            <p className="text-sm text-slate-500 font-medium">{sale.customers?.phone || 'N/A'}</p>
            <p className="text-sm text-slate-500 font-medium">{sale.customers?.city || ''}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-hidden border border-slate-200 rounded-xl mb-10">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-900 text-[11px] font-black uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4 text-left border-r border-slate-200">Item Description</th>
                <th className="px-6 py-4 text-center border-r border-slate-200">Qty</th>
                <th className="px-6 py-4 text-right border-r border-slate-200">Rate</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 border-r border-slate-200">
                    <p className="font-bold text-slate-900">{item.items?.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{item.items?.unit}</p>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700 border-r border-slate-200">{item.quantity}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700 border-r border-slate-200">₨ {parseFloat(item.rate).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-black text-slate-900 italic">₨ {parseFloat(item.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div className="flex-grow max-w-md">
            {sale.notes && (
              <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes</p>
                <p className="text-sm text-slate-600 leading-relaxed italic">{sale.notes}</p>
              </div>
            )}
          </div>
          
          <div className="w-full md:w-[350px] space-y-3">
            <div className="flex justify-between items-center px-4 py-2 text-sm">
              <span className="text-slate-500 font-bold">Previous Balance</span>
              <span className="font-bold text-slate-900">₨ {prevBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2 text-sm bg-indigo-50/30 rounded-lg">
              <span className="text-indigo-600 font-black">Invoice Total</span>
              <span className="font-black text-indigo-900">₨ {parseFloat(sale.total_amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2 text-sm">
              <span className="text-slate-500 font-bold">Payment Received</span>
              <span className="font-bold text-emerald-600">₨ {parseFloat(sale.payment_received).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2 text-sm italic">
              <span className="text-slate-500">Remaining (This Bill)</span>
              <span className="font-bold text-slate-700">₨ {(parseFloat(sale.total_amount) - parseFloat(sale.payment_received)).toLocaleString()}</span>
            </div>
            <div className="h-px bg-slate-100 my-2"></div>
            <div className="flex justify-between items-center px-4 py-4 bg-slate-900 rounded-2xl text-white shadow-xl">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">NET RECEIVABLE</span>
                <span className="text-xs font-medium">Total Balance</span>
              </div>
              <span className="text-2xl font-black">₨ {closingBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm font-black text-slate-900 mb-0.5">Thank You For Your Business!</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">This is a computer generated invoice and does not require signature.</p>
        </div>
      </div>

      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .invoice-container { 
            box-shadow: none !important; 
            border: none !important; 
            width: 100% !important; 
            max-width: 100% !important;
            padding: 10px !important;
            margin: 0 !important;
          }
          .min-h-screen { background: white !important; padding: 0 !important; min-height: auto !important; }
          .py-10 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .mb-10 { margin-bottom: 1.5rem !important; }
          .pb-10 { padding-bottom: 1.5rem !important; }
          .mt-20 { margin-top: 2rem !important; }
        }
      `}</style>
    </div>
  );
}

export default SaleInvoice;
