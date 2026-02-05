import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiActivity, FiEye, FiEyeOff, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Auth.css';

function ClinicRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({ ...formData, role: 'pharmacist' });
      toast.success('Clinic account created successfully');
      navigate('/pharmacist');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding (Green for Clinic) */}
        <div className="auth-left" style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' }}>
          <div className="auth-brand">
            <div className="brand-logo">🏥</div>
            <h1>RxHub Clinic</h1>
            <p>Pharmacist & Clinic Portal</p>
          </div>
          <div className="auth-features">
            <div className="feature">
              <span className="feature-icon">📦</span>
              <span>Inventory Control</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📝</span>
              <span>Prescription Management</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔍</span>
              <span>Medicine Tracking</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-right">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>Clinic Registration</h2>
              <p>Register a new clinic or pharmacist</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Clinic / Pharmacist Name</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Official Name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email address</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="clinic@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-wrapper">
                  <FiPhone className="input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Password"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Confirm"
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
                style={{ background: '#ea580c', borderColor: '#ea580c' }}
              >
                {loading ? 'Creating Account...' : 'Register Clinic'}
              </button>
            </form>

            <div className="auth-footer">
              <p>Back to <Link to="/login" style={{ color: '#ea580c' }}>Login</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClinicRegister;





