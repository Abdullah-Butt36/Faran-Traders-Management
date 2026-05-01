import { useState } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: 'Organic Cotton Tee is below minimum level (8 units left).',
      is_read: false,
      time: '5 minutes ago'
    },
    {
      id: 2,
      type: 'new_sale',
      title: 'New Sale Invoice',
      message: 'Invoice INV-2024-001 generated for Ali Ahmed (₨ 12,500).',
      is_read: true,
      time: '2 hours ago'
    },
    {
      id: 3,
      type: 'payment_received',
      title: 'Payment Received',
      message: '₨ 45,000 received from Sara Khan.',
      is_read: false,
      time: '1 day ago'
    },
    {
      id: 4,
      type: 'expense_alert',
      title: 'Large Expense Logged',
      message: '₨ 45,000 recorded for Warehouse Rent.',
      is_read: true,
      time: '3 days ago'
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'low_stock': return { icon: 'fa-exclamation-triangle', color: 'text-amber-500', bg: 'bg-amber-50' };
      case 'new_sale': return { icon: 'fa-shopping-cart', color: 'text-indigo-600', bg: 'bg-indigo-50' };
      case 'payment_received': return { icon: 'fa-check-circle', color: 'text-emerald-600', bg: 'bg-emerald-50' };
      case 'expense_alert': return { icon: 'fa-money-bill-wave', color: 'text-rose-600', bg: 'bg-rose-50' };
      default: return { icon: 'fa-bell', color: 'text-slate-400', bg: 'bg-slate-50' };
    }
  };

  return (
    <DashboardLayout pageTitle="Notifications">
      <div className="max-w-4xl mx-auto px-2 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
              <i className="fas fa-bell text-indigo-600"></i> Notifications
            </h1>
            <p className="text-slate-500 font-medium mt-1">Stay updated with your business activities</p>
          </div>
          <button 
            onClick={markAllRead}
            className="text-xs font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl transition-all"
          >
            Mark all as read
          </button>
        </div>

        <div className="space-y-4 mb-10">
          {notifications.length > 0 ? (
            notifications.map((noti) => {
              const style = getIcon(noti.type);
              return (
                <div 
                  key={noti.id} 
                  className={`group relative bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border-2 transition-all flex gap-4 md:gap-6 ${noti.is_read ? 'border-slate-50 opacity-70' : 'border-indigo-100 shadow-lg shadow-indigo-50'}`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl ${style.bg} ${style.color} flex items-center justify-center text-xl md:text-2xl`}>
                    <i className={`fas ${style.icon}`}></i>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
                      <h3 className={`font-black text-sm md:text-base ${noti.is_read ? 'text-slate-600' : 'text-slate-900'}`}>
                        {noti.title}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {noti.time}
                      </span>
                    </div>
                    <p className={`text-xs md:text-sm font-medium leading-relaxed ${noti.is_read ? 'text-slate-400' : 'text-slate-600'}`}>
                      {noti.message}
                    </p>
                    
                    <div className="mt-4 flex items-center gap-3">
                      {!noti.is_read && (
                        <button 
                          onClick={() => markAsRead(noti.id)}
                          className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(noti.id)}
                        className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {!noti.is_read && (
                    <div className="absolute top-6 right-6 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-[32px] border-2 border-dashed border-slate-100 p-20 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-bell-slash text-3xl text-slate-200"></i>
              </div>
              <h2 className="text-xl font-black text-slate-900">No Notifications</h2>
              <p className="text-slate-400 font-medium mt-2">We'll notify you when something happens!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Notifications;
