import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Button from "../components/Button";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
  });

  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      const response = await api.createProject(formData);

      setProjects((previous) => [
        response.project,
        ...previous,
      ]);

      setFormData({
        name: "",
        description: "",
        isPublic: false,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      await api.deleteProject(id);

      setProjects((previous) =>
        previous.filter((project) => project._id !== id)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="page-container">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1>My Projects</h1>
          <p>Create and manage all your projects in one place.</p>
        </div>
      </section>

      <section className="create-project-card">
        <h2>Create New Project</h2>
        <p>Add a new project to your workspace.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label htmlFor="name">Project Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter project name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your project..."
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
            />
            Make this project public
          </label>

          <Button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create Project"}
          </Button>
        </form>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>All Projects</h2>
            <p>{projects.length} projects in your workspace</p>
          </div>
        </div>

        {loading ? (
          <p className="empty-message">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <h3>No projects found</h3>
            <p>Create your first project above.</p>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((project) => (
              <div className="project-card" key={project._id}>
                <div className="project-card-top">
                  <span className="project-icon">📁</span>

                  <span className="project-status">
                    {project.isPublic ? "Public" : "Private"}
                  </span>
                </div>

                <h3>{project.name}</h3>

                <p>
                  {project.description || "No description added."}
                </p>

                <span className="project-date">
                  Created{" "}
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>

                <div className="project-actions">
                  <Link
                    to={`/project/${project._id}`}
                    className="btn btn-primary"
                  >
                    Open Project
                  </Link>

                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(project._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Projects;