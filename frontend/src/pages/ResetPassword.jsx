import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function ResetPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");

    localStorage.removeItem("resetEmail");

    navigate("/login");
  };

  return (
    <div className="auth-page simple-auth-page">
      <div className="auth-container">

        <div className="auth-brand">
          <div className="brand-logo">C</div>
          <h1>Clientify</h1>
        </div>

        <div className="auth-card">

          <div className="auth-header">
            <h2>Reset Password</h2>
            <p>
              Create a new password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="password">
                New Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {error && (
              <span className="error-message">
                {error}
              </span>
            )}

            <button
              type="submit"
              className="auth-button"
            >
              Reset Password
            </button>

          </form>

          <div className="auth-footer">
            <Link to="/login">
              ← Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ResetPassword;