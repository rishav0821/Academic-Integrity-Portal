import { useEffect, useState, useContext } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import AuthContext from "../context/AuthContext";
import {
  FiPlus, FiX, FiCheck, FiClock, FiAlertTriangle, FiMessageSquare,
  FiTrash2, FiChevronDown, FiSend, FiInbox, FiRefreshCw
} from "react-icons/fi";

/* ─── Config ────────────────────────────────────────────── */
const REQUEST_TYPES = [
  { value: "marks_revaluation",    label: "📝 Marks Re-evaluation",       desc: "Disagree with marks awarded in an exam or assessment." },
  { value: "integrity_flag_dispute", label: "🛡 Integrity Flag Dispute",   desc: "Contest an academic integrity flag raised on your record." },
  { value: "plagiarism_review",    label: "🔍 Plagiarism Review",          desc: "Request a manual review of a plagiarism detection result." },
  { value: "grade_appeal",         label: "🎓 Grade Appeal",               desc: "Formally appeal your final grade for a subject." },
  { value: "attendance_correction",label: "📅 Attendance Correction",      desc: "Report an incorrect attendance record." },
  { value: "ai_score_dispute",     label: "🤖 AI Score Dispute",           desc: "Challenge a high AI-generated content score on your work." },
  { value: "other",                label: "💬 Other",                      desc: "Any other concern not covered above." },
];

const STATUS_META = {
  pending:      { label: "Pending",      color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: <FiClock size={13} /> },
  under_review: { label: "Under Review", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: <FiRefreshCw size={13} /> },
  resolved:     { label: "Resolved",     color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: <FiCheck size={13} /> },
  rejected:     { label: "Rejected",     color: "#ef4444", bg: "rgba(239,68,68,0.12)",  icon: <FiX size={13} /> },
};

const typeLabel = (v) => REQUEST_TYPES.find(t => t.value === v)?.label || v;

