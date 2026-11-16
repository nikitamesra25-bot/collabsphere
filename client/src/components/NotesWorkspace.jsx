import React from "react";
import "./NotesWorkspace.css";

const NotesWorkspace = ({
  notes,
  selectedNote,
  editorTitle,
  setEditorTitle,
  editorContent,
  setEditorContent,
  editorMode,
  setEditorMode,
  geminiExplanation,
  geminiSuggestions,
  geminiLoading,
  busy,
  handleNewNote,
  handleSelectNote,
  handleSaveNote,
  handleGeminiAction,
}) => {
  const addFormatting = (text) => {
    setEditorContent((previous) => previous + text);
  };

  const renderPreview = () => {
    if (!editorContent.trim()) {
      return "Your preview will appear here...";
    }

    return editorContent;
  };

  return (
    <div className="notes-workspace">

      {/* LEFT SIDEBAR */}
      <aside className="notes-sidebar">

        <div className="notes-sidebar-header">
          <h2>My Notes</h2>

          <button
            className="new-note-button"
            onClick={handleNewNote}
          >
            + New note
          </button>
        </div>

        <div className="notes-list">
          {notes.length === 0 ? (
            <p className="empty-notes">
              No notes yet. Create your first note!
            </p>
          ) : (
            notes.map((note) => (
              <button
                key={note._id}
                className={`note-list-item ${
                  selectedNote?._id === note._id ? "selected" : ""
                }`}
                onClick={() => handleSelectNote(note)}
              >
                <span className="note-icon">📝</span>

                <div className="note-list-info">
                  <strong>{note.title}</strong>

                  <small>
                    {note.content
                      ? note.content.slice(0, 45)
                      : "No content"}
                  </small>
                </div>
              </button>
            ))
          )}
        </div>

      </aside>

      {/* CENTER EDITOR */}
      <section className="note-editor-panel">

        <div className="note-editor-header">

          <input
            type="text"
            className="note-title-input"
            placeholder="Enter note title..."
            value={editorTitle}
            onChange={(e) => setEditorTitle(e.target.value)}
          />

          <div className="note-header-actions">

            <button
              className="explain-button"
              onClick={() => handleGeminiAction("explain")}
              disabled={geminiLoading}
            >
              ✦ Explain this note
            </button>

            <button
              className="suggest-button"
              onClick={() => handleGeminiAction("suggest")}
              disabled={geminiLoading}
            >
              ✦ Suggest improvements
            </button>

            <button
              className="save-note-button"
              onClick={handleSaveNote}
              disabled={busy}
            >
              {busy ? "Saving..." : "Save"}
            </button>

          </div>
        </div>

        {/* MARKDOWN TOOLBAR */}
        <div className="markdown-toolbar">

          <button onClick={() => addFormatting("**Bold text**")}>
            <strong>B</strong>
          </button>

          <button onClick={() => addFormatting("*Italic text*")}>
            <i>I</i>
          </button>

          <button onClick={() => addFormatting("\n# Heading\n")}>
            H
          </button>

          <button onClick={() => addFormatting("\n- List item\n")}>
            ☷
          </button>

          <button onClick={() => addFormatting("\n`code`\n")}>
            {"</>"}
          </button>

          <button onClick={() => addFormatting("\n---\n")}>
            —
          </button>

        </div>

        {/* EDITOR / PREVIEW TABS */}
        <div className="editor-mode-tabs">

          <button
            className={editorMode === "Editor" ? "active" : ""}
            onClick={() => setEditorMode("Editor")}
          >
            Editor
          </button>

          <button
            className={editorMode === "Preview" ? "active" : ""}
            onClick={() => setEditorMode("Preview")}
          >
            Preview
          </button>

        </div>

        {/* EDITOR CONTENT */}
        <div className="note-content-area">

          {editorMode === "Editor" ? (
            <textarea
              className="note-content-editor"
              placeholder="Start writing your notes here..."
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
            />
          ) : (
            <pre className="note-preview">
              {renderPreview()}
            </pre>
          )}

        </div>

      </section>

      {/* RIGHT GEMINI SIDEBAR */}
      <aside className="gemini-sidebar">

        <div className="gemini-panel-header">
          <span>✦</span>
          <h2>Gemini Assistant</h2>
        </div>

        {geminiLoading ? (
          <p className="gemini-loading">
            Gemini is thinking...
          </p>
        ) : (
          <>
            <div className="gemini-result-card">
              <h3>Note Explanation</h3>

              <p>
                {geminiExplanation ||
                  "Click 'Explain this note' to understand your note in simple language."}
              </p>
            </div>

            <div className="gemini-result-card">
              <h3>Suggested Improvements</h3>

              <p>
                {geminiSuggestions ||
                  "Click 'Suggest improvements' to get ideas for improving your note."}
              </p>
            </div>
          </>
        )}

        <button
          className="gemini-copy-button"
          onClick={() => {
            const text = `Explanation:\n${geminiExplanation}\n\nSuggestions:\n${geminiSuggestions}`;

            navigator.clipboard.writeText(text);
          }}
          disabled={!geminiExplanation && !geminiSuggestions}
        >
          Copy Gemini Results
        </button>

      </aside>

    </div>
  );
};

export default NotesWorkspace;
