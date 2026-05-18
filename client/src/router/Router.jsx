import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../views/Home";
import NotFound from "../views/NotFound";
import AdminLogin from "../pages/AdminLogin";
import AdminForgotPassword from "../pages/AdminForgotPassword";
import AdminResetPassword from "../pages/AdminResetPassword";
import AdminDashboard from "../pages/AdminDashboard";
import PrivateRoute from "../utils/PrivateRoute";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<Home />} />
      <Route path="/gallery" element={<Home />} />
      <Route path="/portfolio" element={<Home />} />
      <Route path="/blogs" element={<Home />} />
      <Route path="/blogs/:slug" element={<Home />} />
      <Route path="/contact" element={<Home />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/reset-password/:token" element={<AdminResetPassword />} />

      {/* Protected Admin Route */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
