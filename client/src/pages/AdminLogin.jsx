import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setToken } from "../utils/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      if (authMode === "setup") {
        await api.post("/auth/register", {
          username: username.trim(),
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

  return (
    <main className="admin_auth_shell">
      <section className="admin_auth_card">
        <span className="admin_auth_logo">J</span>
        <p className="admin_auth_kicker">{authMode === "setup" ? "First admin" : "Secure access"}</p>
        <h1>{authMode === "setup" ? "Create Admin" : "Admin Login"}</h1>
        <p className="admin_auth_copy">
          {authMode === "setup"
            ? "Create the first admin account, then you will be signed in automatically."
            : "Sign in to manage your portfolio content and messages."}
        </p>

        <form className="admin_auth_form" onSubmit={handleLogin}>
          <label>
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {message ? <p className="admin_auth_error">{message}</p> : null}

          <button type="submit" disabled={isSubmitting || isCheckingStatus}>
            {isCheckingStatus
              ? "Checking..."
              : isSubmitting
                ? authMode === "setup" ? "Creating..." : "Signing in..."
                : authMode === "setup" ? "Create Admin" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}
