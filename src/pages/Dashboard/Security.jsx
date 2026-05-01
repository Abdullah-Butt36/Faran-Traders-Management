import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

function Security() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error('Passwords do not match!');
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });
      if (error) throw error;
      toast.success('Password changed successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Security">
      <div className="max-w-3xl mx-auto px-2 sm:px-0">
        <div className="mb-8 md:mb-10 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white text-xl">
              <i className="fas fa-shield-alt"></i>
            </div>
            Security Settings
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-sm md:text-lg ml-1">Protect your account with a strong password</p>
        </div>

        <div className="bg-white rounded-[24px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-amber-500/5 overflow-hidden">
          <div className="p-6 md:p-10 border-b border-slate-50 bg-amber-50/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
                <i className="fas fa-key text-xl"></i>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">Update Password</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Last changed: Never</p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="p-6 md:p-10 space-y-6 md:space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Current Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type={showPass.current ? "text" : "password"}
                  className="w-full pl-12 pr-14 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-amber-500/30 focus:outline-none transition-all placeholder:text-slate-300"
                  placeholder="Type current password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass({...showPass, current: !showPass.current})}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors"
                >
                  <i className={`fas ${showPass.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 border-t border-slate-50 pt-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">New Password</label>
                <div className="relative">
                  <i className="fas fa-shield-virus absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type={showPass.new ? "text" : "password"}
                    className="w-full pl-12 pr-14 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-amber-500/30 focus:outline-none transition-all placeholder:text-slate-300"
                    placeholder="New password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    minLength={6}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass({...showPass, new: !showPass.new})}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    <i className={`fas ${showPass.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                <div className="relative">
                  <i className="fas fa-check-double absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type={showPass.confirm ? "text" : "password"}
                    className="w-full pl-12 pr-14 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-amber-500/30 focus:outline-none transition-all placeholder:text-slate-300"
                    placeholder="Confirm new password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    <i className={`fas ${showPass.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-grow bg-amber-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-amber-600 shadow-xl shadow-amber-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-xs"
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-lock"></i>}
                Update Password
              </button>
              <button 
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
              >
                Back to Dashboard
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-2">
            <i className="fas fa-lightbulb text-amber-500"></i> Password Tip
          </h4>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Use at least 8 characters with a mix of letters, numbers, and symbols to ensure your business data remains safe. Avoid using common words or personal information.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Security;
