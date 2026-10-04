import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { validateResetToken, confirmPasswordReset } from "../services/authService";
import "./Auth.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeParams = useParams();

  // Support both query parameters (/reset-password?uid=...&token=...)
  // and path parameters (/reset-password/:uid/:token)
  const initialUid = searchParams.get("uid") || routeParams.uid || "";
  const initialToken = searchParams.get("token") || routeParams.token || "";

  const [uid, setUid] = useState(initialUid);
  const [token, setToken] = useState(initialToken);
  const [showManualTokens, setShowManualTokens] = useState(false);

  const [validationStatus, setValidationStatus] = useState("idle"); // idle | validating | valid | invalid | missing
  const [userEmail, setUserEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Validate token whenever uid and token are provided
  useEffect(() => {
    if (!uid || !token) {
      setValidationStatus("missing");
      return;
    }

    let isMounted = true;
    setValidationStatus("validating");
    setErrorMessage("");

    validateResetToken({ uid, token })
      .then((res) => {
        if (!isMounted) return;
        if (res.valid) {
          setValidationStatus("valid");
          setUserEmail(res.email || "");
        } else {
          setValidationStatus("invalid");
          setErrorMessage(res.error || "This password reset link is invalid or has expired.");
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setValidationStatus("invalid");
        setErrorMessage("Failed to verify reset link. Please check your connection.");
      });

    return () => {
      isMounted = false;
    };
  }, [uid, token]);

  // Countdown timer when password successfully reset
  useEffect(() => {
    if (!isSuccess) return;

    if (countdown <= 0) {
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isSuccess, countdown, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uid.trim() || !token.trim()) {
      setErrorMessage("Reset token or user identification is missing.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await confirmPasswordReset({
        uid: uid.trim(),
        token: token.trim(),
        password: formData.password,
      });

      if (result.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(result.error || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setErrorMessage("An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
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
            <h2>{isSuccess ? "Password Reset!" : "Reset Password"}</h2>
            <p>
              {isSuccess
                ? "Your new password has been confirmed."
                : userEmail
                ? `Creating a new password for ${userEmail}`
                : "Enter and confirm your new account password below."}
            </p>
          </div>

          {/* Success screen */}
          {isSuccess ? (
            <div className="reset-success-container">
              <div className="auth-success-banner" role="status">
                Your password has been reset successfully!
              </div>

              <p style={{ fontSize: "14px", color: "var(--color-slate)", margin: "16px 0", lineHeight: "1.6" }}>
                You can now log in with your new password. Redirecting to login in <strong>{countdown}</strong> second{countdown !== 1 ? "s" : ""}...
              </p>

              <button
                type="button"
                className="auth-button"
                onClick={() => navigate("/login")}
                style={{ marginTop: "12px" }}
              >
                Go to Login Now →
              </button>
            </div>
          ) : validationStatus === "validating" ? (
            /* Token Validating loader */
            <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--color-slate)" }}>
              <p style={{ fontSize: "15px", fontWeight: "500", marginBottom: "8px" }}>
                Verifying password reset link...
              </p>
              <p style={{ fontSize: "13px", opacity: 0.8 }}>
                Please wait while we validate your security token.
              </p>
            </div>
          ) : validationStatus === "invalid" ? (
            /* Invalid or Expired Token view */
            <div>
              <div className="auth-error-banner" role="alert">
                {errorMessage || "This password reset link is invalid or has expired."}
              </div>

              <p style={{ fontSize: "14px", color: "var(--color-slate)", margin: "18px 0", lineHeight: "1.6" }}>
                Password reset links are single-use and expire after 24 hours. Please request a new link to proceed.
              </p>

              <Link
                to="/forgot-password"
                className="auth-button"
                style={{
                  display: "block",
                  textAlign: "center",
                  lineHeight: "44px",
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                Request a New Reset Link
              </Link>
            </div>
          ) : validationStatus === "missing" && !showManualTokens ? (
            /* Missing Token view */
            <div>
              <div className="auth-error-banner" role="alert">
                Missing password reset token.
              </div>

              <p style={{ fontSize: "14px", color: "var(--color-slate)", margin: "18px 0", lineHeight: "1.6" }}>
                To reset your password, please use the reset link sent to your email address, or request a new one below.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                <Link
                  to="/forgot-password"
                  className="auth-button"
                  style={{
                    display: "block",
                    textAlign: "center",
                    lineHeight: "44px",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  Request Reset Link
                </Link>

                <button
                  type="button"
                  onClick={() => setShowManualTokens(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-slate)",
                    fontSize: "12px",
                    textDecoration: "underline",
                    cursor: "pointer",
                    padding: "8px",
                  }}
                >
                  Have a token? Enter it manually
                </button>
              </div>
            </div>
          ) : (
            /* Main Reset Form */
            <form onSubmit={handleSubmit} noValidate>

              {errorMessage && (
                <div className="auth-error-banner" role="alert">
                  {errorMessage}
                </div>
              )}

              {/* Manual token inputs if opened */}
              {showManualTokens && (
                <>
                  <div className="form-group">
                    <label htmlFor="uid">User ID / UID</label>
                    <input
                      id="uid"
                      type="text"
                      placeholder="e.g. MQ"
                      value={uid}
                      onChange={(e) => setUid(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="token">Reset Token</label>
                    <input
                      id="token"
                      type="text"
                      placeholder="Paste token from email"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* New Password */}
              <div className="form-group">
                <label htmlFor="password">
                  New Password
                </label>

                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter at least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    style={{ paddingRight: "44px" }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--color-slate)",
                      fontSize: "16px",
                      cursor: "pointer",
                      padding: "4px 8px",
                      lineHeight: "1",
                    }}
                  >
                    {showPassword ? "◉" : "◌"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirm New Password
                </label>

                <div style={{ position: "relative" }}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter your new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    style={{ paddingRight: "44px" }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--color-slate)",
                      fontSize: "16px",
                      cursor: "pointer",
                      padding: "4px 8px",
                      lineHeight: "1",
                    }}
                  >
                    {showConfirmPassword ? "◉" : "◌"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
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

export default ResetPassword;