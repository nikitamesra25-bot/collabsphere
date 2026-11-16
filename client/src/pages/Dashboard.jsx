
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Dashboard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.getProjects();
        setProjects(Array.isArray(data) ? data : data.projects || []);
      } catch (err) {
        setError(err.message || "Unable to load projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const publicProjects = projects.filter(
    (project) => project.isPublic
  ).length;

  const stats = [
    { label: "Projects", value: projects.length },
    { label: "Notes written", value: "—" },
    { label: "Files uploaded", value: "—" },
    { label: "Gemini requests", value: "—", highlight: true },
  ];

  return (
    <main className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <h1>Your projects</h1>
          <p>Everything you own or collaborate on.</p>
        </div>

        <Link to="/projects" className="new-project-btn">
          <span>＋</span> New project
        </Link>
      </div>

      <section className="dashboard-stats">
        {stats.map((stat) => (
          <div className="dashboard-stat-card" key={stat.label}>
            <p>{stat.label}</p>
            <h2 className={stat.highlight ? "stat-highlight" : ""}>
              {stat.value}
            </h2>
          </div>
        ))}
      </section>

      {loading ? (
        <p className="dashboard-message">Loading projects...</p>
      ) : error ? (
        <p className="dashboard-error">{error}</p>
      ) : (
        <section className="dashboard-project-grid">
          {projects.map((project) => {
            const ownerName = project.owner?.name || user?.name || "Owner";
            const members = Array.isArray(project.members)
              ? project.members
              : [];

            return (
              <Link
                to={`/project/${project._id}`}
                className="dashboard-project-card"
                key={project._id}
              >
                <div className="project-card-labels">
                  <span className="owner-badge">
                    {project.owner ? "Owner" : "Member"}
                  </span>

                  <span
                    className={
                      project.isPublic
                        ? "visibility-badge public-badge"
                        : "visibility-badge private-badge"
                    }
                  >
                    {project.isPublic ? "Public" : "Private"}
                  </span>
                </div>

                <h2>{project.name}</h2>

                <p className="dashboard-project-description">
                  {project.description || "No description added."}
                </p>

                <div className="project-card-divider"></div>

                <div className="project-card-bottom">
                  <div className="member-avatars">
                    <span className="member-avatar avatar-purple">
                      {getInitial(user?.name)}
                    </span>

                    {members.slice(0, 2).map((member, index) => (
                      <span
                        className={`member-avatar ${
                          index % 2 === 0
                            ? "avatar-teal"
                            : "avatar-orange"
                        }`}
                        key={member._id || index}
                      >
                        {getInitial(member.name)}
                      </span>
                    ))}
                  </div>

                  <span className="project-card-counts">
                    {project.notesCount ?? 0} notes ·{" "}
                    {project.filesCount ?? 0} files
                  </span>
                </div>
              </Link>
            );
          })}

          <Link to="/projects" className="create-project-card">
            <span className="create-project-plus">＋</span>
            <span>Create new project</span>
          </Link>
        </section>
      )}

      {!loading && !error && projects.length === 0 && (
        <p className="dashboard-empty">
          No projects yet. Create your first project!
        </p>
      )}
    </main>
  );
};

export default Dashboard;
