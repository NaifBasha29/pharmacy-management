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

    // Clear all session data on mount
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
            else {
                setError('Access denied: Not an administrator');
            }
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left dark panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>
                <div className="relative">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-blue-500/20 border border-blue-400/30 rounded-xl flex items-center justify-center text-xl">💊</div>
                        <span className="text-white font-bold text-xl">PharmaCare</span>
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><FiShield className="text-white" size={18} /></div>
                        <span className="text-blue-300 text-sm font-medium uppercase tracking-widest">Admin Portal</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white leading-tight mb-4">System<br />Administration</h1>
                    <p className="text-slate-400 text-lg leading-relaxed">Manage inventory, users, orders, and system configuration from a unified control panel.</p>
                </div>
                <div className="relative grid grid-cols-2 gap-3">
                    {[["📦","Inventory Control"],["👥","User Management"],["📊","Real-time Reports"],["🔒","Audit & Compliance"]].map(([icon,text]) => (
                        <div key={text} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-2">
                            <span>{icon}</span><span className="text-slate-300 text-xs font-medium">{text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="flex lg:hidden items-center gap-3 mb-8">
                        <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-white text-lg">💊</div>
                        <span className="font-bold text-xl text-gray-900">PharmaCare Admin</span>
                    </div>
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                            <FiShield size={12} /> Secure Admin Access
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Admin Sign In</h2>
                        <p className="text-gray-500">Access restricted to system administrators</p>
                    </div>
                    {error && (
                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                            <FiAlertCircle className="flex-shrink-0 mt-0.5" size={16} /><span>{error}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                            <div className="relative">
                                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@pharmacare.com" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-colors bg-white" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-colors bg-white" />
                                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-slate-800 hover:bg-slate-900 active:bg-black disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                            {loading ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : "Sign in as Admin"}
                        </button>
                    </form>
                    <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
                        <Link to="/login" className="hover:text-gray-600 transition-colors">Patient Portal</Link>
                        <span>·</span>
                        <Link to="/clinic/login" className="hover:text-gray-600 transition-colors">Clinic Portal</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
