import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import NotesWorkspace from "../components/NotesWorkspace";
import FilesWorkspace from "../components/FilesWorkspace";

const ProjectDetails = () => {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [readme, setReadme] = useState("");
  const [generating, setGenerating] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [noteData, setNoteData] = useState({title: "", content: "",});
  const [busy, setBusy] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
const [editorTitle, setEditorTitle] = useState("");
const [editorContent, setEditorContent] = useState("");
const [geminiExplanation, setGeminiExplanation] = useState("");
const [geminiSuggestions, setGeminiSuggestions] = useState("");
const [geminiLoading, setGeminiLoading] = useState(false);
const [editorMode, setEditorMode] = useState("Editor");


  const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectData, notesData, filesData] =
          await Promise.all([
            api.getProject(id),
            api.getNotes(id),
            api.getFiles(id),
          ]);

        setProject(projectData);
        setNotes(notesData);
        setFiles(filesData);

        setReadme(
          `${projectData.name}\n\n${
            projectData.description || "Project description"
          }`
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <main className="page-container">Loading project...</main>;
  }

  if (!project) {
    return (
      <main className="page-container">
        <p className="error-message">{error || "Project not found"}</p>
      </main>
    );
  }

  const owner = project.owner || {};
  const members = project.members || [];

  const allMembers = [
    {
      ...owner,
      name: owner.name || "Project Owner",
      email: owner.email || "",
      role: "Owner",
    },
    ...members
      .filter((member) => {
        const memberId = member._id || member.user?._id;
        return memberId !== owner._id;
      })
      .map((member) => ({
        ...(member.user || member),
        role: "Member",
      })),
  ];

  const totalNotes = notes.length;
  const totalFiles = files.length;


const handleAddNote = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await api.createNote({
      ...noteData,
      projectId: id,
    });

    setNotes((previous) => [
      response.note,
      ...previous,
    ]);

    setNoteData({ title: "", content: "" });
  } catch (err) {
    setError(err.message);
  }
};

const handleDeleteNote = async (noteId) => {
  if (!window.confirm("Delete this note?")) return;

  try {
    await api.deleteNote(noteId);
    setNotes((previous) =>
      previous.filter((note) => note._id !== noteId)
    );
  } catch (err) {
    setError(err.message);
  }
};

const handleSelectNote = (note) => {
  setSelectedNote(note);
  setEditorTitle(note.title || "");
  setEditorContent(note.content || "");
  setGeminiExplanation("");
  setGeminiSuggestions("");
};

const handleNewNote = () => {
  setSelectedNote(null);
  setEditorTitle("");
  setEditorContent("");
  setGeminiExplanation("");
  setGeminiSuggestions("");
  setEditorMode("Editor");
};

