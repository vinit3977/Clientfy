import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/authService";
import "./Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const result = await requestPasswordReset(trimmedEmail);

      if (result.success) {
        setSuccessInfo({
          email: trimmedEmail,
          message: result.message,
          debugResetUrl: result.debugResetUrl,
          uid: result.uid,
          token: result.token,
        });
      } else {
        setError(result.error || "Unable to send reset email. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please check your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAnother = () => {
    setSuccessInfo(null);
    setEmail("");
    setError("");
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
            <h2>{successInfo ? "Check Your Email" : "Forgot Password?"}</h2>
            <p>
              {successInfo
                ? "We have generated a password reset request for your account."
                : "Enter your registered email address and we'll send you instructions to reset your password."}
            </p>
          </div>

          {error && (
            <div className="auth-error-banner" role="alert">
              {error}
            </div>
          )}

          {successInfo ? (
            <div className="reset-success-container">
              <div className="auth-success-banner" role="status">
                {successInfo.message}
              </div>

              <p style={{ fontSize: "14px", color: "var(--color-slate)", lineHeight: "1.6", margin: "16px 0" }}>
                We sent an email to <strong>{successInfo.email}</strong> with a secure link to create a new password. The link is valid for 24 hours.
              </p>

              {/* Dev mode convenience button when backend returns debug URL */}
              {successInfo.debugResetUrl && (
                <div style={{ margin: "20px 0", padding: "14px", background: "rgba(162, 192, 221, 0.15)", borderRadius: "10px", border: "1px dashed var(--color-blue)" }}>
                  <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "var(--color-slate)", fontWeight: "600" }}>
                    🛠 Local Development Shortcut:
                  </p>
                  <Link
                    to={`/reset-password?uid=${successInfo.uid}&token=${successInfo.token}`}
                    className="auth-button"
                    style={{
                      display: "block",
                      textAlign: "center",
                      lineHeight: "44px",
                      textDecoration: "none",
                      fontSize: "14px",
                    }}
                  >
                    Open Password Reset Link →
                  </Link>
                </div>
              )}

              <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleResetAnother}
                  className="auth-button"
                  style={{
                    background: "transparent",
                    color: "var(--color-cab-sav)",
                    border: "1px solid var(--color-cab-sav)",
                  }}
                >
                  Resend or Try Another Email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={isSubmitting}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}
              </button>

            </form>
          )}

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