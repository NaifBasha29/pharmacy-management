import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClearAuthOnMount } from '../../hooks/useSecurityHooks';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './AdminPortal.css'; // Renamed to break cache
import logo from '../../../assets/logo.png';

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
        <div className="admin-portal-page">
            <div className="admin-portal-container">
                <div className="admin-portal-left">
                    <div className="crest-bg" />
                    <div className="wave-decoration">
                        <svg viewBox="0 0 500 500" preserveAspectRatio="none">
                            <path d="M0,100 C150,200 350,0 500,100 L500,00 L0,0 Z" fill="rgba(212, 175, 55, 0.05)" />
                        </svg>
                    </div>
                    
                    <div className="admin-brand">
                        <div className="brand-logo-container">
                            <img src={logo} alt="Pharma Care" className="brand-logo-img" />
                        </div>
                    </div>
                </div>

                <div className="admin-portal-right">
                    <div className="admin-portal-form-container">
                        <div className="admin-portal-header">
                            <h2>Admin Login</h2>
                            <p>Secure access for system administrators</p>
                        </div>

                        {error && <div className="admin-portal-error">{error}</div>}

                        <form onSubmit={handleSubmit} className="admin-portal-form">
                            <div className="admin-portal-form-group">
                                <label className="admin-portal-form-label">Email Address</label>
                                <div className="admin-portal-input-wrapper">
                                    <FiMail className="admin-portal-input-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        className="admin-portal-input"
                                        placeholder="Enter admin email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="admin-portal-form-group">
                                <label className="admin-portal-form-label">Password</label>
                                <div className="admin-portal-input-wrapper">
                                    <FiLock className="admin-portal-input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        className="admin-portal-input"
                                        placeholder="Enter password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="admin-portal-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="admin-portal-btn-primary" disabled={loading}>
                                {loading ? <span className="admin-portal-spinner" /> : 'Sign In as Admin'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
