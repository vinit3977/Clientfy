import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Employee",
    terms: false,
  });

  const [errors, setErrors] = useState({});

  // Loading state — prevents duplicate submissions
  const [loading, setLoading] = useState(false);

  // General authentication error (not tied to a specific field)
  const [authError, setAuthError] = useState("");

  // Success message shown when email confirmation is required
  const [successMessage, setSuccessMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /* =====================================================
     HANDLE INPUT CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Remove error when user starts correcting the field
    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };


  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {
    const newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Enter a valid name";
    }


    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address";
    }


    // Password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }


    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password";
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }


    // Terms
    if (!formData.terms) {
      newErrors.terms =
        "Please accept the Terms & Conditions";
    }

    return newErrors;
  };


  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Step 1: Run existing frontend validation ───────────────────────────
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setAuthError("");
    setSuccessMessage("");
    setLoading(true);

    // ── Step 2: Call Supabase Auth via authService ─────────────────────────
    try {
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (!result.success) {
        // Map field-specific errors back into the existing errors state
        if (result.field) {
          setErrors({ [result.field]: result.error });
        } else {
          setAuthError(result.error);
        }
        return;
      }

      // ── Step 3: Handle confirmation requirement ──────────────────────────
      if (result.requiresConfirmation) {
        /*
          Supabase requires email confirmation.
          Do NOT redirect to dashboard or store fake session.
        */
        setSuccessMessage(result.message);
        return;
      }

      // ── Step 4: Confirmed session — proceed to dashboard ─────────────────
      navigate("/dashboard");

    } catch (unexpectedError) {
      // Guard against unexpected runtime errors
      console.error("Registration unexpected error:", unexpectedError);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  /* =====================================================
     JSX
  ===================================================== */

  return (
    <div className="auth-page">

      <div className="auth-wrapper auth-register">


        {/* =================================================
            LEFT IMAGE
        ================================================= */}

        <section className="auth-visual">

          <img
            src="/clientify-auth-left-reference.png"
            alt="Clientify workspace"
            className="visual-image"
          />

        </section>


        {/* =================================================
            RIGHT REGISTER FORM
        ================================================= */}

        <section className="auth-form-section">

          <div className="auth-form-container">


            {/* TOP LINK */}

            <div className="auth-top-link">

              <span>Already have an account?</span>

              <Link to="/login">
                Log in →
              </Link>

            </div>


            {/* HEADER */}

            <div className="auth-header">

              <h2>
                Create an account
              </h2>

              <p>
                Join Clientify and manage your work efficiently.
              </p>

            </div>


            {/* FORM */}

            {/* SUCCESS MESSAGE (email confirmation required) */}
            {successMessage && (
              <div className="auth-success-banner" role="alert">
                {successMessage}
              </div>
            )}

            {/* GENERAL AUTH ERROR */}
            {authError && (
              <div className="auth-error-banner" role="alert">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit}>


              {/* NAME */}

              <div className="form-group">

                <label htmlFor="name">
                  Full Name
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ♙
                  </span>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />

                </div>

                {errors.name && (
                  <span className="error-message">
                    {errors.name}
                  </span>
                )}

              </div>


              {/* EMAIL */}

              <div className="form-group">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ✉
                  </span>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />

                </div>

                {errors.email && (
                  <span className="error-message">
                    {errors.email}
                  </span>
                )}

              </div>


              {/* PASSWORD */}

              <div className="form-group">

                <label htmlFor="password">
                  Password
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    🔒
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "◉" : "◌"}
                  </button>

                </div>

                {errors.password && (
                  <span className="error-message">
                    {errors.password}
                  </span>
                )}

              </div>


              {/* CONFIRM PASSWORD */}

              <div className="form-group">

                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    🔒
                  </span>

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? "◉" : "◌"}
                  </button>

                </div>

                {errors.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword}
                  </span>
                )}

              </div>


              {/* ROLE */}

              <div className="form-group">

                <label htmlFor="role">
                  Select Role
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ♙
                  </span>

                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >

                    <option value="Employee">
                      Employee
                    </option>

                    <option value="Manager">
                      Manager
                    </option>

                    <option value="Admin">
                      Admin
                    </option>

                  </select>

                </div>

              </div>


              {/* TERMS */}

              <div className="terms-row">

                <input
                  id="terms"
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                />

                <label htmlFor="terms">
                  I agree to the{" "}

                  <Link to="/terms">
                    Terms & Conditions
                  </Link>

                </label>

              </div>

              {errors.terms && (
                <span className="error-message terms-error">
                  {errors.terms}
                </span>
              )}


              {/* CREATE ACCOUNT */}

              <button
                type="submit"
                className="auth-button"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <span>→</span>}
              </button>


              {/* SOCIAL LOGIN */}

              <div className="social-section">

                <div className="divider">

                  <span></span>

                  <p>Or continue with</p>

                  <span></span>

                </div>


                <div className="social-buttons">

                  <button
                    type="button"
                    className="social-button"
                  >
                    <span className="google-icon">
                      G
                    </span>

                    Google
                  </button>


                  <button
                    type="button"
                    className="social-button"
                  >
                    <span className="apple-icon">
                      ●
                    </span>

                    Apple
                  </button>

                </div>

              </div>

            </form>


           

          </div>

        </section>

      </div>

    </div>
  );
}

export default Register;