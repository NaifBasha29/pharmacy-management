import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { FiAlertCircle, FiArrowLeft, FiMail } from 'react-icons/fi';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">💊</div>
          <span className="font-bold text-xl text-gray-900">PharmaCare</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
            <FiMail className="text-blue-600" size={22} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Check your email</h2>
          <p className="text-gray-500 mb-2">We sent a 6-digit code to</p>
          {email && <p className="text-sm font-semibold text-gray-800 mb-6 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">{email}</p>}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              <FiAlertCircle className="flex-shrink-0 mt-0.5" size={16} /><span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Verification Code</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                required
                className="w-full text-center text-2xl font-mono tracking-[0.5em] py-4 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-colors bg-white"
              />
            </div>
            <button type="submit" disabled={loading || otp.length < 6} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
              {loading ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : "Verify Code"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <FiArrowLeft size={14} /> Resend code
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
