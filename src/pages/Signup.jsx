import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase.js';

function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username
          }
        }
      });

      if (signupError) throw signupError;

      if (data.user) {
        toast.success('Welcome! Account created successfully.');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle_at_top_right,_#e2e8f0,_#f8fafc)] p-6 font-['Plus_Jakarta_Sans']">
      <div className="w-full max-w-[450px] bg-white/95 backdrop-blur-md border border-white/50 p-10 rounded-[24px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] animate-[slideUp_0.6s_ease-out]">
        
        <div className="text-center mb-10">
          <Link to="/" className="no-underline">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-xl font-extrabold rounded-2xl mx-auto mb-4 shadow-lg shadow-indigo-200">
              FT
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Join Faran Traders Management</p>
        </div>


        <form onSubmit={handleSignup} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 ml-1 uppercase tracking-wider">Full Name</label>
              <input 
                name="fullName"
                type="text" 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 ml-1 uppercase tracking-wider">Username</label>
              <input 
                name="username"
                type="text" 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                placeholder="johndoe12"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 ml-1 uppercase tracking-wider">Email Address</label>
            <input 
              name="email"
              type="email" 
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-xs font-bold text-slate-900 ml-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 bg-slate-100 border-2 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-base hover:bg-indigo-600 hover:shadow-xl transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-8 text-[13px] font-medium text-slate-500">
          Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign In</Link>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Signup;
