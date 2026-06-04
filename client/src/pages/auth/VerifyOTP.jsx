import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Auth.css';

const VerifyOTP = () => {
  const loc = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const email = loc.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.verifyOTP({ email, otp });
      const token = res.data?.data?.token;
      if (!token) throw new Error('No token returned');
      navigate('/reset-password', { state: { token } });
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <div className="brand-logo">💊</div>
            <h1>Pharma Care</h1>
            <p>Verify code</p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>Verify OTP</h2>
              <p>Enter the 6-digit code sent to your email</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-wrapper">
                  <input type="email" className="form-input" value={email} readOnly />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">OTP Code</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    maxLength={6}
                    name="otp"
                    className="form-input"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Verify'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
