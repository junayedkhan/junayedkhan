import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

export default function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setResetLink("");
    setIsSubmitting(true);

    try {
      const res = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setMessage(res.data.message);
      if (res.data.resetLink) setResetLink(res.data.resetLink);
    } catch (err) {
      if (err.request && !err.response) {
        setMessage("Could not reach the server. Make sure the backend is running.");
      } else {
        setMessage(err.response?.data?.message || "Unable to send reset link.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin_auth_shell">
      <section className="admin_auth_card">
        <span className="admin_auth_logo">J</span>
        <p className="admin_auth_kicker">Account recovery</p>
        <h1>Forgot Password</h1>
        <p className="admin_auth_copy">
          Enter your admin email address. A secure password reset link will be sent if the email matches the account.
        </p>

        <form className="admin_auth_form" onSubmit={handleForgotPassword}>
          <label>
            <span>Admin Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          {message ? <p className="admin_auth_notice">{message}</p> : null}
          {resetLink ? (
            <a className="admin_auth_link" href={resetLink}>
              Open reset link
            </a>
          ) : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>

          <Link className="admin_auth_text_button" to="/admin-login">
            Back to login
          </Link>
        </form>
      </section>
    </main>
  );
}
