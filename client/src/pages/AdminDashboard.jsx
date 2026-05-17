import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { authHeaders, clearToken } from "../utils/api";

const statCards = [
  { label: "Total Users", value: "120", icon: "fas fa-users" },
  { label: "Projects", value: "15", icon: "fas fa-layer-group" },
  { label: "Messages", value: "08", icon: "fas fa-envelope" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;

    api
      .get("/auth/me", { headers: authHeaders() })
      .then((res) => {
        if (active) setUser(res.data.user);
      })
      .catch(() => {
        clearToken();
        navigate("/admin-login", { replace: true });
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const logout = () => {
    clearToken();
    navigate("/admin-login");
  };

  return (
    <main className="admin_dashboard">
      <aside className="admin_sidebar">
        <span className="admin_auth_logo">J</span>
        <nav aria-label="Admin navigation">
          <button type="button" className="active">
            <i className="fas fa-chart-line" aria-hidden="true"></i>
            <span>Dashboard</span>
          </button>
          <button type="button">
            <i className="fas fa-images" aria-hidden="true"></i>
            <span>Projects</span>
          </button>
          <button type="button">
            <i className="fas fa-comments" aria-hidden="true"></i>
            <span>Messages</span>
          </button>
        </nav>
      </aside>

      <section className="admin_main">
        <header className="admin_header">
          <div>
            <p className="admin_auth_kicker">Admin panel</p>
            <h1>Welcome{user?.username ? `, ${user.username}` : ""}</h1>
          </div>
          <button type="button" className="admin_logout" onClick={logout}>
            <i className="fas fa-sign-out-alt" aria-hidden="true"></i>
            <span>Logout</span>
          </button>
        </header>

        <div className="admin_stats">
          {statCards.map((card) => (
            <article className="admin_stat_card" key={card.label}>
              <i className={card.icon} aria-hidden="true"></i>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
