import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import {
  FiTool, FiShield, FiUsers, FiUploadCloud, FiBarChart2,
  FiFlag, FiAlertTriangle, FiCheckCircle, FiArrowRight,
  FiSearch, FiFileText, FiLock
} from "react-icons/fi";

const tools = [
  {
    id: "reports",
    icon: <FiShield size={28} />,
    color: "#e91e8c",
    bg: "rgba(233,30,140,0.12)",
    title: "Integrity Reports",
    description: "View and analyze AI-generated academic integrity reports. Detect anomalies, plagiarism flags, and consistency violations.",
    badge: "AI Powered",
    badgeColor: "#e91e8c",
    route: "/reports",
    features: ["Plagiarism detection", "AI usage scoring", "Trust score analysis"],
  },
  {
    id: "data-entry",
    icon: <FiUploadCloud size={28} />,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    title: "Upload Marks",
    description: "Teachers can upload student marks and assignments. The intelligence engine automatically analyzes submissions for anomalies.",
    badge: "Teacher Only",
    badgeColor: "#3b82f6",
    route: "/data-entry",
    features: ["Batch mark upload", "Auto anomaly detection", "Consistency scoring"],
  },
  {
    id: "submissions",
    icon: <FiFileText size={28} />,
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    title: "Submissions",
    description: "Browse all student submissions across subjects and semesters. Filter by status, subject, or date.",
    badge: "All Roles",
    badgeColor: "#10b981",
    route: "/submissions",
    features: ["Filter by subject", "View submission history", "Download records"],
  },
  {
    id: "group-detection",
    icon: <FiUsers size={28} />,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    title: "Group Cheating Detection",
    description: "Cluster-based analysis to detect coordinated academic dishonesty. Identifies groups of students with suspiciously similar patterns.",
    badge: "ML Model",
    badgeColor: "#f59e0b",
    route: "/reports",
    features: ["Cluster analysis", "Similarity scoring", "Pattern recognition"],
  },
  {
    id: "analytics",
    icon: <FiBarChart2 size={28} />,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    title: "Analytics Dashboard",
    description: "View grading consistency across sections, attendance trends, and performance benchmarks for all students.",
    badge: "Live Data",
    badgeColor: "#8b5cf6",
    route: "/dashboard",
    features: ["Grading consistency", "Attendance trends", "Performance benchmarks"],
  },
  {
    id: "courses",
    icon: <FiSearch size={28} />,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
    title: "Course Explorer",
    description: "Browse all courses and subjects. View enrolled students, marks distribution, and subject-level integrity scores.",
    badge: "All Roles",
    badgeColor: "#06b6d4",
    route: "/courses",
    features: ["Course directory", "Marks distribution", "Student roster"],
  },
];

const Tools = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = tools.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>
              <FiTool size={22} style={{ marginRight: 10, verticalAlign: "middle", color: "#e91e8c" }} />
              Analysis Tools
            </h1>
            <p style={s.subtitle}>All integrity and analytics tools in one place</p>
          </div>
          {/* Search */}
          <div style={s.searchWrap}>
            <FiSearch size={16} style={s.searchIcon} />
            <input
              style={s.searchInput}
              placeholder="Search tools…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stats row */}
        <div style={s.statsRow}>
          {[
            { icon: <FiShield size={18} />, label: "Total Tools", value: tools.length, color: "#e91e8c" },
            { icon: <FiAlertTriangle size={18} />, label: "AI-Powered", value: 2, color: "#f59e0b" },
            { icon: <FiCheckCircle size={18} />, label: "All Active", value: "✓", color: "#10b981" },
            { icon: <FiLock size={18} />, label: "Secured", value: "JWT", color: "#3b82f6" },
          ].map((stat, i) => (
            <div key={i} style={s.statPill}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
              <span style={s.statVal}>{stat.value}</span>
              <span style={s.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Tool cards grid */}
        <div style={s.grid}>
          {filtered.map((tool) => (
            <div
              key={tool.id}
              style={s.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = tool.color;
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 12px 40px ${tool.color}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#2a3a58";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.2)";
              }}
            >
              {/* Icon + badge */}
              <div style={s.cardTop}>
                <div style={{ ...s.iconBox, background: tool.bg, color: tool.color }}>
                  {tool.icon}
                </div>
                <span style={{ ...s.badge, background: tool.bg, color: tool.color }}>
                  {tool.badge}
                </span>
              </div>

              {/* Content */}
              <h3 style={s.cardTitle}>{tool.title}</h3>
              <p style={s.cardDesc}>{tool.description}</p>

              {/* Feature list */}
              <ul style={s.featureList}>
                {tool.features.map((f, i) => (
                  <li key={i} style={s.featureItem}>
                    <FiCheckCircle size={12} color={tool.color} style={{ flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                style={{ ...s.ctaBtn, background: tool.bg, color: tool.color, borderColor: tool.color }}
                onClick={() => navigate(tool.route)}
              >
                Open Tool <FiArrowRight size={14} style={{ marginLeft: 6 }} />
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={s.empty}>
            <FiSearch size={40} color="#2a3a58" />
            <p style={{ color: "#8892a4", marginTop: 12 }}>No tools match "{search}"</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

const s = {
  page: { maxWidth: "1100px", margin: "0 auto" },

  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16
  },
  title: { margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#e0e6f0" },
  subtitle: { margin: 0, fontSize: 13, color: "#8892a4" },

  searchWrap: {
    position: "relative", display: "flex", alignItems: "center"
  },
  searchIcon: {
    position: "absolute", left: 12, color: "#8892a4", pointerEvents: "none"
  },
  searchInput: {
    padding: "10px 14px 10px 38px",
    background: "#16213e", border: "1.5px solid #2a3a58",
    borderRadius: 10, color: "#e0e6f0", fontSize: 14,
    outline: "none", width: 240, fontFamily: "inherit"
  },

  statsRow: {
    display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap"
  },
  statPill: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#16213e", border: "1px solid #2a3a58",
    borderRadius: 10, padding: "10px 16px"
  },
  statVal: { fontSize: 16, fontWeight: 800, color: "#e0e6f0" },
  statLabel: { fontSize: 12, color: "#8892a4" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
    gap: 20
  },

  card: {
    background: "#16213e",
    border: "1.5px solid #2a3a58",
    borderRadius: 14,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    transition: "all 0.25s ease",
    cursor: "pointer",
    boxShadow: "0 2px 12px rgba(0,0,0,0.2)"
  },

  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  iconBox: {
    width: 54, height: 54, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  badge: {
    fontSize: 11, fontWeight: 700, padding: "4px 10px",
    borderRadius: 20, letterSpacing: "0.3px"
  },

  cardTitle: { margin: 0, fontSize: 17, fontWeight: 700, color: "#e0e6f0" },
  cardDesc: { margin: 0, fontSize: 13, color: "#8892a4", lineHeight: 1.6 },

  featureList: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 },
  featureItem: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 12, color: "#8892a4"
  },

  ctaBtn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    marginTop: "auto",
    padding: "10px 16px",
    border: "1.5px solid",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    background: "transparent",
    transition: "opacity 0.2s"
  },

  empty: {
    display: "flex", flexDirection: "column",
    alignItems: "center", padding: "60px 0"
  },
};

export default Tools;
