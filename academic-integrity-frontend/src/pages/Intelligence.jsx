import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { FiAlertTriangle, FiUsers, FiClipboard, FiBarChart2, FiFileText, FiRefreshCw, FiDownload, FiChevronDown, FiChevronUp } from "react-icons/fi";

const TABS = [
  { id: "anomalies",    icon: <FiAlertTriangle />, label: "Performance Anomalies" },
  { id: "group",        icon: <FiUsers />,         label: "Group Cheating" },
  { id: "assessment",   icon: <FiClipboard />,     label: "Assessment Quality" },
  { id: "grading",      icon: <FiBarChart2 />,     label: "Grading Consistency" },
  { id: "report",       icon: <FiFileText />,      label: "Full Report" },
];

const SEV = {
  High:   { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  Low:    { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
};

/* ── Reusable components ─────────────────────────── */
const SevBadge = ({ level }) => {
  const m = SEV[level] || SEV.Low;
  return <span style={{ background: m.bg, color: m.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{level}</span>;
};

const Card = ({ children, style }) => (
  <div style={{ background: "#16213e", border: "1.5px solid #2a3a58", borderRadius: 12, padding: 20, marginBottom: 14, ...style }}>
    {children}
  </div>
);

const StatRow = ({ stats }) => (
  <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
    {stats.map((s, i) => (
      <div key={i} style={{ background: "#16213e", border: "1.5px solid #2a3a58", borderRadius: 10, padding: "14px 20px", minWidth: 110 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: s.color || "#e91e8c" }}>{s.value}</div>
        <div style={{ fontSize: 11, color: "#8892a4", marginTop: 2 }}>{s.label}</div>
      </div>
    ))}
  </div>
);

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
    <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #2a3a58", borderTop: "3px solid #e91e8c", animation: "spin 0.8s linear infinite" }} />
  </div>
);

/* ── Tab 1: Performance Anomalies ────────────────── */
const AnomaliesTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/intelligence/anomalies").then(r => setData(r.data)).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner />;
  return (
    <div>
      <StatRow stats={[
        { label: "Total Anomalies", value: data.total, color: "#e91e8c" },
        { label: "High Severity", value: data.highCount, color: "#ef4444" },
        { label: "Subjects Analysed", value: data.subjectStats?.length || 0, color: "#3b82f6" },
      ]} />
      {data.anomalies.length === 0 && <p style={{ color: "#8892a4", textAlign: "center", padding: 40 }}>No anomalies detected in current data.</p>}
      {data.anomalies.map(a => (
        <Card key={a.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e0e6f0", marginBottom: 4 }}>{a.type} — {a.subject}</div>
              <div style={{ fontSize: 13, color: "#8892a4", lineHeight: 1.6 }}>{a.message}</div>
            </div>
            <SevBadge level={a.severity} />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            <div style={{ background: "#0d1117", borderRadius: 8, padding: "8px 14px", fontSize: 13 }}>
              <span style={{ color: "#8892a4" }}>Sem {a.fromSem} avg: </span>
              <span style={{ color: "#e0e6f0", fontWeight: 700 }}>{a.fromAvg}%</span>
            </div>
            {a.fromSem !== a.toSem && (
              <div style={{ background: "#0d1117", borderRadius: 8, padding: "8px 14px", fontSize: 13 }}>
                <span style={{ color: "#8892a4" }}>Sem {a.toSem} avg: </span>
                <span style={{ color: "#e91e8c", fontWeight: 700 }}>{a.toAvg}%</span>
              </div>
            )}
            {a.changePercent > 0 && (
              <div style={{ background: "#0d1117", borderRadius: 8, padding: "8px 14px", fontSize: 13 }}>
                <span style={{ color: "#8892a4" }}>Change: </span>
                <span style={{ color: a.severity === "High" ? "#ef4444" : "#f59e0b", fontWeight: 700 }}>+{a.changePercent}%</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

/* ── Tab 2: Group Cheating ───────────────────────── */
const GroupCheatingTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState({});
  useEffect(() => { api.get("/intelligence/group-cheating").then(r => setData(r.data)).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner />;
  return (
    <div>
      <StatRow stats={[
        { label: "Groups Flagged",    value: data.total,               color: "#e91e8c" },
        { label: "High Confidence",   value: data.highConfidence,      color: "#ef4444" },
        { label: "Students Involved", value: data.totalStudentsFlagged, color: "#f59e0b" },
      ]} />
      {data.groups.map(g => (
        <Card key={g.groupId}>
          <div style={{ display: "flex", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setOpen(o => ({ ...o, [g.groupId]: !o[g.groupId] }))}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e0e6f0", marginBottom: 3 }}>{g.groupId} — {g.subject}</div>
              <div style={{ fontSize: 12, color: "#8892a4" }}>{g.groupSize} students · Sem {g.semester} · Marks: {g.marks}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <SevBadge level={g.confidence === "High" ? "High" : g.confidence === "Medium" ? "Medium" : "Low"} />
              {open[g.groupId] ? <FiChevronUp color="#8892a4" /> : <FiChevronDown color="#8892a4" />}
            </div>
          </div>
          {open[g.groupId] && (
            <div style={{ marginTop: 14, borderTop: "1px solid #2a3a58", paddingTop: 14 }}>
              <p style={{ fontSize: 13, color: "#e0e6f0", margin: "0 0 10px" }}>{g.message}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {g.students.map((s, i) => (
                  <span key={i} style={{ background: "#0d1117", border: "1px solid #2a3a58", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#e0e6f0" }}>{s}</span>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: "#8892a4" }}>Similarity Score: <span style={{ color: "#e91e8c", fontWeight: 700 }}>{(g.similarityScore * 100).toFixed(0)}%</span></div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

/* ── Tab 3: Assessment Quality ───────────────────── */
const AssessmentTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/intelligence/assessment-quality").then(r => setData(r.data)).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner />;
  const RATING = { Good: "#10b981", Moderate: "#f59e0b", Poor: "#ef4444" };
  return (
    <div>
      <StatRow stats={[
        { label: "Subjects Evaluated", value: data.total,     color: "#e91e8c" },
        { label: "Poor Quality",       value: data.poorCount, color: "#ef4444" },
        { label: "Good Quality",       value: data.goodCount, color: "#10b981" },
      ]} />
      {data.assessments.map((a, i) => (
        <Card key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e0e6f0" }}>{a.subject}</div>
            <span style={{ background: `${RATING[a.rating]}18`, color: RATING[a.rating], padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{a.rating}</span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            {[
              { l: "Avg Marks",     v: `${a.mean}%` },
              { l: "Std Deviation", v: a.stdDev },
              { l: "Pass Rate",     v: `${a.passRate}%` },
              { l: "High Scorers",  v: `${a.highScorers}%` },
              { l: "Quality Score", v: `${a.qualityScore}/100` },
            ].map((s, j) => (
              <div key={j} style={{ background: "#0d1117", borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
                <div style={{ color: "#8892a4" }}>{s.l}</div>
                <div style={{ color: "#e0e6f0", fontWeight: 700 }}>{s.v}</div>
              </div>
            ))}
          </div>
          {a.issues.length > 0 && (
            <div>
              {a.issues.map((issue, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#f59e0b", marginBottom: 4 }}>
                  <FiAlertTriangle size={12} />{issue}
                </div>
              ))}
            </div>
          )}
          {/* Quality bar */}
          <div style={{ marginTop: 12, background: "#0d1117", borderRadius: 4, height: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${a.qualityScore}%`, background: RATING[a.rating], borderRadius: 4, transition: "width 0.5s" }} />
          </div>
        </Card>
      ))}
    </div>
  );
};

/* ── Tab 4: Grading Consistency ──────────────────── */
const GradingTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/intelligence/grading-consistency").then(r => setData(r.data)).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner />;
  return (
    <div>
      <StatRow stats={[
        { label: "Subjects",       value: data.total,      color: "#e91e8c" },
        { label: "Alerts Raised",  value: data.alertCount, color: "#ef4444" },
      ]} />
      {data.alerts.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: "#ef4444", fontSize: 14, margin: "0 0 12px" }}>⚠ Grading Alerts</h3>
          {data.alerts.map((a, i) => (
            <Card key={i} style={{ borderColor: "#ef4444" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e0e6f0", marginBottom: 4 }}>{a.subject}</div>
                  <div style={{ fontSize: 13, color: "#8892a4" }}>{a.message}</div>
                </div>
                <SevBadge level={a.severity} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                {a.evaluators.map((e, j) => (
                  <div key={j} style={{ background: "#0d1117", borderRadius: 8, padding: "8px 14px", fontSize: 13 }}>
                    <div style={{ color: "#8892a4", fontSize: 11 }}>{e.name}</div>
                    <div style={{ color: "#e0e6f0", fontWeight: 700 }}>{e.average} avg</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
      {data.results.map((r, i) => (
        <Card key={i}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e0e6f0", marginBottom: 10 }}>{r.subject}</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {r.evaluators.map((e, j) => (
              <div key={j} style={{ background: "#0d1117", borderRadius: 8, padding: "8px 14px", fontSize: 12 }}>
                <div style={{ color: "#8892a4" }}>{e.name}</div>
                <div style={{ color: "#e0e6f0", fontWeight: 700 }}>{e.average} avg · σ {e.stdDev}</div>
                <div style={{ color: "#8892a4" }}>{e.count} students</div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

/* ── Tab 5: Full Report ──────────────────────────── */
const ReportTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/intelligence/full-report").then(r => setData(r.data)).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner />;
  const { overview, highlights, subjectSummary, recommendations } = data;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#8892a4" }}>Generated: {new Date(data.generatedAt).toLocaleString()}</div>
        <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "linear-gradient(135deg,#e91e8c,#c4186e)", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <FiDownload size={14} /> Download / Print
        </button>
      </div>

      {/* Overview */}
      <StatRow stats={[
        { label: "Total Records",    value: overview.totalRecords,      color: "#e0e6f0" },
        { label: "Flagged Records",  value: overview.flaggedRecords,    color: "#ef4444" },
        { label: "Avg Trust Score",  value: `${overview.avgTrustScore}%`, color: overview.avgTrustScore >= 70 ? "#10b981" : "#f59e0b" },
        { label: "High Risk",        value: overview.highRiskStudents,  color: "#e91e8c" },
      ]} />

      {/* Highlights */}
      {highlights.length > 0 && (
        <Card>
          <h3 style={{ margin: "0 0 12px", color: "#e0e6f0", fontSize: 14 }}>Key Findings</h3>
          {highlights.map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, padding: "8px 12px", background: h.severity === "High" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)", borderRadius: 8, borderLeft: `3px solid ${h.severity === "High" ? "#ef4444" : "#f59e0b"}` }}>
              <FiAlertTriangle size={14} color={h.severity === "High" ? "#ef4444" : "#f59e0b"} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13, color: "#e0e6f0" }}>{h.text}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Subject table */}
      <Card>
        <h3 style={{ margin: "0 0 14px", color: "#e0e6f0", fontSize: 14 }}>Subject-wise Summary</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0d1117" }}>
              {["Subject", "Students", "Avg Marks", "Std Dev", "Flagged", "Risk"].map((h, i) => (
                <th key={i} style={{ padding: "8px 12px", fontSize: 11, color: "#8892a4", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjectSummary.map((s, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #2a3a58" }}>
                <td style={{ padding: "10px 12px", fontSize: 13, color: "#e0e6f0", fontWeight: 500 }}>{s.subject}</td>
                <td style={{ padding: "10px 12px", fontSize: 13, color: "#8892a4" }}>{s.students}</td>
                <td style={{ padding: "10px 12px", fontSize: 13, color: "#e0e6f0" }}>{s.avgMarks}%</td>
                <td style={{ padding: "10px 12px", fontSize: 13, color: "#8892a4" }}>{s.stdDev}</td>
                <td style={{ padding: "10px 12px", fontSize: 13, color: s.flagged > 0 ? "#ef4444" : "#10b981" }}>{s.flagged}</td>
                <td style={{ padding: "10px 12px" }}><SevBadge level={s.riskLevel} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Recommendations */}
      <Card>
        <h3 style={{ margin: "0 0 14px", color: "#e0e6f0", fontSize: 14 }}>Recommendations</h3>
        {recommendations.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13, color: "#e0e6f0" }}>
            <span style={{ color: "#e91e8c", fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>{r}
          </div>
        ))}
      </Card>
    </div>
  );
};

/* ── Main Page ───────────────────────────────────── */
const Intelligence = () => {
  const [activeTab, setActiveTab] = useState("anomalies");

  return (
    <Layout>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#e0e6f0" }}>
            🧠 Intelligence Engine
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#8892a4" }}>Academic integrity analysis across all 5 detection modules</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#16213e", borderRadius: 12, padding: 6, border: "1px solid #2a3a58", flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", flex: "1 1 auto",
                background: activeTab === t.id ? "linear-gradient(135deg,#e91e8c,#c4186e)" : "transparent",
                color: activeTab === t.id ? "#fff" : "#8892a4" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "anomalies"  && <AnomaliesTab />}
        {activeTab === "group"      && <GroupCheatingTab />}
        {activeTab === "assessment" && <AssessmentTab />}
        {activeTab === "grading"    && <GradingTab />}
        {activeTab === "report"     && <ReportTab />}
      </div>
    </Layout>
  );
};

export default Intelligence;
