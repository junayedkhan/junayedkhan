import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { setToken } from "../utils/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .get("/auth/status")
      .then((res) => {
        if (active) setAuthMode(res.data.hasAdmin ? "login" : "setup");
      })
      .catch(() => {
        if (active) setMessage("Could not reach the server. Make sure the backend is running.");
      })
      .finally(() => {
        if (active) setIsCheckingStatus(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      if (authMode === "setup") {
        await api.post("/auth/register", {
          username: username.trim(),
          email: email.trim(),
          password,
        });
      }

      const res = await api.post("/auth/login", {
        username: username.trim(),
        password,
      });

      setToken(res.data.token);
      navigate("/admin");
    } catch (err) {
      if (err.request && !err.response) {
        setMessage("Could not reach the server. Make sure the backend is running.");
      } else {
        setMessage(err.response?.data?.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const title =
    authMode === "setup" ? "Create Admin" : "Admin Login";

  const copy =
    authMode === "setup"
      ? "Create the first admin account. Use a real email so password recovery works later."
      : "Sign in with your username or email to manage your portfolio.";

  return (
    <main className="admin_auth_shell">
      <section className="admin_auth_card">
        <span className="admin_auth_logo">J</span>
        {isCheckingStatus ? (
          <div className="admin_auth_skeleton" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <>
            <p className="admin_auth_kicker">{authMode === "setup" ? "First admin" : "Secure access"}</p>
            <h1>{title}</h1>
            <p className="admin_auth_copy">{copy}</p>
          </>
        )}

        {!isCheckingStatus ? <form className="admin_auth_form" onSubmit={handleAuth}>
          {authMode === "login" || authMode === "setup" ? (
            <label>
              <span>{authMode === "setup" ? "Username" : "Username or Email"}</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </label>
          ) : null}

          {authMode === "setup" ? (
            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
          ) : null}

          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              minLength={8}
              required
            />
          </label>

          {message ? <p className="admin_auth_error">{message}</p> : null}

          <button type="submit" disabled={isSubmitting || isCheckingStatus}>
            {isCheckingStatus
              ? "Checking..."
              : isSubmitting
                ? authMode === "setup"
                  ? "Creating..."
                  : "Signing in..."
                : authMode === "setup"
                  ? "Create Admin"
                  : "Login"}
          </button>

          {authMode === "login" ? (
            <Link className="admin_auth_text_button" to="/forgot-password">
              Forgot password?
            </Link>
          ) : null}
        </form> : null}
      </section>
    </main>
  );
}
