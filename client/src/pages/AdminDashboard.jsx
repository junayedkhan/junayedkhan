import React, { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/admin-login";
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/admin-login";
  };

  return (
    <>
      <style>{css}</style>

      <div className="container">
        {/* Top Bar */}
        <div className="topbar">
          <h3>Admin Panel</h3>
          <button onClick={() => setOpen(!open)}>Menu</button>
        </div>

        {/* Sidebar */}
        <div className={`sidebar ${open ? "show" : ""}`}>
          <p>Dashboard</p>
          <p>Users</p>
          <p>Projects</p>
          <p>Messages</p>
          <p className="logout" onClick={logout}>
            Logout
          </p>
        </div>

        {/* Main */}
        <div className="main">
          <h2>Welcome Admin</h2>

          <div className="box">
            <p>Total Users: 120</p>
          </div>

          <div className="box">
            <p>Total Projects: 15</p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ===== CSS ===== */
const css = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: sans-serif;
}

.container {
  display: flex;
  min-height: 100vh;
}

/* Topbar */
.topbar {
  display: none;
  width: 100%;
  background: #333;
  color: white;
  padding: 10px;
  justify-content: space-between;
}

/* Sidebar */
.sidebar {
  width: 200px;
  background: #222;
  color: white;
  padding: 15px;
}

.sidebar p {
  padding: 10px 0;
  cursor: pointer;
}

.logout {
  color: red;
  margin-top: 20px;
}

/* Main */
.main {
  flex: 1;
  padding: 20px;
}

.box {
  background: #f3f3f3;
  padding: 15px;
  margin-top: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .topbar {
    display: flex;
  }

  .sidebar {
    display: none;
    width: 100%;
  }

  .sidebar.show {
    display: block;
  }
}
`;