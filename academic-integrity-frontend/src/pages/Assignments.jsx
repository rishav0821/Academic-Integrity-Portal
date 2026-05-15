import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import {
  FiPlus, FiX, FiAlertTriangle, FiCheckCircle, FiClock,
  FiUsers, FiEye, FiAward, FiBook, FiCalendar, FiTrash2,
  FiPaperclip, FiDownload, FiFileText, FiUploadCloud,
} from "react-icons/fi";

const plagColor = (s) => s >= 70 ? "#d7285c" : s >= 30 ? "#f6a117" : "#0a8a0a";
const plagLabel = (s) => s >= 70 ? "High Risk" : s >= 30 ? "Moderate" : "Low";

// ─── open a file via authenticated axios (avoids 401 on direct URL) ───────────
async function openAuthFile(url) {
  try {
    const res = await api.get(url, { responseType: "blob" });
    const blobUrl = URL.createObjectURL(res.data);
    window.open(blobUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch {
    alert("Failed to load file. Please try again.");
  }
}

// ─── FilePicker ───────────────────────────────────────────────────────────────
const FilePicker = ({ file, onChange, inputId, label }) => (
  <div>
    <label style={st.label}><FiPaperclip size={13} /> {label}</label>
    <div style={st.dropZone} onClick={() => document.getElementById(inputId).click()}>
      {file ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
          <FiFileText size={20} color="#0465a3" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>{file.name}</div>
            <div style={{ fontSize: "12px", color: "#888" }}>{(file.size / 1024).toFixed(1)} KB</div>
          </div>
          <button type="button"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#d7285c" }}
            onClick={(e) => { e.stopPropagation(); onChange(null); }}>
            <FiX size={16} />
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center", color: "#999" }}>
          <FiUploadCloud size={26} style={{ marginBottom: "6px" }} />
          <div style={{ fontSize: "13px" }}>Click to upload PDF or image (max 10 MB)</div>
        </div>
      )}
    </div>
    <input id={inputId} type="file" accept=".pdf,.png,.jpg,.jpeg"
      style={{ display: "none" }}
      onChange={(e) => onChange(e.target.files[0] || null)} />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Assignments = () => {
  const [user, setUser] = useState(null);
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Teacher: create form
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", subject: "", dueDate: "", maxMarks: 100 });
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

  // Student: submit modal
  const [submitTarget, setSubmitTarget] = useState(null);
  const [submitText, setSubmitText] = useState("");
  const [submitFile, setSubmitFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // Teacher: view submissions
  const [viewTarget, setViewTarget] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [subLoading, setSubLoading] = useState(false);

  // Student: my submission
  const [mySubTarget, setMySubTarget] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get("/assignments");
      setAssignments(res.data);
    } catch { setError("Failed to load assignments."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    api.get("/dashboard").then((r) => setUser(r.data.user)).catch(() => {});
    fetchAssignments();
  }, [fetchAssignments]);

  // ── Teacher: create ──
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setCreateMsg("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (attachmentFile) fd.append("attachment", attachmentFile);
      await api.post("/assignments", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setCreateMsg("✅ Assignment created!");
      setForm({ title: "", description: "", subject: "", dueDate: "", maxMarks: 100 });
      setAttachmentFile(null);
      fetchAssignments();
      setTimeout(() => { setShowCreate(false); setCreateMsg(""); }, 1500);
    } catch (err) {
      setCreateMsg("❌ " + (err.response?.data?.message || "Error creating assignment"));
    } finally { setCreating(false); }
  };

  // ── Teacher: delete ──
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment and all its submissions?")) return;
    try { await api.delete(`/assignments/${id}`); fetchAssignments(); }
    catch { alert("Failed to delete."); }
  };

  // ── Student: submit (file + optional text) ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setSubmitResult(null);
    try {
      const fd = new FormData();
      if (submitText.trim()) fd.append("content", submitText);
      if (submitFile) fd.append("submissionFile", submitFile);
      const res = await api.post(`/assignments/${submitTarget._id}/submit`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitResult(res.data);
      fetchAssignments();
    } catch (err) {
      setSubmitResult({ error: err.response?.data?.message || "Submission failed" });
    } finally { setSubmitting(false); }
  };

  // ── Teacher: view submissions ──
  const handleViewSubmissions = async (assignment) => {
    setViewTarget(assignment); setSubLoading(true);
    try {
      const res = await api.get(`/assignments/${assignment._id}/submissions`);
      setSubmissions(res.data);
    } catch { setSubmissions([]); }
    finally { setSubLoading(false); }
  };

  const handleGrade = async (submissionId, marks) => {
    try {
      await api.put(`/assignments/${viewTarget._id}/submissions/${submissionId}/grade`, { marks: Number(marks) });
      handleViewSubmissions(viewTarget);
    } catch { alert("Failed to save marks."); }
  };

  // ── Student: my submission ──
  const handleViewMine = async (assignment) => {
    setMySubTarget(assignment);
    try {
      const res = await api.get(`/assignments/${assignment._id}/my-submission`);
      setMySubmission(res.data);
    } catch { setMySubmission(null); }
  };

  const handleDeleteMySubmission = async () => {
    if (!window.confirm("Delete your submission? You will be able to resubmit after deletion.")) return;
    try {
      await api.delete(`/assignments/${mySubTarget._id}/my-submission`);
      setMySubmission(null);
      setMySubTarget(null);
      fetchAssignments();
    } catch {
      alert("Failed to delete submission.");
    }
  };

  const closeSubmit = () => { setSubmitTarget(null); setSubmitResult(null); setSubmitText(""); setSubmitFile(null); };
  const isPastDue = (d) => new Date(d) < new Date();
  const canSubmit = submitFile || submitText.trim().length >= 20;

  return (
    <Layout>
      <div style={st.container}>
        {/* Header */}
        <div style={st.header}>
          <div>
            <h2 style={{ margin: 0 }}>Assignments</h2>
            <p style={{ margin: "4px 0 0", color: "#666" }}>
              {isTeacher ? "Create assignments and review plagiarism results" : "Download question papers, prepare and submit your assignments"}
            </p>
          </div>
          {isTeacher && (
            <button style={st.primaryBtn} onClick={() => setShowCreate(true)}>
              <FiPlus /> New Assignment
            </button>
          )}
        </div>

        {/* ── Create Modal ── */}
        {showCreate && (
          <div style={st.overlay}>
            <div style={st.modal}>
              <div style={st.modalHeader}>
                <h3 style={{ margin: 0 }}>Create Assignment</h3>
                <FiX size={20} style={{ cursor: "pointer" }} onClick={() => setShowCreate(false)} />
              </div>
              <form onSubmit={handleCreate} style={st.form}>
                <label style={st.label}>Title</label>
                <input style={st.input} required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Essay on Climate Change" />

                <label style={st.label}>Subject</label>
                <input style={st.input} required value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Environmental Science" />

                <label style={st.label}>Description / Instructions</label>
                <textarea style={{ ...st.input, height: "90px", resize: "vertical" }} required value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the assignment requirements..." />

                <div style={{ display: "flex", gap: "15px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={st.label}>Due Date</label>
                    <input style={st.input} type="datetime-local" required value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={st.label}>Max Marks</label>
                    <input style={st.input} type="number" min="1" max="100" value={form.maxMarks}
                      onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} />
                  </div>
                </div>

                <FilePicker
                  file={attachmentFile}
                  onChange={setAttachmentFile}
                  inputId="assignmentFile"
                  label="Question Paper (PDF / Image — optional)"
                />

                {createMsg && <div style={st.msg}>{createMsg}</div>}
                <button type="submit" style={{ ...st.primaryBtn, width: "100%", justifyContent: "center" }} disabled={creating}>
                  {creating ? "Creating..." : "Publish Assignment"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Student Submit Modal ── */}
        {submitTarget && (
          <div style={st.overlay}>
            <div style={{ ...st.modal, maxWidth: "700px" }}>
              <div style={st.modalHeader}>
                <div>
                  <h3 style={{ margin: 0 }}>{submitTarget.title}</h3>
                  <p style={{ margin: "4px 0 0", color: "#888", fontSize: "13px" }}>{submitTarget.subject}</p>
                </div>
                <FiX size={20} style={{ cursor: "pointer" }} onClick={closeSubmit} />
              </div>

              {!submitResult ? (
                <form onSubmit={handleSubmit} style={st.form}>
                  {/* Instructions */}
                  <div style={st.descBox}>
                    <strong>Instructions:</strong> {submitTarget.description}
                  </div>

                  {/* Download question paper */}
                  {submitTarget.attachment?.filename && (
                    <div style={{ ...st.descBox, background: "#f0f4ff", borderColor: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FiFileText size={20} color="#6c5ce7" />
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "14px", color: "#333" }}>Question Paper</div>
                          <div style={{ fontSize: "12px", color: "#888" }}>{submitTarget.attachment.filename}</div>
                        </div>
                      </div>
                      <button type="button"
                        style={{ ...st.actionBtn, color: "#6c5ce7", borderColor: "#6c5ce7" }}
                        onClick={() => openAuthFile(`/assignments/${submitTarget._id}/attachment`)}>
                        <FiDownload size={14} /> Download
                      </button>
                    </div>
                  )}

                  {/* File upload section */}
                  <FilePicker
                    file={submitFile}
                    onChange={setSubmitFile}
                    inputId="submissionFile"
                    label="Upload Your Completed Assignment (PDF / Image)"
                  />

                  {/* Divider */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#bbb", fontSize: "12px" }}>
                    <div style={{ flex: 1, height: "1px", background: "#eee" }} />
                    OR also add a text answer
                    <div style={{ flex: 1, height: "1px", background: "#eee" }} />
                  </div>

                  {/* Text answer */}
                  <label style={st.label}>Text Answer (optional if file uploaded, min 20 chars if no file)</label>
                  <textarea
                    style={{ ...st.input, height: "160px", resize: "vertical" }}
                    value={submitText}
                    onChange={(e) => setSubmitText(e.target.value)}
                    placeholder="Write your answer here..."
                    disabled={submitting}
                  />
                  {submitText.length > 0 && (
                    <div style={{ fontSize: "12px", color: "#999" }}>{submitText.length} characters</div>
                  )}

                  {!canSubmit && (
                    <div style={{ fontSize: "12px", color: "#f6a117", padding: "8px 12px", background: "#fef5e7", borderRadius: "6px" }}>
                      Please upload a file or write at least 20 characters of text to submit.
                    </div>
                  )}

                  <button type="submit"
                    style={{ ...st.primaryBtn, width: "100%", justifyContent: "center", opacity: (!canSubmit || submitting) ? 0.6 : 1 }}
                    disabled={!canSubmit || submitting}>
                    {submitting ? "Submitting & Checking Plagiarism..." : "Submit Assignment"}
                  </button>
                </form>
              ) : submitResult.error ? (
                <div style={{ padding: "30px", textAlign: "center" }}>
                  <FiAlertTriangle size={40} color="#d7285c" />
                  <p style={{ color: "#d7285c", fontWeight: "600", marginTop: "15px" }}>{submitResult.error}</p>
                  <button style={st.secondaryBtn} onClick={() => setSubmitResult(null)}>Try Again</button>
                </div>
              ) : (
                <PlagiarismResult result={submitResult} onClose={closeSubmit} />
              )}
            </div>
          </div>
        )}

        {/* ── Teacher: Submissions Panel ── */}
        {viewTarget && (
          <div style={st.overlay}>
            <div style={{ ...st.modal, maxWidth: "900px", maxHeight: "85vh", overflowY: "auto" }}>
              <div style={st.modalHeader}>
                <div>
                  <h3 style={{ margin: 0 }}>Submissions — {viewTarget.title}</h3>
                  <p style={{ margin: "4px 0 0", color: "#888", fontSize: "13px" }}>{submissions.length} submission(s)</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <RecheckButton assignmentId={viewTarget._id} onDone={() => handleViewSubmissions(viewTarget)} />
                  <FiX size={20} style={{ cursor: "pointer" }} onClick={() => setViewTarget(null)} />
                </div>
              </div>
              {subLoading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>No submissions yet.</div>
              ) : (
                <div style={{ padding: "20px" }}>
                  {submissions.map((sub) => (
                    <SubmissionCard key={sub._id} sub={sub} assignmentId={viewTarget._id} onGrade={handleGrade} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Student: My Submission ── */}
        {mySubTarget && (
          <div style={st.overlay}>
            <div style={{ ...st.modal, maxWidth: "600px" }}>
              <div style={st.modalHeader}>
                <h3 style={{ margin: 0 }}>My Submission — {mySubTarget.title}</h3>
                <FiX size={20} style={{ cursor: "pointer" }} onClick={() => { setMySubTarget(null); setMySubmission(null); }} />
              </div>
              {mySubmission ? (
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
                  <PlagiarismResult
                    result={{ plagiarismScore: mySubmission.plagiarismScore, similarTo: mySubmission.similarTo, status: mySubmission.status }}
                    onClose={() => { setMySubTarget(null); setMySubmission(null); }}
                  />
                  {/* Submitted file */}
                  {mySubmission.submissionFile?.filename && (
                    <div style={{ ...st.descBox, background: "#f0f4ff", borderColor: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FiFileText size={20} color="#6c5ce7" />
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "14px" }}>Your Submitted File</div>
                          <div style={{ fontSize: "12px", color: "#888" }}>{mySubmission.submissionFile.filename} · {(mySubmission.submissionFile.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      <button style={{ ...st.actionBtn, color: "#6c5ce7", borderColor: "#6c5ce7" }}
                        onClick={() => openAuthFile(`/assignments/${mySubTarget._id}/my-submission/file`)}>
                        <FiEye size={14} /> View
                      </button>
                    </div>
                  )}
                  {/* Text answer */}
                  {mySubmission.content && (
                    <div>
                      <label style={st.label}>Your Text Answer</label>
                      <div style={{ ...st.descBox, whiteSpace: "pre-wrap", maxHeight: "200px", overflowY: "auto" }}>{mySubmission.content}</div>
                    </div>
                  )}
                  {/* Marks */}
                  {mySubmission.marks != null && (
                    <div style={{ ...st.descBox, background: "#e6f9ed", borderColor: "#0a8a0a" }}>
                      <strong>Marks Awarded:</strong> {mySubmission.marks} / {mySubTarget.maxMarks}
                    </div>
                  )}
                  {/* Delete submission */}
                  {mySubmission.marks == null && (
                    <button
                      style={{ ...st.actionBtn, color: "#d7285c", borderColor: "#d7285c", alignSelf: "flex-start", marginTop: "4px" }}
                      onClick={handleDeleteMySubmission}
                    >
                      <FiTrash2 size={14} /> Delete Submission
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ padding: "30px", textAlign: "center", color: "#888" }}>You haven't submitted this assignment yet.</div>
              )}
            </div>
          </div>
        )}

        {/* ── Assignment Cards ── */}
        {loading ? (
          <div style={st.center}><div style={st.spinner} /><p style={{ color: "#888", marginTop: "15px" }}>Loading assignments...</p></div>
        ) : error ? (
          <div style={st.center}><FiAlertTriangle size={40} color="#f6a117" /><p style={{ color: "#888", marginTop: "10px" }}>{error}</p></div>
        ) : assignments.length === 0 ? (
          <div style={st.center}>
            <FiBook size={50} color="#ddd" />
            <p style={{ color: "#999", marginTop: "15px" }}>No assignments yet.{isTeacher ? " Create one to get started." : ""}</p>
          </div>
        ) : (
          <div style={st.grid}>
            {assignments.map((a) => (
              <div key={a._id} style={st.card}>
                <div style={st.cardHeader}>
                  <div style={st.subjectTag}><FiBook size={12} /> {a.subject}</div>
                  {isPastDue(a.dueDate)
                    ? <span style={{ ...st.badge, background: "#fbe9ed", color: "#d7285c" }}>Closed</span>
                    : <span style={{ ...st.badge, background: "#e6f9ed", color: "#0a8a0a" }}>Open</span>}
                </div>
                <h3 style={st.cardTitle}>{a.title}</h3>
                <p style={st.cardDesc}>{a.description}</p>
                <div style={st.cardMeta}>
                  <span style={st.metaItem}><FiCalendar size={12} /> Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                  <span style={st.metaItem}><FiAward size={12} /> {a.maxMarks} marks</span>
                  {a.createdBy && <span style={st.metaItem}><FiUsers size={12} /> {a.createdBy.name}</span>}
                </div>
                {/* Attachment badge */}
                {a.attachment?.filename && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6c5ce7" }}>
                    <FiPaperclip size={12} /> {a.attachment.filename}
                  </div>
                )}
                <div style={st.cardActions}>
                  {isTeacher ? (
                    <>
                      <button style={st.actionBtn} onClick={() => handleViewSubmissions(a)}>
                        <FiEye size={14} /> Submissions
                      </button>
                      <button style={{ ...st.actionBtn, color: "#d7285c", borderColor: "#d7285c" }} onClick={() => handleDelete(a._id)}>
                        <FiTrash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        style={{ ...st.actionBtn, ...(isPastDue(a.dueDate) ? st.disabledBtn : {}) }}
                        onClick={() => !isPastDue(a.dueDate) && setSubmitTarget(a)}
                        disabled={isPastDue(a.dueDate)}
                      >
                        <FiUploadCloud size={14} /> Submit
                      </button>
                      <button style={st.actionBtn} onClick={() => handleViewMine(a)}>
                        <FiEye size={14} /> My Submission
                      </button>
                    </>
                  )}
                  {a.attachment?.filename && (
                    <button
                      style={{ ...st.actionBtn, color: "#6c5ce7", borderColor: "#6c5ce7" }}
                      onClick={() => openAuthFile(`/assignments/${a._id}/attachment`)}
                    >
                      <FiDownload size={14} /> Question Paper
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
};

// ─── Plagiarism Result ────────────────────────────────────────────────────────
const PlagiarismResult = ({ result, onClose }) => {
  const score = result.plagiarismScore || 0;
  const color = plagColor(score);
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: "56px", fontWeight: "800", color }}>{score}%</div>
        <div style={{ fontSize: "16px", fontWeight: "600", color, marginTop: "4px" }}>
          Plagiarism Score — {plagLabel(score)}
        </div>
        <div style={{ marginTop: "8px" }}>
          {score >= 70
            ? <span style={badge("#fbe9ed", "#d7285c")}><FiAlertTriangle /> Flagged for Review</span>
            : score >= 30
            ? <span style={badge("#fef5e7", "#f6a117")}><FiClock /> Moderate Similarity</span>
            : <span style={badge("#e6f9ed", "#0a8a0a")}><FiCheckCircle /> Original Work</span>}
        </div>
      </div>
      <div style={{ background: "#f0f0f0", borderRadius: "8px", height: "10px", margin: "10px 0 20px" }}>
        <div style={{ width: `${score}%`, background: color, height: "100%", borderRadius: "8px", transition: "width 0.5s" }} />
      </div>
      {result.similarTo?.length > 0 && (
        <div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#555", marginBottom: "10px", textTransform: "uppercase" }}>
            Similar Submissions Detected
          </div>
          {result.similarTo.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#fafafa", borderRadius: "6px", marginBottom: "8px", border: "1px solid #eee" }}>
              <span style={{ fontSize: "14px", color: "#333" }}><FiUsers size={13} /> {m.studentName}</span>
              <span style={{ fontSize: "14px", fontWeight: "700", color: plagColor(m.similarity) }}>{m.similarity}% match</span>
            </div>
          ))}
        </div>
      )}
      <button style={{ ...st.secondaryBtn, width: "100%", justifyContent: "center", marginTop: "15px" }} onClick={onClose}>
        Close
      </button>
    </div>
  );
};

const badge = (bg, color) => ({
  display: "inline-flex", alignItems: "center", gap: "5px",
  padding: "5px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600",
  background: bg, color,
});

// ─── Teacher Submission Card ──────────────────────────────────────────────────
const SubmissionCard = ({ sub, assignmentId, onGrade }) => {
  const [marks, setMarks] = useState(sub.marks ?? "");
  const [expanded, setExpanded] = useState(false);
  const score = sub.plagiarismScore || 0;
  const color = plagColor(score);

  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "10px", marginBottom: "15px", overflow: "hidden" }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", background: "#fafbfd", borderBottom: "1px solid #f0f0f0" }}>
        <div>
          <div style={{ fontWeight: "600", fontSize: "15px" }}>{sub.student?.name}</div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            {sub.student?.email}{sub.student?.studentId ? ` · ${sub.student.studentId}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* File badge */}
          {sub.submissionFile?.filename && (
            <span style={{ fontSize: "12px", color: "#6c5ce7", background: "#f0f4ff", padding: "4px 8px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
              <FiPaperclip size={11} /> File submitted
            </span>
          )}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "800", color }}>{score}%</div>
            <div style={{ fontSize: "11px", color: "#999" }}>Plagiarism</div>
          </div>
          <span style={{ ...badge(score >= 70 ? "#fbe9ed" : score >= 30 ? "#fef5e7" : "#e6f9ed", color) }}>
            {plagLabel(score)}
          </span>
          <button style={st.actionBtn} onClick={() => setExpanded(!expanded)}>
            <FiEye size={14} /> {expanded ? "Hide" : "View"}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
          {/* Submitted file */}
          {sub.submissionFile?.filename && (
            <div style={{ ...st.descBox, background: "#f0f4ff", borderColor: "#6c5ce7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FiFileText size={20} color="#6c5ce7" />
                <div>
                  <div style={{ fontWeight: "600", fontSize: "14px" }}>{sub.submissionFile.filename}</div>
                  <div style={{ fontSize: "12px", color: "#888" }}>{(sub.submissionFile.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
              <button style={{ ...st.actionBtn, color: "#6c5ce7", borderColor: "#6c5ce7" }}
                onClick={() => openAuthFile(`/assignments/${assignmentId}/submissions/${sub._id}/file`)}>
                <FiEye size={14} /> View File
              </button>
            </div>
          )}

          {/* Text answer */}
          {sub.content && (
            <div>
              <div style={{ fontSize: "12px", color: "#888", fontWeight: "600", textTransform: "uppercase", marginBottom: "6px" }}>Text Answer</div>
              <div style={{ background: "#f9f9f9", padding: "12px", borderRadius: "6px", fontSize: "14px", lineHeight: "1.6", maxHeight: "150px", overflowY: "auto", whiteSpace: "pre-wrap" }}>
                {sub.content}
              </div>
            </div>
          )}

          {/* Similarity matches */}
          {sub.similarTo?.length > 0 && (
            <div>
              <div style={{ fontSize: "12px", color: "#888", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>Similar To</div>
              {sub.similarTo.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#fef5e7", borderRadius: "6px", marginBottom: "6px", fontSize: "13px" }}>
                  <span>{m.studentName}</span>
                  <strong style={{ color: plagColor(m.similarity) }}>{m.similarity}% match</strong>
                </div>
              ))}
            </div>
          )}

          {/* Grade */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#555" }}>Award Marks:</label>
            <input type="number" min="0" max="100" value={marks}
              onChange={(e) => setMarks(e.target.value)}
              style={{ ...st.input, width: "80px", padding: "8px 10px" }} />
            <button style={st.primaryBtn} onClick={() => onGrade(sub._id, marks)}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Recheck Plagiarism Button ────────────────────────────────────────────────
const RecheckButton = ({ assignmentId, onDone }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleRecheck = async () => {
    setLoading(true); setMsg("");
    try {
      const res = await api.post(`/assignments/${assignmentId}/recheck-plagiarism`);
      setMsg(`✅ ${res.data.message}`);
      onDone();
    } catch {
      setMsg("❌ Re-check failed.");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {msg && <span style={{ fontSize: "13px", color: msg.startsWith("✅") ? "#0a8a0a" : "#d7285c", fontWeight: "600" }}>{msg}</span>}
      <button style={{ ...st.actionBtn, color: "#6c5ce7", borderColor: "#6c5ce7", opacity: loading ? 0.6 : 1 }}
        onClick={handleRecheck} disabled={loading}>
        <FiAlertTriangle size={14} /> {loading ? "Checking..." : "Re-check Plagiarism"}
      </button>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = {
  container: { maxWidth: "1200px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" },
  primaryBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", background: "var(--upes-blue, #0465a3)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  secondaryBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", background: "#f0f0f0", color: "#333", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  actionBtn: { display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", background: "#fff", color: "#0465a3", border: "1px solid #0465a3", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  disabledBtn: { opacity: 0.5, cursor: "not-allowed", color: "#999", borderColor: "#ccc" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" },
  card: { background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #eee", display: "flex", flexDirection: "column", gap: "12px" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  subjectTag: { display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#0465a3", background: "#e6f2f9", padding: "4px 10px", borderRadius: "20px", fontWeight: "600" },
  badge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  cardTitle: { margin: 0, fontSize: "16px", fontWeight: "700", color: "#1a1a2e" },
  cardDesc: { margin: 0, fontSize: "13px", color: "#666", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  cardMeta: { display: "flex", gap: "12px", flexWrap: "wrap" },
  metaItem: { display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#888" },
  cardActions: { display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" },
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0" },
  spinner: { width: "40px", height: "40px", border: "4px solid #e6f2f9", borderTop: "4px solid #0465a3", borderRadius: "50%", animation: "spin 1s linear infinite" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modal: { background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px", borderBottom: "1px solid #eee", position: "sticky", top: 0, background: "#fff", zIndex: 1 },
  form: { display: "flex", flexDirection: "column", gap: "14px", padding: "20px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#444" },
  input: { padding: "10px 14px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px", color: "#333", background: "#f9fafb", outline: "none", width: "100%", boxSizing: "border-box" },
  msg: { padding: "10px 14px", background: "#e6f2f9", borderRadius: "6px", fontSize: "14px", color: "#0465a3", fontWeight: "600" },
  descBox: { padding: "12px 14px", background: "#f9fafb", borderRadius: "6px", fontSize: "14px", color: "#555", border: "1px solid #eee", lineHeight: "1.6" },
  dropZone: { marginTop: "6px", padding: "18px", border: "2px dashed #ddd", borderRadius: "8px", cursor: "pointer", background: "#fafafa", minHeight: "72px", display: "flex", alignItems: "center", justifyContent: "center" },
};

export default Assignments;