/* ─── Create Request Modal ───────────────────────────────── */
const CreateModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ type: "", subject: "", semester: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const selectedType = REQUEST_TYPES.find(t => t.value === form.type);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type || !form.subject || !form.description) return setError("Please fill all required fields.");
    setError(""); setSaving(true);
    try {
      const res = await api.post("/requests", form);
      onCreated(res.data.request);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request.");
    } finally { setSaving(false); }
  };

  return (
    <>
      <div onClick={onClose} style={ms.overlay} />
      <div style={ms.modal}>
        <div style={ms.header}>
          <h2 style={ms.title}><FiPlus size={18} style={{ marginRight: 8 }} />New Request</h2>
          <button onClick={onClose} style={ms.closeBtn}><FiX size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={ms.body}>
          {/* Request type cards */}
          <div style={{ marginBottom: 20 }}>
            <label style={ms.label}>Request Type *</label>
            <div style={ms.typeGrid}>
              {REQUEST_TYPES.map(t => (
                <div key={t.value}
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  style={{ ...ms.typeCard, borderColor: form.type === t.value ? "#e91e8c" : "#2a3a58", background: form.type === t.value ? "rgba(233,30,140,0.08)" : "#0d1117" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: form.type === t.value ? "#e91e8c" : "#e0e6f0", marginBottom: 3 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: "#8892a4", lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div style={ms.field}>
            <label style={ms.label}>Subject / Course *</label>
            <input style={ms.input} placeholder="e.g. Machine Learning, Operating Systems" value={form.subject} onChange={set("subject")} required />
          </div>

          {/* Semester */}
          <div style={ms.field}>
            <label style={ms.label}>Semester</label>
            <select style={ms.input} value={form.semester} onChange={set("semester")}>
              <option value="">Select semester (optional)</option>
              {["1","2","3","4","5","6","7","8"].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>

          {/* Description */}
          <div style={ms.field}>
            <label style={ms.label}>Description *</label>
            <textarea style={{ ...ms.input, height: 100, resize: "vertical" }}
              placeholder="Explain your concern in detail. Be specific about the marks, subject, exam, etc."
              value={form.description} onChange={set("description")} required />
          </div>

          {error && <div style={ms.errBanner}><FiAlertTriangle size={14} style={{ marginRight: 6 }} />{error}</div>}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" onClick={onClose} style={ms.cancelBtn}>Cancel</button>
            <button type="submit" disabled={saving} style={ms.submitBtn}>
              <FiSend size={14} style={{ marginRight: 6 }} />
              {saving ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

/* ─── Respond Modal (Teacher) ────────────────────────────── */
const RespondModal = ({ request, onClose, onResponded }) => {
  const [status, setStatus] = useState(request.status === "pending" ? "under_review" : request.status);
  const [response, setResponse] = useState(request.teacherResponse || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/requests/${request._id}/respond`, { status, teacherResponse: response });
      onResponded(res.data.request);
      onClose();
    } catch (err) { alert(err.response?.data?.message || "Failed."); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div onClick={onClose} style={ms.overlay} />
      <div style={{ ...ms.modal, maxWidth: 480 }}>
        <div style={ms.header}>
          <h2 style={ms.title}><FiMessageSquare size={16} style={{ marginRight: 8 }} />Respond to Request</h2>
          <button onClick={onClose} style={ms.closeBtn}><FiX size={18} /></button>
        </div>
        <div style={ms.body}>
          <div style={{ background: "#0d1117", borderRadius: 8, padding: "12px 16px", marginBottom: 20, border: "1px solid #2a3a58" }}>
            <div style={{ fontSize: 12, color: "#8892a4", marginBottom: 4 }}>Student Request</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e6f0", marginBottom: 4 }}>{typeLabel(request.type)}</div>
            <div style={{ fontSize: 12, color: "#8892a4" }}>{request.subject} {request.semester ? `· Sem ${request.semester}` : ""}</div>
            <div style={{ fontSize: 13, color: "#e0e6f0", marginTop: 8, lineHeight: 1.5 }}>{request.description}</div>
          </div>

          <div style={ms.field}>
            <label style={ms.label}>Update Status</label>
            <select style={ms.input} value={status} onChange={e => setStatus(e.target.value)}>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div style={ms.field}>
            <label style={ms.label}>Your Response / Remarks</label>
            <textarea style={{ ...ms.input, height: 100, resize: "vertical" }}
              placeholder="Explain your decision or ask for more information from the student…"
              value={response} onChange={e => setResponse(e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={ms.cancelBtn}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={ms.submitBtn}>
              <FiCheck size={14} style={{ marginRight: 6 }} />{saving ? "Saving…" : "Save Response"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── Request Card ───────────────────────────────────────── */
const RequestCard = ({ req, isTeacher, onDelete, onRespond }) => {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[req.status] || STATUS_META.pending;

  return (
    <div style={cs.card}>
      <div style={cs.cardTop} onClick={() => setExpanded(v => !v)}>
        <div style={cs.cardLeft}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e0e6f0", marginBottom: 4 }}>{typeLabel(req.type)}</div>
          <div style={{ fontSize: 12, color: "#8892a4" }}>
            {req.subject}{req.semester ? ` · Sem ${req.semester}` : ""}
            {isTeacher && <span style={{ marginLeft: 8, color: "#e91e8c" }}>· {req.studentName}</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ ...cs.statusBadge, background: meta.bg, color: meta.color }}>
            {meta.icon}&nbsp;{meta.label}
          </span>
          <FiChevronDown size={16} color="#8892a4" style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "0.2s" }} />
        </div>
      </div>

      {expanded && (
        <div style={cs.cardBody}>
          <div style={cs.descBox}>
            <div style={{ fontSize: 11, color: "#8892a4", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Description</div>
            <p style={{ margin: 0, fontSize: 13, color: "#e0e6f0", lineHeight: 1.6 }}>{req.description}</p>
          </div>

          {req.teacherResponse && (
            <div style={{ ...cs.descBox, borderColor: "#10b981", background: "rgba(16,185,129,0.06)" }}>
              <div style={{ fontSize: 11, color: "#10b981", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Teacher's Response</div>
              <p style={{ margin: 0, fontSize: 13, color: "#e0e6f0", lineHeight: 1.6 }}>{req.teacherResponse}</p>
            </div>
          )}

          <div style={{ fontSize: 11, color: "#8892a4", marginTop: 8 }}>
            Submitted: {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            {req.respondedAt && <> · Responded: {new Date(req.respondedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            {isTeacher && (
              <button onClick={() => onRespond(req)} style={cs.actionBtn("#e91e8c")}>
                <FiMessageSquare size={13} style={{ marginRight: 6 }} />Respond
              </button>
            )}
            {!isTeacher && req.status === "pending" && (
              <button onClick={() => onDelete(req._id)} style={cs.actionBtn("#ef4444")}>
                <FiTrash2 size={13} style={{ marginRight: 6 }} />Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Tools/Requests Page ───────────────────────────── */
const Tools = () => {
  const { user: ctxUser } = useContext(AuthContext);
  const [userRole, setUserRole] = useState("student");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [respondTarget, setRespondTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get("/auth/profile");
        const role = profileRes.data.role;
        setUserRole(role);
        const endpoint = (role === "teacher" || role === "admin") ? "/requests" : "/requests/mine";
        const res = await api.get(endpoint);
        setRequests(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this request?")) return;
    await api.delete(`/requests/${id}`);
    setRequests(r => r.filter(req => req._id !== id));
  };

  const handleCreated = (req) => setRequests(r => [req, ...r]);
  const handleResponded = (updated) => setRequests(r => r.map(req => req._id === updated._id ? updated : req));

  const isTeacher = userRole === "teacher" || userRole === "admin";

  const filtered = filterStatus === "all" ? requests : requests.filter(r => r.status === filterStatus);

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    under_review: requests.filter(r => r.status === "under_review").length,
    resolved: requests.filter(r => r.status === "resolved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  if (loading) return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #2a3a58", borderTop: "3px solid #e91e8c", animation: "spin 0.8s linear infinite" }} />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      {respondTarget && <RespondModal request={respondTarget} onClose={() => setRespondTarget(null)} onResponded={handleResponded} />}

      <div style={ps.page}>
        {/* Header */}
        <div style={ps.header}>
          <div>
            <h1 style={ps.title}>
              <FiInbox size={20} style={{ marginRight: 10, verticalAlign: "middle", color: "#e91e8c" }} />
              {isTeacher ? "Student Requests" : "My Requests"}
            </h1>
            <p style={ps.subtitle}>
              {isTeacher ? "Manage and respond to student requests" : "Raise requests to your teacher for marks, integrity or attendance issues"}
            </p>
          </div>
          {!isTeacher && (
            <button onClick={() => setShowCreate(true)} style={ps.createBtn}>
              <FiPlus size={16} style={{ marginRight: 8 }} />New Request
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={ps.statsRow}>
          {[
            { key: "all", label: "Total", color: "#e0e6f0" },
            { key: "pending", label: "Pending", color: "#f59e0b" },
            { key: "under_review", label: "Under Review", color: "#3b82f6" },
            { key: "resolved", label: "Resolved", color: "#10b981" },
            { key: "rejected", label: "Rejected", color: "#ef4444" },
          ].map(s => (
            <div key={s.key}
              onClick={() => setFilterStatus(s.key)}
              style={{ ...ps.statPill, borderColor: filterStatus === s.key ? s.color : "#2a3a58", background: filterStatus === s.key ? `${s.color}18` : "#16213e", cursor: "pointer" }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{counts[s.key]}</span>
              <span style={{ fontSize: 11, color: "#8892a4" }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Request list */}
        {filtered.length === 0 ? (
          <div style={ps.empty}>
            <FiInbox size={48} color="#2a3a58" />
            <p style={{ color: "#8892a4", marginTop: 16, fontSize: 15 }}>
              {filterStatus === "all"
                ? isTeacher ? "No student requests yet." : "You haven't raised any requests yet."
                : `No ${filterStatus.replace("_", " ")} requests.`}
            </p>
            {!isTeacher && filterStatus === "all" && (
              <button onClick={() => setShowCreate(true)} style={{ ...ps.createBtn, marginTop: 16 }}>
                <FiPlus size={14} style={{ marginRight: 6 }} />Raise Your First Request
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(req => (
              <RequestCard key={req._id} req={req} isTeacher={isTeacher}
                onDelete={handleDelete} onRespond={setRespondTarget} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

/* ─── Styles ─────────────────────────────────────────────── */
const ps = {
  page: { maxWidth: "900px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 },
  title: { margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#e0e6f0" },
  subtitle: { margin: 0, fontSize: 13, color: "#8892a4" },
  createBtn: { display: "flex", alignItems: "center", padding: "10px 20px", background: "linear-gradient(135deg,#e91e8c,#c4186e)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(233,30,140,0.3)" },
  statsRow: { display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" },
  statPill: { display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 20px", border: "1.5px solid", borderRadius: 10, minWidth: 80, transition: "all 0.2s" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0" },
};
const cs = {
  card: { background: "#16213e", border: "1.5px solid #2a3a58", borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", cursor: "pointer" },
  cardLeft: { flex: 1 },
  statusBadge: { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  cardBody: { padding: "0 20px 20px", borderTop: "1px solid #2a3a58" },
  descBox: { background: "#0d1117", border: "1px solid #2a3a58", borderRadius: 8, padding: "12px 14px", marginTop: 14 },
  actionBtn: (color) => ({ display: "flex", alignItems: "center", padding: "8px 14px", background: `${color}18`, border: `1.5px solid ${color}`, borderRadius: 8, color, fontSize: 12, fontWeight: 700, cursor: "pointer" }),
};
const ms = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, backdropFilter: "blur(3px)" },
  modal: { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "90%", maxWidth: 680, background: "#16213e", border: "1.5px solid #2a3a58", borderRadius: 16, zIndex: 1001, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #2a3a58", background: "linear-gradient(135deg,#1a1a2e,#16213e)" },
  title: { margin: 0, fontSize: 16, fontWeight: 700, color: "#e0e6f0", display: "flex", alignItems: "center" },
  closeBtn: { background: "#2a3a58", border: "none", borderRadius: 8, color: "#e0e6f0", cursor: "pointer", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" },
  body: { overflowY: "auto", padding: "20px 24px" },
  errBanner: { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#ef4444", fontSize: 13, display: "flex", alignItems: "center", marginBottom: 16 },
  typeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 },
  typeCard: { border: "1.5px solid", borderRadius: 8, padding: "10px 12px", cursor: "pointer", transition: "all 0.15s" },
  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#8892a4", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { width: "100%", padding: "11px 14px", background: "#0d1117", border: "1.5px solid #2a3a58", borderRadius: 8, fontSize: 14, color: "#e0e6f0", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  cancelBtn: { padding: "10px 18px", borderRadius: 8, border: "1px solid #2a3a58", background: "#0d1117", color: "#8892a4", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  submitBtn: { display: "flex", alignItems: "center", padding: "10px 20px", background: "linear-gradient(135deg,#e91e8c,#c4186e)", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" },
};

export default Tools;
