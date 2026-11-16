import React, { useRef, useState, useEffect } from "react";
import api from "../services/api";
import "./FilesWorkspace.css";

function getFileType(name = "") {
  const extension = name.split(".").pop().toLowerCase();

  const types = {
    js: "JS",
    jsx: "JS",
    ts: "TS",
    tsx: "TS",
    py: "PY",
    png: "PNG",
    jpg: "JPG",
    jpeg: "JPG",
    txt: "TXT",
    pdf: "PDF",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    md: "MD",
  };

  return types[extension] || "FILE";
}

function formatSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesWorkspace({
  files = [],
  projectId,
  onFilesUpdate,
  SERVER_URL = "http://localhost:5000",
}) {
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const [explanation, setExplanation] = useState("");
  const [docs, setDocs] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef(null);

  const selectedFile =
    files.find((file) => file._id === selectedFileId) ||
    files[0] ||
    null;

  const getFileName = (file) =>
    file.originalName || file.filename;

  const getFileUrl = (file) =>
    `${SERVER_URL}/uploads/${encodeURIComponent(file.filename)}`;

  useEffect(() => {
    let cancelled = false;

    const loadPreview = async () => {
      if (!selectedFile) {
        setPreviewContent("");
        return;
      }

      const extension = getFileName(selectedFile)
        .split(".")
        .pop()
        .toLowerCase();

      const textExtensions = [
        "js", "jsx", "ts", "tsx", "py",
        "html", "css", "json", "txt", "md",
      ];

      setPreviewContent("");

      if (!textExtensions.includes(extension)) return;

      try {
        const response = await fetch(getFileUrl(selectedFile));

        if (!response.ok) {
          throw new Error("Unable to load file preview");
        }

        const content = await response.text();

        if (!cancelled) {
          setPreviewContent(content);
        }
      } catch (error) {
        if (!cancelled) {
          setPreviewContent("Unable to load file preview.");
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [selectedFile?._id]);

  const handleFiles = async (fileList) => {
    const selectedFiles = Array.from(fileList);

    if (!selectedFiles.length) return;

    setUploading(true);

    try {
      for (const file of selectedFiles) {
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name} is larger than 10 MB.`);
          continue;
        }

        const formData = new FormData();

        formData.append("file", file);
        formData.append("projectId", projectId);

        await api.uploadFile(formData);
      }

      const updatedFiles = await api.getFiles(projectId);

      onFilesUpdate(updatedFiles);

      setSelectedFileId(
        updatedFiles[0]?._id || null
      );

      setExplanation("");
      setDocs("");

    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (event) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleDelete = async () => {
    if (!selectedFile) return;

    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      await api.deleteFile(selectedFile._id);

      const updatedFiles = await api.getFiles(projectId);

      onFilesUpdate(updatedFiles);

      setSelectedFileId(
        updatedFiles[0]?._id || null
      );

      setExplanation("");
      setDocs("");

    } catch (error) {
      alert(error.message);
    }
  };

  const handleDownload = () => {
    if (!selectedFile) return;

    const link = document.createElement("a");

    link.href = getFileUrl(selectedFile);
    link.download = getFileName(selectedFile);
    link.target = "_blank";

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExplain = async () => {
    if (!previewContent.trim()) {
      alert("Text preview is not available for this file.");
      return;
    }

    setLoading(true);
    setExplanation("");

    try {
      const response = await api.askGemini(
        `Explain this file in simple language:\n\n${previewContent}`
      );

      setExplanation(response.answer);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocs = async () => {
    if (!previewContent.trim()) {
      alert("Text preview is not available for this file.");
      return;
    }

    setLoading(true);
    setDocs("");

    try {
      const response = await api.askGemini(
        `Generate professional documentation for this file.
         File name: ${getFileName(selectedFile)}
         File content:\n${previewContent}`
      );

      setDocs(response.answer);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = (file) => {
    setSelectedFileId(file._id);
    setExplanation("");
    setDocs("");
  };

  const isImage = selectedFile &&
    ["png", "jpg", "jpeg"].includes(
      getFileName(selectedFile).split(".").pop().toLowerCase()
    );

  return (
    <div className="files-workspace">

      {/* LEFT SIDEBAR */}
      <aside className="files-sidebar">

        <div
          className={`upload-box ${dragging ? "drag-active" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="upload-icon">↑</div>

          <h3>Drag files here to upload</h3>
          <p>Code files, images, text. Max 10 MB.</p>

          <button
            className="choose-file-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Choose file"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleFileInput}
          />
        </div>

        {/* FILE LIST */}
        <div className="files-list">

          {files.map((file) => (
            <button
              key={file._id}
              className={`file-item ${
                selectedFile?._id === file._id ? "active" : ""
              }`}
              onClick={() => handleSelectFile(file)}
            >
              <span className="file-type">
                {getFileType(getFileName(file))}
              </span>

              <span className="file-info">
                <strong>{getFileName(file)}</strong>

                <small>
                  {file.uploadedBy?.name || "Member"} ·{" "}
                  {formatSize(file.size)}
                </small>
              </span>
            </button>
          ))}

          {files.length === 0 && (
            <p>No files uploaded yet.</p>
          )}

        </div>
      </aside>

      {/* RIGHT CONTENT */}
      <main className="files-main">

        {selectedFile ? (
          <>
            <div className="file-preview-card">

              {/* FILE HEADER */}
              <div className="file-header">

                <div className="file-heading">
                  <h2>{getFileName(selectedFile)}</h2>

                  <p>
                    Uploaded by{" "}
                    {selectedFile.uploadedBy?.name || "Member"}
                  </p>
                </div>

                <div className="file-actions">

                  <button
                    className="ai-button"
                    onClick={handleExplain}
                    disabled={loading}
                  >
                    Explain this code
                  </button>

                  <button
                    className="ai-button"
                    onClick={handleGenerateDocs}
                    disabled={loading}
                  >
                    Generate docs
                  </button>

                  <button
                    className="download-button"
                    onClick={handleDownload}
                  >
                    Download
                  </button>

                  <button
                    className="download-button"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>

                </div>
              </div>

              {/* FILE PREVIEW */}
              <div className="code-preview">

                {isImage ? (
                  <img
                    src={getFileUrl(selectedFile)}
                    alt={getFileName(selectedFile)}
                    style={{ maxWidth: "100%" }}
                  />
                ) : (
                  <pre>
                    {previewContent ||
                      "Loading preview or preview not available..."}
                  </pre>
                )}

              </div>

              {getFileType(getFileName(selectedFile)) === "PDF" && (
                <a
                  href={getFileUrl(selectedFile)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open PDF
                </a>
              )}

            </div>

            {/* GEMINI EXPLANATION */}
            {explanation && (
              <div className="gemini-explanation">
                <h3>✦ Gemini: Code Explanation</h3>
                <p>{explanation}</p>
              </div>
            )}

            {/* GENERATED DOCUMENTATION */}
            {docs && (
              <div className="gemini-explanation generated-docs">
                <h3>✦ Generated Documentation</h3>
                <pre>{docs}</pre>
              </div>
            )}

            {loading && (
              <div className="gemini-explanation">
                <h3>✦ Gemini is thinking...</h3>
                <p>Please wait...</p>
              </div>
            )}

          </>
        ) : (
          <div className="empty-files">
            <h2>No file selected</h2>
            <p>Upload a file or select one from the sidebar.</p>
          </div>
        )}

      </main>
    </div>
  );
}
