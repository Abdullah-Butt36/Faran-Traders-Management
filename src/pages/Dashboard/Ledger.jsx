import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

function Ledger() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [partyType, setPartyType] = useState(searchParams.get('type') || 'Customer');
  const [selectedParty, setSelectedParty] = useState(searchParams.get('id') || '');
  
  // Set default dates (first day of current month to today)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editEntryData, setEditEntryData] = useState(null);
  
  const [parties, setParties] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({ date: today.toISOString().split('T')[0], desc: '', debit: '', credit: '' });

  // Update URL when selection changes
  useEffect(() => {
    if (selectedParty) {
      setSearchParams({ type: partyType, id: selectedParty });
    } else {
      setSearchParams({});
    }
  }, [partyType, selectedParty, setSearchParams]);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const table = partyType === 'Customer' ? 'customers' : 'suppliers';
        const { data, error } = await supabase.from(table).select('*').order('name');
        if (error) throw error;
        setParties(data.map(p => ({
          id: p.id.toString(),
          name: p.name,
          city: p.city,
          openingBalance: parseFloat(p.opening_balance || 0)
        })));
      } catch (error) {
        toast.error('Error fetching parties: ' + error.message);
      }
    };
    fetchParties();
  }, [partyType]);

  const fetchTransactions = async () => {
    if (!selectedParty) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('party_type', partyType)
        .eq('party_id', selectedParty)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: true })
        .order('id', { ascending: true });

      if (error) throw error;
      setAllTransactions(data || []);
    } catch (error) {
      toast.error('Error fetching transactions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedParty, endDate]);

  const currentPartyDetails = parties.find(p => p.id === selectedParty);

  // Calculate Ledger
  let periodOpeningBalance = currentPartyDetails?.openingBalance || 0;
  const periodTransactions = [];
  
  let runningBalance = periodOpeningBalance;

  allTransactions.forEach(t => {
    const debit = parseFloat(t.debit || 0);
    const credit = parseFloat(t.credit || 0);
    
    if (t.transaction_date < startDate) {
      periodOpeningBalance += (debit - credit);
      runningBalance = periodOpeningBalance;
    } else {
      runningBalance += (debit - credit);
      periodTransactions.push({
        id: t.id,
        raw_type: t.transaction_type,
        date: t.transaction_date,
        ref: t.invoice_no || 'MANUAL',
        desc: t.description || t.transaction_type,
        debit: debit,
        credit: credit,
        balance: runningBalance,
      });
    }
  });

  const totalDebit = periodTransactions.reduce((s, t) => s + t.debit, 0);
  const totalCredit = periodTransactions.reduce((s, t) => s + t.credit, 0);
  const closingBalance = runningBalance;

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    try {
      const debitVal = parseFloat(formData.debit || 0);
      const creditVal = parseFloat(formData.credit || 0);
      
      let tType = partyType === 'Customer' 
        ? (debitVal > 0 ? 'Sale' : 'Receipt') 
        : (debitVal > 0 ? 'Payment' : 'Purchase');

      if (modalMode === 'edit') tType = editEntryData.raw_type;

      const payload = {
        transaction_type: tType,
        party_type: partyType,
        party_id: parseInt(selectedParty),
        transaction_date: formData.date,
        description: formData.desc,
        debit: debitVal,
        credit: creditVal
      };
      
      if (modalMode === 'edit') {
        const { error } = await supabase.from('transactions').update(payload).eq('id', editEntryData.id);
        if (error) throw error;
        toast.success('Entry updated');
      } else {
        const { error } = await supabase.from('transactions').insert([payload]);
        if (error) throw error;
        toast.success('Entry added successfully');
      }
      
      setShowModal(false);
      fetchTransactions();
    } catch (error) {
      toast.error('Error saving entry: ' + error.message);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this manual entry?')) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Entry deleted');
      fetchTransactions();
    } catch (error) {
      toast.error('Error deleting entry: ' + error.message);
    }
  };

  const openAddModal = () => {
    setFormData({ date: new Date().toISOString().split('T')[0], desc: '', debit: '', credit: '' });
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (trans) => {
    setEditEntryData(trans);
    setFormData({ date: trans.date, desc: trans.desc, debit: trans.debit || '', credit: trans.credit || '' });
    setModalMode('edit');
    setShowModal(true);
  };

  return (
    <DashboardLayout pageTitle="Ledger">
      <div className="bg-white rounded-[24px] md:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mb-6 md:mb-8 no-print">
        <div className="p-6 md:p-10 space-y-6 md:space-y-8">
          {/* Main Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-3">
                <i className="fas fa-book text-sky-600"></i> Party Ledger
              </h1>
              <p className="text-slate-500 font-medium mt-1 text-sm md:text-base tracking-tight">Generate and manage detailed account statements</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {selectedParty && (
                <button 
                  onClick={openAddModal}
                  className="bg-indigo-600 text-white px-6 py-4 md:py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap"
                >
                  <i className="fas fa-plus text-sm"></i> Add Entry
                </button>
              )}
              <button 
                onClick={() => window.print()}
                className="bg-slate-50 text-slate-600 px-6 py-4 md:py-3 rounded-2xl font-bold border border-slate-100 hover:bg-slate-100 transition-all flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap"
              >
                <i className="fas fa-print text-sm"></i> Print Statement
              </button>
            </div>
          </div>

          {/* Integrated Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-6 md:pt-8 border-t border-slate-50">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Type</label>
              <select 
                className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-sky-600/30 focus:outline-none transition-all"
                value={partyType}
                onChange={(e) => { setPartyType(e.target.value); setSelectedParty(''); }}
              >
                <option value="Customer">Customers</option>
                <option value="Supplier">Suppliers</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Account</label>
              <select 
                className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-sky-600/30 focus:outline-none transition-all"
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
              >
                <option value="">Choose a Name...</option>
                {parties.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-sky-600/30 focus:outline-none transition-all"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-sky-600/30 focus:outline-none transition-all"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedParty && currentPartyDetails ? (
        <div className="bg-white p-6 md:p-10 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm print:shadow-none print:border-none print:p-0 mb-10">
          {/* Statement Header */}
          <div className="text-center mb-8 md:mb-12 border-b-2 border-slate-50 pb-6 md:pb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">FARAN TRADERS</h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Official Account Statement</p>
            
            <div className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 text-left max-w-2xl mx-auto border border-slate-50 p-5 md:p-6 rounded-2xl md:rounded-3xl bg-slate-50/30">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Party Name</p>
                <p className="text-base md:text-lg font-black text-slate-900">{currentPartyDetails.name}</p>
                <p className="text-xs md:text-sm font-medium text-slate-500">{currentPartyDetails.city}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Statement Period</p>
                <p className="text-sm md:text-base font-bold text-slate-900">
                  {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm border-collapse">
              <thead className="hidden md:table-header-group bg-slate-900 text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-5 text-left">Transaction Details</th>
                  <th className="px-6 py-5 text-right">Debit (+)</th>
                  <th className="px-6 py-5 text-right">Credit (-)</th>
                  <th className="px-6 py-5 text-right">Running Balance</th>
                  <th className="px-6 py-5 text-center no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 flex flex-col md:table-row-group">
                {/* Opening Balance Row */}
                <tr className="bg-slate-50 font-bold flex flex-col md:table-row p-4 md:p-0">
                  <td className="px-0 md:px-6 py-1 md:py-4 flex justify-between items-center border-none">
                    <div className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</div>
                    <div>
                      <div className="text-slate-900 uppercase text-[10px] tracking-widest">Opening Bal</div>
                      <div className="text-slate-400 text-[10px]">{new Date(startDate).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-0 md:px-6 py-1 md:py-4 flex justify-between items-center md:text-right border-none">
                    <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Debit</span>
                    <span>{periodOpeningBalance >= 0 ? periodOpeningBalance.toLocaleString() : '-'}</span>
                  </td>
                  <td className="px-0 md:px-6 py-1 md:py-4 flex justify-between items-center md:text-right border-none">
                    <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit</span>
                    <span>{periodOpeningBalance < 0 ? Math.abs(periodOpeningBalance).toLocaleString() : '-'}</span>
                  </td>
                  <td className="px-0 md:px-6 py-1 md:py-4 flex justify-between items-center md:text-right border-none font-black">
                    <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Bal</span>
                    <span>{Math.abs(periodOpeningBalance).toLocaleString()} {periodOpeningBalance >= 0 ? 'Dr' : 'Cr'}</span>
                  </td>
                  <td className="no-print"></td>
                </tr>

                {/* Transactions */}
                {periodTransactions.map((trans) => (
                  <tr key={trans.id} className="hover:bg-slate-50/50 transition-colors group flex flex-col md:table-row p-4 md:p-0 border-b md:border-b-0 border-slate-50">
                    <td className="px-0 md:px-6 py-2 md:py-4 md:table-cell flex justify-between items-start border-none">
                      <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Transaction</span>
                      <div className="text-right md:text-left">
                        <div className="font-black text-slate-700 text-sm">{trans.desc}</div>
                        <div className="flex items-center justify-end md:justify-start gap-2 mt-1">
                          <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">{trans.ref}</span>
                          <span className="text-slate-400 text-[9px]">{new Date(trans.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-0 md:px-6 py-2 md:py-4 md:table-cell flex justify-between items-center md:text-right border-none">
                      <span className="md:hidden text-[10px] font-black text-rose-400 uppercase tracking-widest">Debit (+)</span>
                      <span className="font-bold text-rose-600 text-sm">{trans.debit > 0 ? trans.debit.toLocaleString() : '-'}</span>
                    </td>

                    <td className="px-0 md:px-6 py-2 md:py-4 md:table-cell flex justify-between items-center md:text-right border-none">
                      <span className="md:hidden text-[10px] font-black text-emerald-400 uppercase tracking-widest">Credit (-)</span>
                      <span className="font-bold text-emerald-600 text-sm">{trans.credit > 0 ? trans.credit.toLocaleString() : '-'}</span>
                    </td>

                    <td className="px-0 md:px-6 py-2 md:py-4 md:table-cell flex justify-between items-center md:text-right border-none">
                      <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">Running Bal</span>
                      <div className="font-black text-slate-900 text-base md:text-sm">
                        {Math.abs(trans.balance).toLocaleString()} <span className="text-[9px] text-slate-400 font-bold uppercase">{trans.balance >= 0 ? 'Dr' : 'Cr'}</span>
                      </div>
                    </td>

                    <td className="px-0 md:px-6 py-3 md:py-4 md:table-cell text-center no-print border-none">
                      {trans.ref === 'MANUAL' ? (
                        <div className="flex justify-end md:justify-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(trans)}
                            className="h-10 px-4 md:w-8 md:h-8 flex items-center justify-center bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white rounded-xl md:rounded-lg transition-all border border-sky-100"
                          >
                            <i className="fas fa-edit md:text-xs"></i>
                            <span className="md:hidden ml-2 font-bold text-xs">Edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteEntry(trans.id)}
                            className="h-10 px-4 md:w-8 md:h-8 flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl md:rounded-lg transition-all border border-rose-100"
                          >
                            <i className="fas fa-trash-alt md:text-xs"></i>
                            <span className="md:hidden ml-2 font-bold text-xs">Delete</span>
                          </button>
                        </div>
                      ) : (
                        <div className="md:hidden py-1 text-center">
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">System Generated - No Actions</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="flex flex-col md:table-footer-group">
                <tr className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-100 flex flex-col md:table-row p-4 md:p-0">
                  <td className="px-0 md:px-6 py-1 md:py-5 flex justify-between items-center md:text-right border-none">
                    <span className="uppercase tracking-widest text-[10px]">Total Debits</span>
                    <span className="text-rose-600">₨ {totalDebit.toLocaleString()}</span>
                  </td>
                  <td className="px-0 md:px-6 py-1 md:py-5 flex justify-between items-center md:text-right border-none">
                    <span className="uppercase tracking-widest text-[10px]">Total Credits</span>
                    <span className="text-emerald-600">₨ {totalCredit.toLocaleString()}</span>
                  </td>
                  <td colSpan="3" className="hidden md:table-cell no-print"></td>
                </tr>
                <tr className="bg-slate-900 text-white font-black flex flex-col md:table-row p-6 md:p-0">
                  <td colSpan="3" className="px-0 md:px-8 py-1 md:py-6 flex justify-between items-center md:text-right border-none uppercase tracking-[0.1em] text-[10px] md:text-[11px]">
                    <span className="md:hidden">Closing Balance</span>
                    <span className="hidden md:inline">Closing Balance:</span>
                  </td>
                  <td className="px-0 md:px-8 py-1 md:py-6 flex justify-between md:justify-end items-center md:text-right text-lg md:text-xl border-none">
                    <span className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Due</span>
                    <span className="whitespace-nowrap">
                      ₨ {Math.abs(closingBalance).toLocaleString()} {closingBalance >= 0 ? 'Dr' : 'Cr'}
                    </span>
                  </td>
                  <td className="hidden md:table-cell no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signature Section */}
          <div className="hidden print:flex justify-between mt-24 px-10">
            <div className="w-48 border-t-2 border-slate-900 pt-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest">Accountant Signature</p>
            </div>
            <div className="w-48 border-t-2 border-slate-900 pt-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest">Party Signature</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[24px] md:rounded-[32px] p-10 md:p-20 text-center flex flex-col items-center justify-center mb-10">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <i className="fas fa-book-open text-3xl md:text-4xl text-slate-300"></i>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">No Ledger Selected</h2>
          <p className="text-sm md:text-base text-slate-500 font-medium max-w-sm px-4">
            Please select a <strong>Party Type</strong> and choose a <strong>Name</strong> from the filters above to generate a statement.
          </p>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[24px] md:rounded-[32px] shadow-2xl overflow-hidden animate-slideUp">
            <div className="px-6 py-5 md:px-10 md:py-6 border-b border-slate-50 bg-sky-50/50 flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-black text-slate-900">{modalMode === 'add' ? 'New Manual Entry' : 'Edit Entry'}</h2>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form className="p-6 md:p-10 space-y-4 md:space-y-5" onSubmit={handleSaveEntry}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Date</label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-sky-600/30 focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1">Description</label>
                <input 
                  type="text" 
                  value={formData.desc}
                  onChange={(e) => setFormData({...formData, desc: e.target.value})}
                  className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-medium focus:bg-white focus:border-sky-600/30 focus:outline-none transition-all"
                  placeholder="E.g. Payment Received via Cash"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1 text-rose-600">Debit (+)</label>
                  <input 
                    type="number" 
                    value={formData.debit}
                    onChange={(e) => setFormData({...formData, debit: e.target.value, credit: e.target.value ? '' : formData.credit})}
                    className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-bold focus:bg-white focus:border-rose-600/30 focus:outline-none transition-all"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest ml-1 text-emerald-600">Credit (-)</label>
                  <input 
                    type="number" 
                    value={formData.credit}
                    onChange={(e) => setFormData({...formData, credit: e.target.value, debit: e.target.value ? '' : formData.debit})}
                    className="w-full px-4 py-3 md:px-5 md:py-3.5 bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl text-sm font-bold focus:bg-white focus:border-emerald-600/30 focus:outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="pt-4 md:pt-6 flex flex-col sm:flex-row gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="order-2 sm:order-1 flex-grow py-4 rounded-xl md:rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="order-1 sm:order-2 flex-grow bg-slate-900 text-white py-4 rounded-xl md:rounded-2xl font-black text-base shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .bg-white { box-shadow: none !important; border: none !important; }
          .main-content { padding: 0 !important; }
          .rounded-[32px] { border-radius: 12px !important; }
        }
      `}</style>
    </DashboardLayout>
    
  );
}

export default Ledger;
