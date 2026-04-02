import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useClearAuthOnMount } from "../../hooks/useSecurityHooks";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import "./Auth.css";
import logo from "../../../assets/logo.png";

const PatientLogin = () => {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { loginPatient } = useAuth();
  const navigate = useNavigate();

  // Clear all session data on mount - ensures fresh login required
  useClearAuthOnMount();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // API expects { identifier, password } where identifier can be email or patientId
    const payload = { identifier: formData.identifier, password: formData.password };
    const result = await loginPatient(payload);

    if (result.success) {
      if (["patient", "user"].includes(result.user.role)) {
        navigate("/user");
      } else {
        setError("Access denied: User is not a patient");
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <img src={logo} alt="RxPlus" className="brand-logo-img" />
            <h1>RxPlus</h1>
            <p>Patient Portal</p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>Patient Login</h2>
              <p>View your prescriptions and orders</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email or Patient ID</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    name="identifier"
                    className="form-input"
                    placeholder="Enter email or Patient ID (e.g. PAT000123 or you@example.com)"
                    value={formData.identifier}
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
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-input"
                    placeholder="Enter password"
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

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : "Sign In as Patient"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;
