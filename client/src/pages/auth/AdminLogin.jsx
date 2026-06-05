import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClearAuthOnMount } from '../../hooks/useSecurityHooks';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiShield } from 'react-icons/fi';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  useClearAuthOnMount();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await loginAdmin(formData);
    if (result.success) {
      if (result.user.role === 'admin') navigate('/admin');
      else setError('Access denied: Not an administrator');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-slate-800 to-slate-900 flex-col justify-between p-12 relative overflow-hidden border-r border-slate-700">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-blue-500/5 rounded-full" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl">💊</div>
            <span className="text-white font-bold text-xl">PharmaCare</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-3 py-1.5 mb-6">
            <FiShield size={13} className="text-blue-400" />
            <span className="text-blue-300 text-xs font-semibold tracking-wide uppercase">Admin Portal</span>
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight mb-4">System Administration</h1>
          <p className="text-slate-400 leading-relaxed">Secure access for authorized administrators. All sessions are logged and monitored.</p>
        </div>
        <div className="relative space-y-3">
          {[["📊","Full analytics & reporting"],["👥","User & role management"],["⚙️","System configuration"],["📋","Audit trail & compliance"]].map(([icon,text]) => (
            <div key={text} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/5">
              <span className="text-base">{icon}</span>
              <span className="text-slate-300 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-900">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg">💊</div>
            <span className="font-bold text-xl text-white">PharmaCare Admin</span>
          </div>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
            <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6">
              <FiShield className="text-blue-400" size={22} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Admin Sign In</h2>
            <p className="text-slate-400 mb-8 text-sm">Secure access for system administrators</p>

            {error && (
              <div className="flex items-start gap-3 bg-red-900/30 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                <FiAlertCircle className="flex-shrink-0 mt-0.5" size={16} /><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@pharmacy.com" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" required className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-500 transition-colors" />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-2">
                {loading ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : 'Sign In as Admin'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← Back to Patient Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
