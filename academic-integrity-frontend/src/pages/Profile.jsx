import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import {
  FiUser, FiMail, FiShield, FiBook, FiCheckCircle,
  FiAlertTriangle, FiTrendingUp, FiCalendar, FiAward,
  FiBarChart2, FiEdit2, FiX, FiPhone, FiInfo, FiLock, FiSave
} from "react-icons/fi";

/* ─── Edit Modal ──────────────────────────────────────────── */
const EditModal = ({ user, onClose, onSaved }) => {
  const isStudent = user?.role === "student";
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    department: user?.department || "",
    bio: user?.bio || "",
    studentId: user?.studentId || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return setError("New passwords do not match.");
    }
    try {
      setSaving(true);
      const payload = {
        name: form.name,
        phone: form.phone,
        department: form.department,
        bio: form.bio,
        studentId: form.studentId,
      };
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      const res = await api.put("/auth/profile", payload);
      setSuccess("Profile updated successfully!");
      onSaved(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={ms.overlay} />

      {/* Drawer */}
      <div style={ms.drawer}>
        <div style={ms.drawerHeader}>
          <h2 style={ms.drawerTitle}>Edit Profile</h2>
          <button onClick={onClose} style={ms.closeBtn}><FiX size={20} /></button>
        </div>

        <div style={ms.drawerBody}>
          {error && <div style={ms.errorBanner}>{error}</div>}
          {success && <div style={ms.successBanner}>{success}</div>}

          <Section icon={<FiUser size={16} />} title="Basic Information">
            <Field label="Full Name" value={form.name} onChange={set("name")} placeholder="Your full name" />
            <Field label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" icon={<FiPhone size={14} />} />
            <Field label="Department / Branch" value={form.department} onChange={set("department")} placeholder="e.g. Technology and AI Sciences" />
            {isStudent && (
              <Field label="Student ID / Roll No." value={form.studentId} onChange={set("studentId")} placeholder="e.g. STU2024001" />
            )}
          </Section>

          <Section icon={<FiInfo size={16} />} title="About">
            <label style={ms.label}>Bio / Short Introduction</label>
            <textarea
              value={form.bio}
              onChange={set("bio")}
              placeholder="Write a short bio about yourself…"
              rows={3}
              style={ms.textarea}
            />
          </Section>

          <Section icon={<FiLock size={16} />} title="Change Password">
            <p style={ms.hint}>Leave blank if you don't want to change your password.</p>
            <Field label="Current Password" value={form.currentPassword} onChange={set("currentPassword")} type="password" placeholder="Enter current password" />
            <Field label="New Password" value={form.newPassword} onChange={set("newPassword")} type="password" placeholder="Min 6 characters" />
            <Field label="Confirm New Password" value={form.confirmPassword} onChange={set("confirmPassword")} type="password" placeholder="Re-enter new password" />
          </Section>
        </div>

        <div style={ms.drawerFooter}>
          <button onClick={onClose} style={ms.cancelBtn}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={ms.saveBtn}>
            {saving ? "Saving…" : <><FiSave size={14} style={{ marginRight: 6 }} />Save Changes</>}
          </button>
        </div>
      </div>
    </>
  );
};

const Section = ({ icon, title, children }) => (
  <div style={ms.section}>
    <div style={ms.sectionHead}>
      <span style={ms.sectionIcon}>{icon}</span>
      <span style={ms.sectionTitle}>{title}</span>
    </div>
    {children}
  </div>
);

const Field = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div style={ms.fieldWrap}>
    <label style={ms.label}>{label}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={ms.input} />
  </div>
);

