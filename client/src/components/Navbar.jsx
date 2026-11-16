
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <header className="main-navbar">
      <div className="navbar-left">
        <LinkToHome />

        {user && (
          <nav className="navbar-links">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "navbar-link active" : "navbar-link"
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/projects"
              className={({ isActive }) =>
                isActive ? "navbar-link active" : "navbar-link"
              }
            >
              Shared with me
            </NavLink>
          </nav>
        )}
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <button className="logout-btn" onClick={handleLogout}>
              Log out
            </button>

            <div className="profile-avatar">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </>
        ) : (
          <>
            <NavLink to="/login" className="navbar-login">
              Login
            </NavLink>

            <NavLink to="/register" className="navbar-register">
              Get Started
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
};

const LinkToHome = () => (
  <div className="navbar-brand" onClick={() => window.location.assign("/dashboard")}>
    <span className="brand-symbol">◎</span>
    <span>CollabSphere</span>
  </div>
);

export default Navbar;
