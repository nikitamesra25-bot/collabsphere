
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = ({ onAuth }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
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
      const response = await api.register(formData);

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

          {/* TABS */}
          <div className="auth-tabs">
            <Link to="/login">
              Login
            </Link>

            <Link to="/register" className="active">
              Register
            </Link>
          </div>

          {/* HEADING */}
          <h2>Create your account</h2>

          <p className="form-description">
            Join CollabSphere and start collaborating.
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* REGISTER FORM */}
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create account"}
            </button>

          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Log in</Link>
          </p>

          <div className="security-note">
            ♙ Passwords are hashed with bcrypt. Sessions use JWT.
          </div>

        </div>
      </section>
    </div>
  );
};

export default Register;
