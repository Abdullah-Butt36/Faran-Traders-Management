import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase.js';

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (authError) throw authError;

      if (data.user) {
        toast.success('Welcome back! Login successful.');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle_at_top_right,_#e2e8f0,_#f8fafc)] p-6 font-['Plus_Jakarta_Sans']">
      <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-md border border-white/50 p-10 rounded-[24px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] animate-[slideUp_0.6s_ease-out]">
        
        {/* Brand Section */}
        <div className="text-center mb-10">
          <Link to="/" className="no-underline">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-xl font-extrabold rounded-2xl mx-auto mb-4 shadow-lg shadow-indigo-200 hover:scale-105 transition-transform">
              FT
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Faran Traders</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Secure Management Portal</p>
        </div>


        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 ml-1">Email / Username</label>
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border-2 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all peer disabled:opacity-50"
                placeholder="Enter email or username"
                required
              />
              <i className="fas fa-user absolute left-4 text-slate-400 text-base peer-focus:text-indigo-500 transition-colors"></i>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 ml-1">Password</label>
            <div className="relative flex items-center">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-12 pr-12 py-3.5 bg-slate-100 border-2 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all peer disabled:opacity-50"
                placeholder="••••••••"
                required
              />
              <i className="fas fa-lock absolute left-4 text-slate-400 text-base peer-focus:text-indigo-500 transition-colors"></i>
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none disabled:opacity-50"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-2xl font-bold text-base hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-200 active:translate-y-0 transition-all mt-4 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Signing In...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-8 text-[13px] font-medium text-slate-400">
          <p>&copy; {new Date().getFullYear()} Faran Traders • Version 3.0</p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default Login;
