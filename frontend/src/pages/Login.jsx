import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Employee",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const result = await loginUser({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (!result.success) {
        setErrors({ email: result.error });
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      setErrors({ email: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">

        {/* LEFT SIDE */}
       <section className="auth-visual">
            <img
                src="/clientify-auth-left-reference.png"
                alt="Clientify workspace"
                className="visual-image"
            />
            </section>

        {/* RIGHT SIDE */}
        <section className="auth-form-section">

          <div className="auth-form-container">

            <div className="auth-top-link">
              <span>New to Clientify?</span>

              <Link to="/register">
                Create account →
              </Link>
            </div>

            <div className="auth-header">
              <h2>Welcome Back</h2>

              <p>
                Sign in to your Clientify account
              </p>
            </div>

            <form onSubmit={handleSubmit}>

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

                <div className="label-row">

                  <label htmlFor="password">
                    Password
                  </label>

                  <Link to="/forgot-password">
                    Forgot password?
                  </Link>

                </div>

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
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
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

              {/* ROLE */}
              <div className="form-group">

                <label htmlFor="role">
                  Login As
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
                   
                    <option value="Manager">
                      Manager
                    </option>

                    <option value="Employee">
                      Employee
                    </option>
                  </select>

                </div>

              </div>

              {/* BUTTON */}
              <button
                type="submit"
                className="auth-button"
                disabled={loading}
              >
                <span>{loading ? "Signing In..." : "Sign In"}</span>
                <span>→</span>
              </button>

            </form>

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
                  <strong className="google-icon">
                    G
                  </strong>
                  Google
                </button>

                <button
                  type="button"
                  className="social-button"
                >
                  <strong className="apple-icon">
                    ●
                  </strong>
                  Apple
                </button>

              </div>

            </div>

                     </div>

        </section>

      </div>
    </div>
  );
}

export default Login;