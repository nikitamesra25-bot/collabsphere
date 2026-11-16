
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "./PublicProject.css";

export default function PublicProject() {
  const { slug } = useParams();

  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPublicProject = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await api.getPublicProject(slug);
        setProjectData(data);
      } catch (err) {
        setError(err.message || "Unable to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="public-project-page">
        <p>Loading public project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-project-page">
        <h2>Project not found</h2>
        <p>{error}</p>
        <Link to="/register">Create your own project</Link>
      </div>
    );
  }

  const { project, notes, filesCount, notesCount, contributorsCount } =
    projectData;

  return (
    <div className="public-project-page">

      {/* NAVBAR */}
      <header className="public-navbar">
        <div className="public-navbar-inner">
          <Link to="/" className="public-brand">
            <span className="brand-icon">◉</span>
            <span>CollabSphere</span>
          </Link>

          <Link to="/register" className="signup-button">
            Sign up free
          </Link>
        </div>
      </header>

      <main className="public-container">

        {/* PROJECT INFORMATION */}
        <section className="public-project-info">

          <div className="public-project-label">
            <span className="public-badge">
              Public · read-only
            </span>

            <span className="public-url">
              collabsphere.app/p/{project.slug}
            </span>
          </div>

          <h1>{project.name}</h1>

          <p className="public-description">
            {project.description || "No project description available."}
          </p>

          <div className="public-project-meta">
            <span>
              By <strong>{project.owner?.name || "Unknown"}</strong>
            </span>

            <span>{contributorsCount} contributors</span>
            <span>{notesCount} notes</span>
            <span>{filesCount} files</span>
          </div>

        </section>

        {/* README CARD */}
        <section className="public-readme-card">

          <div className="readme-header">
            <span>README.md</span>

            <span className="gemini-label">
              Drafted with Gemini
            </span>
          </div>

          <div className="readme-content">

            <h2>About</h2>

            <p>
              {project.description ||
                `${project.name} is a project created using CollabSphere.`}
            </p>

            <h3>Features</h3>

            <p>
              Project collaboration, shared notes and file management.
            </p>

            <h3>Getting started</h3>

            <pre>
              <code>{`Create an account on CollabSphere
Open your dashboard
Explore your projects`}</code>
            </pre>

          </div>

        </section>

        {/* SHARED NOTES */}
        <section className="public-notes-section">

          <h2>Shared notes</h2>

          <div className="public-notes-grid">

            {notes.length > 0 ? (
              notes.map((note) => (
                <div className="public-note-card" key={note._id}>
                  <h3>{note.title}</h3>

                  <p>{note.content || "No description available."}</p>

                  <small>
                    By {note.createdBy?.name || "Unknown"}
                  </small>
                </div>
              ))
            ) : (
              <p>No shared notes available.</p>
            )}

          </div>

        </section>

        {/* FOOTER */}
        <footer className="public-footer">
          This page is read-only. Built on CollabSphere.
        </footer>

      </main>
    </div>
  );
}
