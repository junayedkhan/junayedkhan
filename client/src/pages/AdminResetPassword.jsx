import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

export default function AdminResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post(`/auth/reset-password/${token}`, {
        password,
      });

      setMessage(res.data.message);
      setTimeout(() => navigate("/admin-login"), 1200);
    } catch (err) {
      if (err.request && !err.response) {
        setMessage("Could not reach the server. Make sure the backend is running.");
      } else {
        setMessage(err.response?.data?.message || "Unable to reset password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin_auth_shell">
      <section className="admin_auth_card">
        <span className="admin_auth_logo">J</span>
        <p className="admin_auth_kicker">Secure access</p>
        <h1>Set New Password</h1>
        <p className="admin_auth_copy">
          Choose a new password for your admin account. The reset link works for 30 minutes.
        </p>

        <form className="admin_auth_form" onSubmit={handleResetPassword}>
          <label>
            <span>New Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                if (message) setMessage("");
                setPassword(e.target.value);
              }}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <label>
            <span>Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                if (message) setMessage("");
                setConfirmPassword(e.target.value);
              }}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          {message ? <p className="admin_auth_notice">{message}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Reset Password"}
          </button>

          <Link className="admin_auth_text_button" to="/admin-login">
            Back to login
          </Link>
        </form>
      </section>
    </main>
  );
}
