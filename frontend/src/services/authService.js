/*
  ============================================================
  AUTH SERVICE — DJANGO REST FRAMEWORK INTEGRATION
  ============================================================

  Centralizes all Django backend authentication logic.
  Communicates with Django endpoints:
    - POST /api/auth/register/
    - POST /api/auth/login/
    - GET  /api/auth/profile/

  Stores JWT tokens and user profile session in localStorage
  for seamless integration with ProtectedRoute.
  ============================================================
*/

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const ALLOWED_SELF_REGISTER_ROLES = ["Employee", "Manager"];

/**
 * Register a new user with Django REST Framework backend.
 *
 * @param {Object} params
 * @param {string} params.name       - Full name from the form
 * @param {string} params.email      - Email address from the form
 * @param {string} params.password   - Password from the form
 * @param {string} params.role       - Selected role (Employee | Manager)
 *
 * @returns {Promise<Object>} result
 */
export async function registerUser({ name, email, password, role }) {
  const safeRole = ALLOWED_SELF_REGISTER_ROLES.includes(role)
    ? role
    : "Employee";

  try {
    const response = await fetch(`${API_URL}/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: safeRole,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {
        success: false,
        error: response.status === 404 ? "Registration endpoint not found on server." : "Invalid server response.",
      };
    }

    if (!response.ok || !data.success) {
      return {
        success: false,
        requiresConfirmation: false,
        message: null,
        error: data.error || "Registration failed. Please try again.",
        field: data.field || null,
      };
    }

    // Persist authenticated user session and JWT tokens
    localStorage.setItem("clientifyUser", JSON.stringify(data.user));
    if (data.tokens?.access) {
      localStorage.setItem("clientifyToken", data.tokens.access);
      localStorage.setItem("clientifyRefreshToken", data.tokens.refresh);
    }

    return {
      success: true,
      requiresConfirmation: false,
      message: data.message || "Registration successful!",
      user: data.user,
      error: null,
      field: null,
    };
  } catch (err) {
    console.error("Django Auth Register error:", err);
    return {
      success: false,
      requiresConfirmation: false,
      message: null,
      error: "Unable to reach the Django backend server. Please verify the backend is running at http://127.0.0.1:8000.",
      field: null,
    };
  }
}

/**
 * Login a user via Django REST Framework.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @param {string} [params.role]
 *
 * @returns {Promise<Object>} result
 */
export async function loginUser({ email, password, role }) {
  try {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        role,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {
        success: false,
        error: response.status === 404 ? "Login endpoint not found on server." : "Invalid server response.",
      };
    }

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || data.detail || "Invalid email or password.",
        field: data.field || "email",
      };
    }

    // Persist authenticated user session and JWT tokens
    localStorage.setItem("clientifyUser", JSON.stringify(data.user));
    if (data.tokens?.access) {
      localStorage.setItem("clientifyToken", data.tokens.access);
      localStorage.setItem("clientifyRefreshToken", data.tokens.refresh);
    }

    return {
      success: true,
      user: data.user,
      error: null,
    };
  } catch (err) {
    console.error("Django Auth Login error:", err);
    return {
      success: false,
      error: "Unable to reach the Django backend server. Please verify the backend is running at http://127.0.0.1:8000.",
      field: null,
    };
  }
}

/**
 * Logout the current user by clearing tokens and session.
 */
export function logoutUser() {
  localStorage.removeItem("clientifyUser");
  localStorage.removeItem("clientifyToken");
  localStorage.removeItem("clientifyRefreshToken");
}

/**
 * Get the currently logged-in user profile from localStorage.
 */
export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem("clientifyUser");
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Request password reset instructions/link from the Django backend.
 *
 * @param {string} email
 * @returns {Promise<Object>}
 */
export async function requestPasswordReset(email) {
  try {
    const response = await fetch(`${API_URL}/auth/password-reset/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {
        success: false,
        error: response.status === 404 ? "Password reset endpoint not found on server." : "Invalid server response.",
      };
    }

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Failed to send password reset email.",
        field: data.field || "email",
      };
    }

    return {
      success: true,
      message: data.message || "Password reset instructions sent to your email.",
      debugResetUrl: data.debug_reset_url || null,
      uid: data.uid || null,
      token: data.token || null,
    };
  } catch (err) {
    console.error("Django Auth Password Reset error:", err);
    return {
      success: false,
      error: "Unable to reach the Django backend server. Please verify the backend is running at http://127.0.0.1:8000.",
      field: null,
    };
  }
}

/**
 * Validate a password reset token with the Django backend.
 *
 * @param {Object} params
 * @param {string} params.uid
 * @param {string} params.token
 * @returns {Promise<Object>}
 */
export async function validateResetToken({ uid, token }) {
  try {
    const response = await fetch(
      `${API_URL}/auth/password-reset/validate/?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let data;
    try {
      data = await response.json();
    } catch {
      data = { valid: false, error: "Invalid server response." };
    }

    return {
      valid: Boolean(response.ok && data.valid),
      error: data.error || null,
      email: data.email || null,
      name: data.name || null,
    };
  } catch (err) {
    console.error("Django Auth Validate Token error:", err);
    return {
      valid: false,
      error: "Unable to reach the server to validate reset link.",
    };
  }
}

/**
 * Confirm and set new password with reset token in Django backend.
 *
 * @param {Object} params
 * @param {string} params.uid
 * @param {string} params.token
 * @param {string} params.password
 * @returns {Promise<Object>}
 */
export async function confirmPasswordReset({ uid, token, password }) {
  try {
    const response = await fetch(`${API_URL}/auth/password-reset/confirm/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid,
        token,
        password,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {
        success: false,
        error: response.status === 404 ? "Reset confirmation endpoint not found." : "Invalid server response.",
      };
    }

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Failed to reset password. The link may have expired.",
        field: data.field || null,
      };
    }

    return {
      success: true,
      message: data.message || "Your password has been reset successfully!",
    };
  } catch (err) {
    console.error("Django Auth Confirm Password error:", err);
    return {
      success: false,
      error: "Unable to reach the Django backend server. Please verify the backend is running at http://127.0.0.1:8000.",
      field: null,
    };
  }
}

