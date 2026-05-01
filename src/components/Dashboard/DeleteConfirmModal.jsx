import React from 'react';

function DeleteConfirmModal({ isOpen, onClose, onConfirm, title = "Delete Record?", message = "Are you sure you want to delete this record? This action cannot be undone." }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4 sm:p-6 animate-fadeIn no-print">
      <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-slideUp">
        <div className="p-6 md:p-8 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">{title}</h2>
          <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">{message}</p>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all border border-slate-200"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}

export default DeleteConfirmModal;