/* Modal styles */
const ms = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.45)", zIndex: 1000, backdropFilter: "blur(2px)"
  },
  drawer: {
    position: "fixed", top: 0, right: 0, bottom: 0, width: "420px",
    background: "#fff", zIndex: 1001, display: "flex", flexDirection: "column",
    boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", animation: "slideIn 0.25s ease"
  },
  drawerHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 24px", borderBottom: "1px solid #f0f0f0",
    background: "linear-gradient(135deg,#0f62b2,#1e3a5f)"
  },
  drawerTitle: { margin: 0, fontSize: "18px", fontWeight: 700, color: "#fff" },
  closeBtn: {
    background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px",
    color: "#fff", cursor: "pointer", width: 36, height: 36,
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  drawerBody: { flex: 1, overflowY: "auto", padding: "20px 24px" },
  drawerFooter: {
    padding: "16px 24px", borderTop: "1px solid #f0f0f0",
    display: "flex", gap: 12, justifyContent: "flex-end"
  },
  section: { marginBottom: 24 },
  sectionHead: {
    display: "flex", alignItems: "center", gap: 8,
    marginBottom: 14, paddingBottom: 8, borderBottom: "2px solid #f0f4ff"
  },
  sectionIcon: {
    width: 28, height: 28, borderRadius: "8px",
    background: "#e8f0fc", display: "flex", alignItems: "center",
    justifyContent: "center", color: "#0f62b2"
  },
  sectionTitle: { fontSize: "14px", fontWeight: 700, color: "#1a1a2e" },
  fieldWrap: { marginBottom: 14 },
  label: { display: "block", fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: 6 },
  input: {
    width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0",
    borderRadius: "8px", fontSize: "14px", color: "#333",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s"
  },
  textarea: {
    width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0",
    borderRadius: "8px", fontSize: "14px", color: "#333",
    outline: "none", boxSizing: "border-box", resize: "vertical",
    fontFamily: "inherit"
  },
  hint: { fontSize: "12px", color: "#999", margin: "0 0 12px" },
  cancelBtn: {
    padding: "10px 20px", borderRadius: "8px",
    border: "1px solid #e0e0e0", background: "#fff",
    fontSize: "14px", cursor: "pointer", color: "#555", fontWeight: 600
  },
  saveBtn: {
    padding: "10px 24px", borderRadius: "8px", border: "none",
    background: "linear-gradient(135deg,#0f62b2,#1e88e5)",
    color: "#fff", fontSize: "14px", cursor: "pointer",
    fontWeight: 700, display: "flex", alignItems: "center"
  },
  errorBanner: {
    background: "#fce8ee", border: "1px solid #f8bbd0", borderRadius: "8px",
    padding: "10px 14px", color: "#c62828", fontSize: "13px", marginBottom: 16
  },
  successBanner: {
    background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "8px",
    padding: "10px 14px", color: "#2e7d32", fontSize: "13px", marginBottom: 16
  },
};

