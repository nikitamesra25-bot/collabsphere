
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = ({ onAuth }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.login(formData);
      onAuth(response.user, response.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">

      {/* LEFT SIDE */}
      <section className="auth-hero">

        <Link to="/" className="auth-logo">
          <span>◎</span> CollabSphere
        </Link>

        <div className="hero-content">
          <h1>
            Projects, notes and code
            review, with an AI that
            reads along.
          </h1>

          <p>
            Invite your team, write docs in Markdown,
            share code files and let Gemini explain,
            document and draft your README.
          </p>

          <div className="code-preview">
            <h4>✦ Gemini explains this code</h4>

            <pre>
              <code>
                const token = jwt.sign(
                  {"{ id: user._id }"}, SECRET
                )
              </code>
            </pre>

            <p>
              Creates a signed JWT holding the user id,
              so the server can verify later requests
              without a session store.
            </p>
          </div>
        </div>
      </section>

      {/* RIGHT SIDE */}
      <section className="auth-form-section">

        <div className="auth-form-card">

          <div className="auth-tabs">
            <Link to="/login" className="active">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>
          </div>

          <h2>Welcome back</h2>

          <p className="form-description">
            Log in to continue to your projects.
          </p>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

          </form>

          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>

          <div className="security-note">
            ♙ Passwords are hashed with bcrypt. Sessions use JWT.
          </div>

        </div>
      </section>
    </div>
  );
};

export default Login;
