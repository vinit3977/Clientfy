import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setError("");

    localStorage.setItem("resetEmail", email);

    navigate("/reset-password");
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
            <h2>Forgot Password?</h2>
            <p>
              Enter your email and we'll help you reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {error && (
                <span className="error-message">
                  {error}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="auth-button"
            >
              Continue
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

export default ForgotPassword;