import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClearAuthOnMount } from '../../hooks/useSecurityHooks';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './AdminLogin.css'; // Switch to specialized premium CSS
import logo from '../../../assets/logo.png';
import ThemeToggle from '../../components/common/ThemeToggle';

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
        <div className="auth-page">
            <div className="auth-theme-toggle">
                <ThemeToggle />
            </div>
            <div className="auth-container">
                <div className="auth-left">
                    <div className="auth-brand">
                        <img src={logo} alt="RxPlus" className="brand-logo-img" />
                        <h1>RxPlus</h1>
                        <p>Admin Portal</p>
                    </div>
                </div>

                <div className="admin-auth-right">
                    <div className="admin-form-container">
                        <div className="admin-auth-header">
                            <h2>Admin Login</h2>
                            <p>Secure access for system administrators</p>
                        </div>

                        {error && <div className="admin-auth-error">{error}</div>}

                        <form onSubmit={handleSubmit} className="admin-auth-form">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Email Address</label>
                                <div className="admin-input-wrapper">
                                    <FiMail className="admin-input-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        className="admin-form-input"
                                        placeholder="Enter admin email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label className="admin-form-label">Password</label>
                                <div className="admin-input-wrapper">
                                    <FiLock className="admin-input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        className="admin-form-input"
                                        placeholder="Enter password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="admin-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="admin-btn-primary" disabled={loading}>
                                {loading ? <span className="admin-spinner" /> : 'Sign In as Admin'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;





