import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api, { authHeaders, clearToken, getToken } from "./api";

export default function PrivateRoute({ children }) {
  const [status, setStatus] = useState(() => (getToken() ? "checking" : "guest"));

  useEffect(() => {
    if (!getToken()) {
      setStatus("guest");
      return;
    }

    let active = true;

    api
      .get("/auth/me", { headers: authHeaders() })
      .then(() => {
        if (active) setStatus("authenticated");
      })
      .catch(() => {
        clearToken();
        if (active) setStatus("guest");
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <main className="admin_auth_shell">
        <section className="admin_auth_card admin_auth_card--compact">
          <span className="admin_auth_logo">J</span>
          <div className="admin_auth_skeleton" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </section>
      </main>
    );
  }

  if (status === "guest") {
    return <Navigate to="/admin-login" />;
  }

  return children;
}
