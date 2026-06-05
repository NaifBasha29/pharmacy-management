import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminType, setAdminType] = useState('admin');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(formData.email, formData.password);
    if (result.success) {
      const { role } = result.user;
      if (role === 'admin') navigate('/admin');
      else if (role === 'pharmacist') navigate('/pharmacist');
      else navigate('/user');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const toggleAdminMode = () => {
    setIsAdminMode(v => !v);
    setFormData({ email: '', password: '' });
    setError('');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">💊</div>
            <span className="text-white font-bold text-xl">PharmaCare</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">Your health,<br />our priority</h1>
          <p className="text-blue-100 text-lg leading-relaxed">Order medicines, track prescriptions, and manage your health — all in one place.</p>
        </div>
        <div className="relative space-y-3">
          {[["🛒","Order medicines online with ease"],["📦","Upload & track prescriptions instantly"],["🤖","AI-powered symptom checker"],["🔔","Real-time order status updates"]].map(([icon,text]) => (
            <div key={text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
              <span className="text-lg">{icon}</span>
              <span className="text-white/90 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-6">
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg">💊</div>
            <span className="font-bold text-xl text-gray-900">PharmaCare</span>
          </div>

          {isAdminMode && (
            <button onClick={toggleAdminMode} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
              <FiArrowLeft size={14} /> Back to Patient Login
            </button>
          )}

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {isAdminMode ? (adminType === 'admin' ? 'Admin Sign In' : 'Clinic Sign In') : 'Welcome back'}
            </h2>
            <p className="text-gray-500">
              {isAdminMode ? 'Secure access for system administrators' : 'Sign in to your patient portal'}
            </p>
          </div>

          {isAdminMode && (
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              {['admin','clinic'].map(t => (
                <button key={t} onClick={() => setAdminType(t)} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${adminType === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {t === 'admin' ? 'Admin' : 'Clinic'}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              <FiAlertCircle className="flex-shrink-0 mt-0.5" size={16} /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-colors bg-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                {!isAdminMode && <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Forgot password?</Link>}
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-colors bg-white" />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
              {loading ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : 'Sign In'}
            </button>
          </form>

          {!isAdminMode && (
            <div className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-700 mb-2">Demo credentials</p>
              <p>Email: <span className="font-mono font-medium">Psycbaka@gmail.com</span></p>
              <p>Password: <span className="font-mono font-medium">Password@123</span></p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            {!isAdminMode && (
              <p className="text-sm text-gray-500">Don&apos;t have an account?{' '}<Link to="/register" className="text-blue-600 font-medium hover:text-blue-700">Create account</Link></p>
            )}
            <button onClick={toggleAdminMode} className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2">
              {isAdminMode ? 'Patient login' : 'Admin Portal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
