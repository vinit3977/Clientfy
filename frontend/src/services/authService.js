import { supabase } from "../lib/supabase";

/*
  ============================================================
  AUTH SERVICE
  ============================================================

  Centralizes all Supabase authentication and profile logic
  so that no component needs to call Supabase directly.

  Role security note:
  -------------------
  The registration form lets users choose Employee or Manager.
  "Admin" is intentionally excluded from self-registration.

  Although the selected role is stored in the profiles table,
  actual authorization decisions must always be enforced by
  Supabase RLS policies and backend checks — never by reading
  the role from the client alone.

  For higher-privilege roles (Admin), an administrator should
  manually update the profiles.role column via the Supabase
  dashboard or a secure backend endpoint.
  ============================================================
*/

/*
  Allowed roles for self-registration.
  Admin can only be granted by an administrator — never via
  the public registration form.
*/
const ALLOWED_SELF_REGISTER_ROLES = ["Employee", "Manager"];

/**
 * Register a new user with Supabase Auth and create their profile.
 *
 * @param {Object} params
 * @param {string} params.name       - Full name from the form
 * @param {string} params.email      - Email address from the form
 * @param {string} params.password   - Password from the form
 * @param {string} params.role       - Selected role (Employee | Manager)
 *
 * @returns {Object} result
 * @returns {boolean}      result.success           - Whether registration succeeded
 * @returns {boolean}      result.requiresConfirmation - Whether email confirmation is needed
 * @returns {string|null}  result.message           - Success/info message
 * @returns {string|null}  result.error             - User-friendly error message
 * @returns {string|null}  result.field             - Form field the error relates to (optional)
 */
export async function registerUser({ name, email, password, role }) {

  // ── Security: sanitise the role on the service layer ─────────────────────
  const safeRole = ALLOWED_SELF_REGISTER_ROLES.includes(role)
    ? role
    : "Employee"; // Default to Employee if an unexpected value sneaks through


  // ── Step 1: Supabase Auth sign-up ─────────────────────────────────────────
  /*
    name and role are passed as user metadata (options.data).
    A SECURITY DEFINER trigger on auth.users reads raw_user_meta_data
    and automatically inserts into public.profiles — no frontend INSERT
    needed, so RLS cannot block it regardless of email confirmation status.
  */
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        name: name.trim(),
        role: safeRole,
      },
    },
  });

  if (authError) {
    return {
      success: false,
      requiresConfirmation: false,
      message: null,
      error: mapAuthError(authError),
      field: getErrorField(authError),
    };
  }

  const user = authData?.user;

  if (!user) {
    return {
      success: false,
      requiresConfirmation: false,
      message: null,
      error: "Registration failed. Please try again.",
      field: null,
    };
  }


  // ── Step 2: Determine confirmation status ─────────────────────────────────
  /*
    Profile is created by the database trigger automatically.
    No frontend INSERT required — this avoids the 401 RLS error
    that occurs when there is no session (email confirmation enabled).
  */
  const requiresConfirmation = !authData.session;

  return {
    success: true,
    requiresConfirmation,
    message: requiresConfirmation
      ? "Account created successfully. Please check your email to verify your account."
      : null,
    error: null,
    field: null,
  };
}



/* ============================================================
   ERROR MAPPING
   ============================================================ */

/**
 * Maps Supabase auth errors to user-friendly messages.
 * @param {Object} error - Supabase error object
 * @returns {string} User-friendly message
 */
function mapAuthError(error) {
  const message = error?.message?.toLowerCase() ?? "";

  if (
    message.includes("user already registered") ||
    message.includes("already been registered") ||
    message.includes("email already")
  ) {
    return "This email is already registered. Please log in instead.";
  }

  if (message.includes("invalid email")) {
    return "Please enter a valid email address.";
  }

  if (
    message.includes("password should be at least") ||
    message.includes("weak password") ||
    message.includes("password is too short")
  ) {
    return "Your password is too weak. Please use at least 6 characters.";
  }

  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("failed to fetch")
  ) {
    return "Network error. Please check your connection and try again.";
  }

  if (message.includes("rate limit") || message.includes("too many requests")) {
    return "Too many attempts. Please wait a moment before trying again.";
  }

  // Fallback — generic but doesn't expose raw Supabase/DB internals
  return "Registration failed. Please try again or contact support.";
}

/**
 * Maps a Supabase auth error to a specific form field if applicable.
 * @param {Object} error
 * @returns {string|null}
 */
function getErrorField(error) {
  const message = error?.message?.toLowerCase() ?? "";

  if (
    message.includes("email already") ||
    message.includes("user already registered") ||
    message.includes("invalid email")
  ) {
    return "email";
  }

  if (
    message.includes("password") ||
    message.includes("weak password")
  ) {
    return "password";
  }

  return null;
}
