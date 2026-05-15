import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { FiCalendar, FiAlertTriangle, FiCheckCircle, FiFilter, FiRefreshCw } from "react-icons/fi";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const MONTHS = [
  "May 2025","Jun 2025","Jul 2025","Aug 2025",
  "Sep 2025","Oct 2025","Nov 2025","Dec 2025",
  "Jan 2026","Feb 2026","Mar 2026","Apr 2026",
];

const statusColor  = s => s === "good" ? "#0a8a0a" : s === "warning" ? "#f6a117" : "#d7285c";
const statusBg     = s => s === "good" ? "#e6f9ed"  : s === "warning" ? "#fef5e7"  : "#fbe9ed";
const statusLabel  = s => s === "good" ? "Good"      : s === "warning" ? "At Risk"  : "Critical";
const attColor     = v => v >= 75 ? "#0a8a0a" : v >= 65 ? "#f6a117" : "#d7285c";

export default function Attendance() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom]       = useState(MONTHS[0]);
  const [to, setTo]           = useState(MONTHS[MONTHS.length - 1]);
  const [selected, setSelected] = useState(null); // selected subject for detail

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/attendance-detail?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      setData(res.data);
      setSelected(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { fetch(); }, [fetch]);

  const trendChart = data ? {
    labels: data.monthlyTrend.map(m => m.month),
    datasets: [{
      label: "Overall Attendance %",
      data: data.monthlyTrend.map(m => m.attendance),
      borderColor: "rgb(54,162,235)",
      backgroundColor: "rgba(54,162,235,0.15)",
      tension: 0.4, fill: true, pointRadius: 4, borderWidth: 2,
    }],
  } : null;

  const subjectChart = data ? {
    labels: data.subjects.map(s => s.name),
    datasets: [{
      label: "Avg Attendance %",
      data: data.subjects.map(s => s.avgAttendance),
      backgroundColor: data.subjects.map(s =>
        s.avgAttendance >= 75 ? "rgba(10,138,10,0.7)" :
        s.avgAttendance >= 65 ? "rgba(246,161,23,0.7)" : "rgba(215,40,92,0.7)"
      ),
      borderRadius: 6,
    }],
  } : null;

  // Monthly breakdown for selected subject
  const selectedSubject = selected && data?.subjects.find(s => s.name === selected);
  const subjectMonthChart = selectedSubject ? (() => {
    const months = data.monthlyTrend.map(m => m.month);
    return {
      labels: months,
      datasets: [{
        label: `${selected} — Monthly Attendance`,
        data: months.map(m => selectedSubject.monthlyBreakdown[m] ?? null),
        borderColor: "rgb(233,30,140)",
        backgroundColor: "rgba(233,30,140,0.1)",
        tension: 0.4, fill: true, pointRadius: 4, borderWidth: 2,
        spanGaps: true,
      }],
    };
  })() : null;

  const chartOpts = (title) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: !!title, text: title },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y}%` } },
    },
    scales: {
      y: { min: 0, max: 100, ticks: { callback: v => `${v}%` }, grid: { color: "rgba(0,0,0,0.04)" } },
      x: { ticks: { maxRotation: 45, font: { size: 11 } }, grid: { display: false } },
    },
  });

  return (
    <Layout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <h2 style={{ margin: 0 }}>Attendance Overview</h2>
            <p style={{ margin: "4px 0 0", color: "#666" }}>Subject-wise breakdown with date range filter</p>
          </div>
          {/* Date range filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff", padding: "12px 16px", borderRadius: "10px", border: "1px solid #eee", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
            <FiFilter size={14} color="#888" />
            <label style={s.label}>From</label>
            <select style={s.select} value={from} onChange={e => setFrom(e.target.value)}>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
            <label style={s.label}>To</label>
            <select style={s.select} value={to} onChange={e => setTo(e.target.value)}>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
            <button style={s.refreshBtn} onClick={fetch} title="Refresh">
              <FiRefreshCw size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#888" }}>
            <div style={s.spinner} />
            <p style={{ marginTop: "16px" }}>Loading attendance data...</p>
          </div>
        ) : !data ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#888" }}>No data found.</div>
        ) : (
          <>
            {/* Overall stat card */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <div style={{ ...s.card, flex: 1, display: "flex", alignItems: "center", gap: "20px", borderLeft: `4px solid ${attColor(data.overall)}` }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: statusBg(data.overall >= 75 ? "good" : data.overall >= 65 ? "warning" : "critical"), display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiCalendar size={26} color={attColor(data.overall)} />
                </div>
                <div>
                  <div style={{ fontSize: "36px", fontWeight: "800", color: attColor(data.overall), lineHeight: 1 }}>{data.overall}%</div>
                  <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Overall Attendance ({from} – {to})</div>
                  <div style={{ marginTop: "6px" }}>
                    {data.overall >= 75
                      ? <span style={s.badge("#e6f9ed","#0a8a0a")}><FiCheckCircle size={11} /> Good Standing</span>
                      : data.overall >= 65
                      ? <span style={s.badge("#fef5e7","#f6a117")}><FiAlertTriangle size={11} /> At Risk</span>
                      : <span style={s.badge("#fbe9ed","#d7285c")}><FiAlertTriangle size={11} /> Critical — Below 65%</span>}
                  </div>
                </div>
              </div>
              {/* Quick stats */}
              {[
                { label: "Subjects Tracked", value: data.subjects.length },
                { label: "Below 75%", value: data.subjects.filter(s => s.avgAttendance < 75).length, color: "#d7285c" },
                { label: "Above 75%", value: data.subjects.filter(s => s.avgAttendance >= 75).length, color: "#0a8a0a" },
              ].map((stat, i) => (
                <div key={i} style={{ ...s.card, flex: 0.4, textAlign: "center" }}>
                  <div style={{ fontSize: "30px", fontWeight: "800", color: stat.color || "#0465a3" }}>{stat.value}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "24px" }}>
              <div style={{ ...s.card, flex: 1.5 }}>
                <h3 style={s.panelTitle}>Monthly Attendance Trend</h3>
                <div style={{ height: "220px" }}>
                  {trendChart && <Line data={trendChart} options={chartOpts()} />}
                </div>
              </div>
              <div style={{ ...s.card, flex: 1 }}>
                <h3 style={s.panelTitle}>Subject Comparison</h3>
                <div style={{ height: "220px" }}>
                  {subjectChart && <Bar data={subjectChart} options={chartOpts()} />}
                </div>
              </div>
            </div>

            {/* Subject cards */}
            <h3 style={{ ...s.panelTitle, marginBottom: "14px" }}>Subject-wise Breakdown</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              {data.subjects.map(sub => (
                <div
                  key={sub.name}
                  style={{ ...s.card, cursor: "pointer", borderLeft: `4px solid ${statusColor(sub.status)}`, outline: selected === sub.name ? `2px solid ${statusColor(sub.status)}` : "none" }}
                  onClick={() => setSelected(selected === sub.name ? null : sub.name)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ fontWeight: "700", fontSize: "15px", color: "#1a1a2e" }}>{sub.name}</div>
                    <span style={s.badge(statusBg(sub.status), statusColor(sub.status))}>{statusLabel(sub.status)}</span>
                  </div>
                  {/* Attendance bar */}
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#888" }}>
                        Attendance <strong style={{ color: "#555", marginLeft: "4px" }}>({Math.round((sub.avgAttendance / 100) * 40)} / 40 Classes)</strong>
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: attColor(sub.avgAttendance) }}>{sub.avgAttendance}%</span>
                    </div>
                    <div style={{ height: "8px", background: "#eee", borderRadius: "8px", overflow: "hidden" }}>
                      <div style={{ width: `${sub.avgAttendance}%`, height: "100%", background: attColor(sub.avgAttendance), borderRadius: "8px", transition: "width 0.5s" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#666" }}>
                    <span>Marks: <strong>{sub.avgMarks}%</strong></span>
                    <span>Assignments: <strong>{sub.avgAssignments}%</strong></span>
                  </div>
                  {sub.avgAttendance < 75 && (
                    <div style={{ marginTop: "10px", padding: "8px 10px", background: "#fbe9ed", borderRadius: "6px", fontSize: "12px", color: "#d7285c", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FiAlertTriangle size={12} /> Attendance below required 75% threshold
                    </div>
                  )}
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "#aaa" }}>Click to see monthly breakdown ↓</div>
                </div>
              ))}
            </div>

            {/* Selected subject monthly chart */}
            {selectedSubject && subjectMonthChart && (
              <div style={{ ...s.card, marginBottom: "24px" }}>
                <h3 style={s.panelTitle}>{selected} — Monthly Attendance Breakdown</h3>
                <div style={{ height: "220px" }}>
                  <Line data={subjectMonthChart} options={chartOpts()} />
                </div>
                {/* Month-by-month table */}
                <div style={{ marginTop: "16px", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#f4f6fa" }}>
                        {data.monthlyTrend.map(m => (
                          <th key={m.month} style={{ padding: "8px 10px", textAlign: "center", color: "#666", fontWeight: "600", fontSize: "11px" }}>{m.month}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {data.monthlyTrend.map(m => {
                          const val = selectedSubject.monthlyBreakdown[m.month];
                          return (
                            <td key={m.month} style={{ padding: "10px", textAlign: "center", fontWeight: "700", color: val != null ? attColor(val) : "#ccc" }}>
                              {val != null ? `${val}%` : "—"}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
}

const s = {
  card:       { background: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #eee" },
  panelTitle: { margin: "0 0 14px 0", fontSize: "15px", fontWeight: "700", color: "#333" },
  label:      { fontSize: "13px", color: "#666", fontWeight: "500" },
  select:     { padding: "6px 10px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px", background: "#f9fafb", cursor: "pointer" },
  refreshBtn: { padding: "7px 10px", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" },
  spinner:    { width: "36px", height: "36px", border: "4px solid #e6f2f9", borderTop: "4px solid #0465a3", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" },
  badge:      (bg, color) => ({ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: bg, color }),
};