const handleSaveNote = async () => {
  if (!editorTitle.trim()) {
    setError("Please enter a note title.");
    return;
  }

  setBusy(true);
  setError("");

  try {
    if (selectedNote) {
      const response = await api.updateNote(selectedNote._id, {
        title: editorTitle,
        content: editorContent,
      });

      const updatedNote = response.note || response;

      setNotes((previous) =>
        previous.map((note) =>
          note._id === selectedNote._id ? updatedNote : note
        )
      );

      setSelectedNote(updatedNote);
    } else {
      const response = await api.createNote({
        title: editorTitle,
        content: editorContent,
        projectId: id,
      });

      const newNote = response.note || response;

      setNotes((previous) => [newNote, ...previous]);
      setSelectedNote(newNote);
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setBusy(false);
  }
};

const handleGeminiAction = async (type) => {
  if (!editorContent.trim()) {
    setError("Please write some note content first.");
    return;
  }

  setGeminiLoading(true);
  setError("");

  try {
    const prompt =
      type === "explain"
        ? `Explain this note in simple language:\n${editorContent}`
        : `Suggest improvements for this note. Give numbered suggestions:\n${editorContent}`;

    const response = await api.askGemini(prompt);

    if (type === "explain") {
      setGeminiExplanation(response.answer);
    } else {
      setGeminiSuggestions(response.answer);
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setGeminiLoading(false);
  }
};

  const copyPublicLink = async () => {
    const link = `${window.location.origin}/p/${project.slug}`;

    try {
      await navigator.clipboard.writeText(link);
      alert("Public link copied!");
    } catch {
      alert("Unable to copy link.");
    }
  };

  const generateReadme = async () => {
    setGenerating(true);
    setError("");

    try {
      const response = await api.askGemini(
        `Create a professional README.md for this project.
         Project name: ${project.name}
         Description: ${project.description || "No description"}
         Include overview, features, technologies and setup instructions.`
      );

      setReadme(response.answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const recentActivity = [
    ...files.map((file) => ({
      text: `${file.originalName} uploaded`,
      detail: "Project file",
      date: file.createdAt,
    })),
    ...notes.map((note) => ({
      text: `${note.title} created`,
      detail: "Project note",
      date: note.createdAt,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.date || 0) - new Date(a.date || 0)
    )
    .slice(0, 5);

  const contributionData = allMembers.map((member) => ({
    name: member.name,
    notes: notes.filter(
      (note) =>
        (note.createdBy?._id || note.createdBy) === member._id
    ).length,
    files: files.filter(
      (file) =>
        (file.uploadedBy?._id || file.uploadedBy) === member._id
    ).length,
  }));

  const maxContribution = Math.max(
    1,
    ...contributionData.map((item) => item.notes + item.files)
  );

  return (
    <main className="project-overview-page">

      {/* Breadcrumb */}
      <div className="project-breadcrumb">
        <strong>◉ CollabSphere</strong>
        <span>/</span>
        <span>{project.name}</span>
        <div className="breadcrumb-avatar">
          {owner.name?.charAt(0) || "N"}
        </div>
      </div>

      {/* Project Header */}
      <section className="overview-project-header">
        <div>
          <h1>{project.name}</h1>
          <p>
            {project.description || "No description added."}
          </p>
        </div>

        <div className="overview-header-actions">
          <button
            className="outline-action"
            onClick={copyPublicLink}
          >
            ↗ Copy public link
          </button>

          <button
            className="primary-action"
            onClick={() =>
              document
                .getElementById("invite-email")
                ?.focus()
            }
          >
            Add member
          </button>
        </div>
      </section>

      {/* Tabs */}
      <nav className="project-tabs">
        {["Overview", "Notes", "Files", "Public page"].map(
          (tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => {
                if (tab === "Public page") {
                  window.open(
                    `/p/${project.slug}`,
                    "_blank"
                  );
                } else {
                  setActiveTab(tab);
                }
              }}
            >
              {tab}
            </button>
          )
        )}
      </nav>

      {error && <p className="error-message">{error}</p>}

      {/* Overview */}
      {activeTab === "Overview" && (
        <div className="overview-layout">

          <div className="overview-main-column">

            {/* Contribution Analytics */}
            <section className="overview-card analytics-card">
              <div className="overview-card-heading">
                <h2>Contribution analytics</h2>
                <span>All time</span>
              </div>

              <div className="analytics-stats">
                <div>
                  <span>Notes created</span>
                  <strong>{totalNotes}</strong>
                </div>

                <div>
                  <span>Files uploaded</span>
                  <strong>{totalFiles}</strong>
                </div>

                <div>
                  <span>Members</span>
                  <strong>{allMembers.length}</strong>
                </div>
              </div>

              <div className="contribution-list">
                {contributionData.map((member) => (
                  <div
                    className="contribution-row"
                    key={member._id || member.name}
                  >
                    <span className="contributor-name">
                      {member.name}
                    </span>

                    <div className="contribution-bar">
                      <div
                        className="notes-bar"
                        style={{
                          width: `${
                            (member.notes / maxContribution) * 100
                          }%`,
                        }}
                      />

                      <div
                        className="files-bar"
                        style={{
                          width: `${
                            (member.files / maxContribution) * 100
                          }%`,
                        }}
                      />
                    </div>

                    <span className="contribution-count">
                      {member.notes} notes · {member.files} files
                    </span>
                  </div>
                ))}
              </div>

              <div className="analytics-legend">
                <span><i className="legend-notes" /> Notes</span>
                <span><i className="legend-files" /> Files</span>
              </div>
            </section>

            {/* README */}
            <section className="overview-card readme-card">
              <div className="overview-card-heading">
                <h2>README.md</h2>

                <button
                  className="gemini-readme-button"
                  onClick={generateReadme}
                  disabled={generating}
                >
                  ✦ {generating
                    ? "Generating..."
                    : "Generate README with Gemini"}
                </button>
              </div>

              <div className="readme-content">
                <pre>{readme}</pre>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="overview-sidebar">

            {/* Members */}
            <section className="overview-card members-card">
              <h2>Members</h2>

              {allMembers.map((member, index) => (
                <div
                  className="member-row"
                  key={member._id || index}
                >
                  <div className={`member-avatar member-${index % 3}`}>
                    {member.name?.charAt(0) || "U"}
                  </div>

                  <div className="member-info">
                    <strong>{member.name}</strong>
                    <span>{member.email}</span>
                  </div>

                  <span className="member-role">
                    {member.role}
                  </span>
                </div>
              ))}

              <div className="invite-member">
                <input
                  id="invite-email"
                  type="email"
                  placeholder="Invite by email"
                  value={inviteEmail}
                  onChange={(e) =>
                    setInviteEmail(e.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Member invitation API is not connected yet."
                    )
                  }
                >
                  Add
                </button>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="overview-card activity-card">
              <h2>Recent activity</h2>

              {recentActivity.length === 0 ? (
                <p className="no-activity">
                  No recent activity yet.
                </p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div className="activity-item" key={index}>
                    <strong>{activity.text}</strong>
                    <span>{activity.detail}</span>
                    <small>
                      {activity.date
                        ? new Date(activity.date).toLocaleString()
                        : "Recently"}
                    </small>
                  </div>
                ))
              )}
            </section>
          </aside>
        </div>
      )}

      {/* Notes Tab */}
{activeTab === "Notes" && (
  <NotesWorkspace
    notes={notes}
    selectedNote={selectedNote}
    editorTitle={editorTitle}
    setEditorTitle={setEditorTitle}
    editorContent={editorContent}
    setEditorContent={setEditorContent}
    editorMode={editorMode}
    setEditorMode={setEditorMode}
    geminiExplanation={geminiExplanation}
    geminiSuggestions={geminiSuggestions}
    geminiLoading={geminiLoading}
    busy={busy}
    handleNewNote={handleNewNote}
    handleSelectNote={handleSelectNote}
    handleSaveNote={handleSaveNote}
    handleGeminiAction={handleGeminiAction}
  />
)}

      {/* Files Tab */}
{activeTab === "Files" && (
  <FilesWorkspace
    files={files}
    projectId={id}
    onFilesUpdate={setFiles}
    SERVER_URL={SERVER_URL}
  />
)}
    </main>
  );
};

export default ProjectDetails;
