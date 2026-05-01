import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    username: ''
  });

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        username: user.email?.split('@')[0] || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profile.fullName }
      });
      if (error) throw error;
      toast.success('Profile updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="My Profile">
      <div className="max-w-3xl mx-auto px-2 sm:px-0">
        <div className="mb-8 md:mb-10 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl">
              <i className="fas fa-user"></i>
            </div>
            My Profile
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-sm md:text-lg ml-1">Manage your personal identification and details</p>
        </div>

        <div className="bg-white rounded-[24px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-indigo-500/5 overflow-hidden">
          <div className="p-6 md:p-10 border-b border-slate-50 bg-slate-50/30">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-200">
                {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">{profile.fullName || 'User Name'}</h2>
                <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">{profile.username}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="p-6 md:p-10 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600/30 focus:outline-none transition-all placeholder:text-slate-300"
                  placeholder="Enter your full name"
                  value={profile.fullName}
                  onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2 opacity-60">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Username</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-4 bg-slate-100 border-2 border-transparent rounded-2xl text-sm font-black text-slate-500 outline-none cursor-not-allowed"
                  value={profile.username}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2 opacity-60">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="email" 
                  className="w-full pl-12 pr-5 py-4 bg-slate-100 border-2 border-transparent rounded-2xl text-sm font-black text-slate-500 outline-none cursor-not-allowed"
                  value={profile.email}
                  disabled
                />
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-1">Primary email cannot be changed for security</p>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-grow bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-xs"
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                Save Profile Changes
              </button>
              <button 
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;
