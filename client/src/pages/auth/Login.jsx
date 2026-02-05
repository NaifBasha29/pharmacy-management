import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import './Auth.css';
import phamLogo from '../../../assets/phamlogo.png';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminType, setAdminType] = useState('admin'); // 'admin' or 'clinic'
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
    setIsAdminMode(!isAdminMode);
    setFormData({ email: '', password: '' });
    setError('');
  };

  const getHeaderText = () => {
    if (!isAdminMode) {
      return { title: 'Welcome Back', subtitle: 'Sign in to your account to continue' };
    }
    return {
      title: adminType === 'admin' ? 'Admin Login' : 'Clinic Admin Login',
      subtitle: adminType === 'admin' ? 'Access system administration' : 'Access clinic management'
    };
  };

  const headerText = getHeaderText();

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <img src={phamLogo} alt="RxHub" className="brand-logo-img" />
            <h1>RxHub Plus</h1>
            <p>Your trusted pharmacy management solution</p>
          </div>
          <div className="auth-features">
            <div className="feature">
              <span className="feature-icon">🏥</span>
              <span>Complete Pharmacy Management</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>Real-time Analytics & Reports</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔐</span>
              <span>Secure & Role-based Access</span>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            {isAdminMode && (
              <button className="back-to-user-btn" onClick={toggleAdminMode}>
                <FiArrowLeft /> Back to User Login
              </button>
            )}

            <div className="auth-header">
              <h2>{headerText.title}</h2>
              <p>{headerText.subtitle}</p>
            </div>

            {/* Admin/Clinic Toggle - Only visible in admin mode */}
            {isAdminMode && (
              <div className="admin-toggle-wrapper">
                <div className="admin-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${adminType === 'admin' ? 'active' : ''}`}
                    onClick={() => setAdminType('admin')}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${adminType === 'clinic' ? 'active' : ''}`}
                    onClick={() => setAdminType('clinic')}
                  >
                    Clinic
                  </button>
                  <div className={`toggle-slider ${adminType === 'clinic' ? 'slide-right' : ''}`} />
                </div>
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder={isAdminMode ? `Enter ${adminType} email` : 'Enter your email'}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Sign In'}
              </button>
            </form>

            {!isAdminMode && (
              <div className="auth-footer">
                <p>Don't have an account? <Link to="/register">Create Account</Link></p>
              </div>
            )}

            {/* Admin link - Only visible in user mode */}
            {!isAdminMode && (
              <div className="admin-link-wrapper">
                <button className="admin-link" onClick={toggleAdminMode}>
                  Admin?
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;





