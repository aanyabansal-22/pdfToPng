import { useState, useRef, useCallback } from "react";

export default function MergePdf() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const addFiles = (incoming) => {
    const pdfs = Array.from(incoming).filter(
      (f) => f.type === "application/pdf"
    );
    if (pdfs.length === 0) {
      setError("Only PDF files are accepted.");
      return;
    }
    setError("");
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const unique = pdfs.filter((f) => !existingNames.has(f.name));
      return [...prev, ...unique];
    });
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index, direction) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please add at least 2 PDF files to merge.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const res = await fetch("http://localhost:5000/merge-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Merge failed. Please try again.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setFiles([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <svg style={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          <div>
            <h1 style={styles.title}>Merge PDFs</h1>
            <p style={styles.subtitle}>Combine multiple PDF files into one. Drag to reorder.</p>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          style={{
            ...styles.dropZone,
            ...(isDragging ? styles.dropZoneActive : {}),
          }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            style={{ display: "none" }}
            onChange={(e) => addFiles(e.target.files)}
          />
          <svg style={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="16 16 12 12 8 16"/>
            <line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          </svg>
          <p style={styles.dropText}>
            {isDragging ? "Drop your PDFs here" : "Drag & drop PDFs here"}
          </p>
          <p style={styles.dropSub}>or click to browse files</p>
          <span style={styles.badge}>PDF only · Multiple files allowed</span>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.errorIcon}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div style={styles.fileSection}>
            <div style={styles.fileSectionHeader}>
              <span style={styles.fileCount}>{files.length} file{files.length !== 1 ? "s" : ""} selected</span>
              <button style={styles.clearBtn} onClick={() => setFiles([])}>Clear all</button>
            </div>
            <ul style={styles.fileList}>
              {files.map((file, i) => (
                <li key={file.name} style={styles.fileItem}>
                  <div style={styles.fileOrder}>{i + 1}</div>
                  <svg style={styles.fileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  <span style={styles.fileName} title={file.name}>{file.name}</span>
                  <span style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
                  <div style={styles.fileActions}>
                    <button
                      style={styles.arrowBtn}
                      onClick={() => moveFile(i, -1)}
                      disabled={i === 0}
                      title="Move up"
                    >▲</button>
                    <button
                      style={styles.arrowBtn}
                      onClick={() => moveFile(i, 1)}
                      disabled={i === files.length - 1}
                      title="Move down"
                    >▼</button>
                    <button
                      style={styles.removeBtn}
                      onClick={() => removeFile(i)}
                      title="Remove"
                    >✕</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Merge Button */}
        <button
          style={{
            ...styles.mergeBtn,
            ...(files.length < 2 || isLoading ? styles.mergeBtnDisabled : {}),
          }}
          onClick={handleMerge}
          disabled={files.length < 2 || isLoading}
        >
          {isLoading ? (
            <>
              <span style={styles.spinner} />
              Merging…
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <path d="M8 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3"/>
                <polyline points="15 3 12 0 9 3"/>
                <line x1="12" y1="0" x2="12" y2="13"/>
              </svg>
              Merge PDFs
              {files.length >= 2 && <span style={styles.countPill}>{files.length}</span>}
            </>
          )}
        </button>

        {files.length === 1 && (
          <p style={styles.hint}>Add at least one more PDF to enable merging.</p>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "40px 16px",
    backgroundColor: "#f8f9fb",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
    padding: "32px",
    width: "100%",
    maxWidth: 560,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  headerIcon: {
    width: 36,
    height: 36,
    color: "#e53935",
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#1a1a2e",
  },
  subtitle: {
    margin: "2px 0 0",
    fontSize: 13,
    color: "#666",
  },
  dropZone: {
    border: "2px dashed #d0d5dd",
    borderRadius: 12,
    padding: "36px 24px",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s",
    background: "#fafbfc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  dropZoneActive: {
    borderColor: "#e53935",
    background: "#fff5f5",
  },
  uploadIcon: {
    width: 40,
    height: 40,
    color: "#e53935",
    marginBottom: 4,
  },
  dropText: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: "#1a1a2e",
  },
  dropSub: {
    margin: 0,
    fontSize: 13,
    color: "#888",
  },
  badge: {
    marginTop: 8,
    fontSize: 11,
    background: "#f0f0f0",
    color: "#555",
    borderRadius: 20,
    padding: "3px 10px",
    fontWeight: 500,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff5f5",
    border: "1px solid #fca5a5",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#b91c1c",
  },
  errorIcon: {
    width: 16,
    height: 16,
    flexShrink: 0,
  },
  fileSection: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  fileSectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fileCount: {
    fontSize: 13,
    fontWeight: 600,
    color: "#444",
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "#e53935",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 500,
    padding: "2px 6px",
  },
  fileList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fileItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#f8f9fb",
    borderRadius: 8,
    padding: "8px 12px",
    border: "1px solid #eee",
  },
  fileOrder: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "#e53935",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fileIcon: {
    width: 16,
    height: 16,
    color: "#e53935",
    flexShrink: 0,
  },
  fileName: {
    flex: 1,
    fontSize: 13,
    color: "#333",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileSize: {
    fontSize: 11,
    color: "#888",
    flexShrink: 0,
  },
  fileActions: {
    display: "flex",
    gap: 4,
    flexShrink: 0,
  },
  arrowBtn: {
    background: "none",
    border: "1px solid #ddd",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 10,
    width: 22,
    height: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#555",
    padding: 0,
  },
  removeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    color: "#aaa",
    width: 22,
    height: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    borderRadius: 4,
  },
  mergeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: "#e53935",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "13px 24px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s, opacity 0.2s",
  },
  mergeBtnDisabled: {
    background: "#ccc",
    cursor: "not-allowed",
  },
  countPill: {
    background: "rgba(255,255,255,0.3)",
    borderRadius: 20,
    padding: "1px 7px",
    fontSize: 12,
    fontWeight: 700,
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.8s linear infinite",
  },
  hint: {
    margin: 0,
    textAlign: "center",
    fontSize: 12,
    color: "#e53935",
  },
};