/* ─── Main Profile Component ─────────────────────────────── */
const Profile = () => {
  const [user, setUser] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [gradingData, setGradingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const profileRes = await api.get("/auth/profile");
        const u = profileRes.data;
        setUser(u);
        if (u.role === "student") {
          const [attRes, perfRes] = await Promise.all([
            api.get("/analytics/attendance"),
            api.get("/marks/dashboard"),
          ]);
          setAttendanceData(attRes.data);
          setPerformanceData(perfRes.data);
        } else {
          const gradRes = await api.get("/analytics/grading-consistency");
          setGradingData(gradRes.data);
        }
      } catch (err) {
        console.error("Profile fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div style={styles.loadingWrap}>
          <div style={styles.spinner} />
          <p style={{ color: "#888", marginTop: "16px" }}>Loading profile…</p>
        </div>
      </Layout>
    );
  }

  const isStudent = user?.role === "student";
  const avatarInitial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <Layout>
      {/* Keyframe style tag */}
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>

      {showEdit && (
        <EditModal
          user={user}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => { setUser(updated); setShowEdit(false); }}
        />
      )}

      <div style={styles.page}>
        {/* ── HERO CARD ── */}
        <div style={styles.hero}>
          <div style={styles.avatarRing}>
            <div style={styles.avatar}>{avatarInitial}</div>
          </div>
          <div style={styles.heroInfo}>
            <h1 style={styles.heroName}>{user?.name || "—"}</h1>
            <div style={styles.heroBadgeRow}>
              <span style={{
                ...styles.roleBadge,
                background: isStudent ? "linear-gradient(135deg,#0f62b2,#1e88e5)"
                                      : "linear-gradient(135deg,#6a1b9a,#ab47bc)"
              }}>
                <FiShield size={12} style={{ marginRight: 4 }} />
                {user?.role?.toUpperCase()}
              </span>
              <span style={styles.statusBadge}>
                <FiCheckCircle size={12} style={{ marginRight: 4 }} />
                ACTIVE
              </span>
            </div>
            <p style={styles.heroEmail}>
              <FiMail size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
              {user?.email || "—"}
            </p>
            {user?.phone && (
              <p style={styles.heroEmail}>
                <FiPhone size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                {user.phone}
              </p>
            )}
            {user?.department && (
              <p style={styles.heroEmail}>
                <FiBook size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                {user.department}
              </p>
            )}
            {user?.bio && (
              <p style={{ ...styles.heroEmail, marginTop: 6, fontStyle: "italic" }}>
                "{user.bio}"
              </p>
            )}
          </div>
          <button onClick={() => setShowEdit(true)} style={styles.editBtn}>
            <FiEdit2 size={14} style={{ marginRight: 6 }} /> Edit Profile
          </button>
        </div>

        {/* ── STUDENT VIEW ── */}
        {isStudent && (
          <>
            <div style={styles.statsGrid}>
              <StatCard icon={<FiAward size={26} color="#0f62b2" />} bg="#e8f0fc"
                label="Consistency Score" value={performanceData ? `${performanceData.consistencyScore}/100` : "—"}
                sub={performanceData?.consistencyScore >= 90 ? "Excellent" : "Good"} subColor="#2e7d32" />
              <StatCard icon={<FiAlertTriangle size={26} color="#d7285c" />} bg="#fce8ee"
                label="Academic Warnings" value={performanceData ? performanceData.warnings : "—"}
                sub={performanceData?.warnings === 0 ? "All Clear" : "Action needed"}
                subColor={performanceData?.warnings === 0 ? "#2e7d32" : "#c62828"} />
              <StatCard icon={<FiCalendar size={26} color="#f6a117" />} bg="#fff8e1"
                label="Overall Attendance" value={attendanceData ? `${attendanceData.overallAttendance}%` : "—"}
                sub={attendanceData?.overallAttendance >= 75 ? "On Track" : "Below Threshold"}
                subColor={attendanceData?.overallAttendance >= 75 ? "#2e7d32" : "#c62828"} />
              <StatCard icon={<FiBook size={26} color="#7b1fa2" />} bg="#f3e5f5"
                label="Subjects Tracked" value={attendanceData?.subjects?.length ?? "—"}
                sub="Enrolled this term" subColor="#555" />
            </div>

            {attendanceData?.subjects?.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}><FiCalendar style={{ marginRight: 8, verticalAlign: "middle" }} />Subject-wise Attendance</h2>
                <div style={styles.subjectGrid}>
                  {attendanceData.subjects.map((s, i) => (
                    <div key={i} style={styles.subjectRow}>
                      <div style={styles.subjectName}>{s.name}</div>
                      <div style={styles.barWrap}>
                        <div style={{ ...styles.bar, width: `${s.attendance}%`,
                          background: s.warning ? "linear-gradient(90deg,#d7285c,#f44336)" : "linear-gradient(90deg,#0f62b2,#42a5f5)" }} />
                      </div>
                      <span style={{ ...styles.barLabel, color: s.warning ? "#d7285c" : "#2e7d32" }}>
                        {s.attendance}%{s.warning ? " ⚠" : " ✓"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}><FiShield style={{ marginRight: 8, verticalAlign: "middle" }} />Academic Integrity Status</h2>
              {performanceData?.allFlags?.length > 0 ? (
                performanceData.allFlags.map((flag, i) => (
                  <div key={i} style={styles.flagRow}>
                    <FiAlertTriangle size={16} color="#d7285c" style={{ marginRight: 8, flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", color: "#444" }}>{flag}</span>
                  </div>
                ))
              ) : (
                <div style={styles.allClear}>
                  <FiCheckCircle size={40} color="#2e7d32" />
                  <p style={{ margin: "10px 0 4px", fontWeight: 700, color: "#2e7d32", fontSize: "16px" }}>All Clear</p>
                  <p style={{ margin: 0, color: "#555", fontSize: "13px" }}>No integrity flags on your academic record.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── TEACHER/ADMIN VIEW ── */}
        {!isStudent && (
          <>
            <div style={styles.statsGrid}>
              <StatCard icon={<FiBarChart2 size={26} color="#0f62b2" />} bg="#e8f0fc"
                label="Subjects Monitored" value={gradingData?.consistencyData?.length ?? "—"}
                sub="Active this semester" subColor="#555" />
              <StatCard icon={<FiAlertTriangle size={26} color="#d7285c" />} bg="#fce8ee"
                label="Grading Alerts" value={gradingData?.alerts?.length ?? "—"}
                sub={gradingData?.alerts?.length === 0 ? "No anomalies" : "Review needed"}
                subColor={gradingData?.alerts?.length === 0 ? "#2e7d32" : "#c62828"} />
              <StatCard icon={<FiTrendingUp size={26} color="#f6a117" />} bg="#fff8e1"
                label="At-Risk Students" value={gradingData?.atRiskStudents?.length ?? "—"}
                sub="Low trust score flagged"
                subColor={gradingData?.atRiskStudents?.length > 0 ? "#c62828" : "#2e7d32"} />
              <StatCard icon={<FiUser size={26} color="#7b1fa2" />} bg="#f3e5f5"
                label="Role" value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                sub="Portal access level" subColor="#555" />
            </div>

            {gradingData?.alerts?.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}><FiAlertTriangle style={{ marginRight: 8, verticalAlign: "middle", color: "#d7285c" }} />Grading Anomaly Alerts</h2>
                {gradingData.alerts.map((alert, i) => (
                  <div key={i} style={styles.alertRow}>
                    <div style={{ fontWeight: 600, color: "#d7285c", marginBottom: 4 }}>{alert.subject}</div>
                    <div style={{ fontSize: "13px", color: "#555" }}>{alert.message}</div>
                  </div>
                ))}
              </div>
            )}

            {gradingData?.atRiskStudents?.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}><FiTrendingUp style={{ marginRight: 8, verticalAlign: "middle" }} />At-Risk Students</h2>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f5f7fa" }}>
                      <th style={styles.th}>Student</th><th style={styles.th}>Course</th>
                      <th style={styles.th}>Trust Score</th><th style={styles.th}>Flag Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradingData.atRiskStudents.map((s, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={styles.td}>{s.name}</td>
                        <td style={styles.td}>{s.course}</td>
                        <td style={styles.td}>
                          <span style={{ background: s.trustScore < 50 ? "#fce8ee" : "#fff8e1",
                            color: s.trustScore < 50 ? "#d7285c" : "#f6a117",
                            padding: "2px 10px", borderRadius: "12px", fontWeight: 600, fontSize: "13px" }}>
                            {s.trustScore}
                          </span>
                        </td>
                        <td style={styles.td}>{s.flagReason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {gradingData?.alerts?.length === 0 && gradingData?.atRiskStudents?.length === 0 && (
              <div style={styles.card}>
                <div style={styles.allClear}>
                  <FiCheckCircle size={40} color="#2e7d32" />
                  <p style={{ margin: "10px 0 4px", fontWeight: 700, color: "#2e7d32", fontSize: "16px" }}>Everything Looks Good</p>
                  <p style={{ margin: 0, color: "#555", fontSize: "13px" }}>No grading anomalies or at-risk students flagged.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

const StatCard = ({ icon, bg, label, value, sub, subColor }) => (
  <div style={styles.statCard}>
    <div style={{ ...styles.statIcon, background: bg }}>{icon}</div>
    <div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ fontSize: "11px", color: subColor, marginTop: 2, fontWeight: 600 }}>{sub}</div>
    </div>
  </div>
);

const styles = {
  page: { maxWidth: "1000px", margin: "0 auto" },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh" },
  spinner: { width: 40, height: 40, borderRadius: "50%", border: "4px solid #e0e0e0", borderTop: "4px solid #0f62b2" },
  hero: { display: "flex", alignItems: "center", gap: "24px", background: "linear-gradient(135deg,#0f62b2 0%,#1e3a5f 100%)", borderRadius: "16px", padding: "28px 32px", marginBottom: "24px", color: "#fff", position: "relative", flexWrap: "wrap" },
  avatarRing: { padding: 4, borderRadius: "50%", background: "rgba(255,255,255,0.2)", flexShrink: 0 },
  avatar: { width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#f6a117,#d7285c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 800, color: "#fff" },
  heroInfo: { flex: 1 },
  heroName: { margin: "0 0 8px", fontSize: "24px", fontWeight: 800, color: "#fff" },
  heroBadgeRow: { display: "flex", gap: 10, marginBottom: 8, flexWrap: "wrap" },
  roleBadge: { display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, color: "#fff", letterSpacing: "0.5px" },
  statusBadge: { display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, color: "#fff", background: "rgba(46,125,50,0.85)" },
  heroEmail: { margin: "0 0 4px", fontSize: "14px", color: "rgba(255,255,255,0.8)" },
  editBtn: { display: "flex", alignItems: "center", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer", flexShrink: 0 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px", marginBottom: "24px" },
  statCard: { display: "flex", alignItems: "center", gap: "16px", background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" },
  statIcon: { width: 52, height: 52, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statValue: { fontSize: "22px", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.2 },
  statLabel: { fontSize: "12px", color: "#888", marginTop: 2 },
  card: { background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" },
  sectionTitle: { margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#1a1a2e" },
  subjectGrid: { display: "flex", flexDirection: "column", gap: "14px" },
  subjectRow: { display: "flex", alignItems: "center", gap: "12px" },
  subjectName: { width: "200px", fontSize: "13px", color: "#444", fontWeight: 500, flexShrink: 0 },
  barWrap: { flex: 1, height: "10px", background: "#f0f0f0", borderRadius: "6px", overflow: "hidden" },
  bar: { height: "100%", borderRadius: "6px", transition: "width 0.5s ease" },
  barLabel: { fontSize: "13px", fontWeight: 700, width: "60px", textAlign: "right", flexShrink: 0 },
  flagRow: { display: "flex", alignItems: "flex-start", padding: "10px 14px", background: "#fff5f7", border: "1px solid #fcd", borderRadius: "8px", marginBottom: "8px" },
  allClear: { display: "flex", flexDirection: "column", alignItems: "center", padding: "32px", color: "#555" },
  th: { padding: "10px 14px", fontSize: "12px", fontWeight: 700, color: "#888", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.5px" },
  td: { padding: "12px 14px", fontSize: "13px", color: "#444" },
  alertRow: { padding: "14px", background: "#fff5f7", border: "1px solid #fcd", borderRadius: "8px", marginBottom: "10px" },
};

export default Profile;
