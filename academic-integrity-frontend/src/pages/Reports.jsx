import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { 
  FiAlertTriangle, FiCheckCircle, FiSearch, FiFilter, FiDownload, 
  FiX, FiChevronDown, FiRefreshCw, FiEye, FiUsers, FiActivity, FiCpu 
} from "react-icons/fi";

const Reports = () => {
  // Tabs: 'logs' or 'groups'
  const [activeTab, setActiveTab] = useState("logs");

  // Log Data State
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ total: 0, critical: 0, review: 0, safe: 0, avgTrustScore: 0 });
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [error, setError] = useState(null);

  // Group Detection Data State
  const [groupData, setGroupData] = useState({ summary: {}, flagged_groups: [] });
  const [groupLoading, setGroupLoading] = useState(false);
  const [runningEngine, setRunningEngine] = useState(false);

  // Fetch Logs
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "All") params.append("status", statusFilter);
      
      const res = await api.get(`/reports?${params.toString()}`);
      setLogs(res.data.logs || []);
      setSummary(res.data.summary || { total: 0, critical: 0, review: 0, safe: 0, avgTrustScore: 0 });
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Unable to load reports. The system may not have any records yet.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  // Fetch Group Analysis
  const fetchGroupResults = useCallback(async () => {
    setGroupLoading(true);
    try {
      const res = await api.get("/reports/group-detection");
      setGroupData(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setGroupLoading(false);
    }
  }, []);

  // Run Python Intelligence Engine
  const handleRunEngine = async () => {
    setRunningEngine(true);
    try {
      const res = await api.post("/reports/run-group-detection");
      setGroupData(res.data);
      alert("Intelligence Engine analysis complete! Results updated.");
    } catch (err) {
      console.error("Engine run error:", err);
      alert("Failed to run analysis engine. Check backend logs.");
    } finally {
      setRunningEngine(false);
    }
  };

  useEffect(() => {
    if (activeTab === "logs") {
      fetchReports();
    } else {
      fetchGroupResults();
    }
  }, [activeTab, fetchReports, fetchGroupResults]);

  // Debounced search for logs
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Critical": return <span style={{...styles.badge, background: "#fbe9ed", color: "#d7285c"}}><FiAlertTriangle /> Critical Risk</span>;
      case "Review": return <span style={{...styles.badge, background: "#fef5e7", color: "#f6a117"}}>Review Needed</span>;
      case "Safe": return <span style={{...styles.badge, background: "#e6f2f9", color: "#0465a3"}}><FiCheckCircle /> Cleared</span>;
      default: return null;
    }
  };

  const getConfidenceBadge = (conf) => {
    const color = conf === "High" ? "#d7285c" : conf === "Medium" ? "#f6a117" : "#0a8a0a";
    const bg = conf === "High" ? "#fbe9ed" : conf === "Medium" ? "#fef5e7" : "#e6f9ed";
    return <span style={{...styles.badge, background: bg, color}}>{conf} Confidence</span>;
  };

  const getTrustColor = (trust) => {
    if (trust <= 40) return "#d7285c";
    if (trust <= 70) return "#f6a117";
    return "#0465a3";
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Scan ID", "Student", "Program", "Submission", "Date", "AI %", "Plagiarism %", "Trust Score", "Consistency", "Status", "Flags"];
    const rows = logs.map(log => [
      log.id, log.student, log.program, log.submission, log.date,
      log.aiScore, log.plgScore, log.trust, log.consistencyScore, log.status,
      `"${(log.flags || []).join('; ')}"`
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `integrity_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div style={styles.container}>
        {/* Tab Switcher */}
        <div style={styles.tabContainer}>
          <button 
            style={{...styles.tabLink, borderBottom: activeTab === "logs" ? "3px solid var(--upes-blue)" : "none", color: activeTab === "logs" ? "var(--upes-blue)" : "#666"}}
            onClick={() => setActiveTab("logs")}
          >
            <FiActivity /> Integrity Scan Logs
          </button>
          <button 
            style={{...styles.tabLink, borderBottom: activeTab === "groups" ? "3px solid var(--upes-blue)" : "none", color: activeTab === "groups" ? "var(--upes-blue)" : "#666"}}
            onClick={() => setActiveTab("groups")}
          >
            <FiUsers /> Group Cheating Analysis
          </button>
        </div>

        {activeTab === "logs" ? (
          <>
            {/* Summary Cards */}
            <div style={styles.summaryRow}>
              <div style={{...styles.summaryCard, borderLeft: "4px solid #0465a3"}}>
                <div style={styles.summaryValue}>{summary.total}</div>
                <div style={styles.summaryLabel}>Total Scans</div>
              </div>
              <div style={{...styles.summaryCard, borderLeft: "4px solid #d7285c"}}>
                <div style={{...styles.summaryValue, color: "#d7285c"}}>{summary.critical}</div>
                <div style={styles.summaryLabel}>Critical</div>
              </div>
              <div style={{...styles.summaryCard, borderLeft: "4px solid #f6a117"}}>
                <div style={{...styles.summaryValue, color: "#f6a117"}}>{summary.review}</div>
                <div style={styles.summaryLabel}>Under Review</div>
              </div>
              <div style={{...styles.summaryCard, borderLeft: "4px solid #0a8a0a"}}>
                <div style={{...styles.summaryValue, color: "#0a8a0a"}}>{summary.safe}</div>
                <div style={styles.summaryLabel}>Cleared</div>
              </div>
              <div style={{...styles.summaryCard, borderLeft: "4px solid #6c5ce7"}}>
                <div style={{...styles.summaryValue, color: "#6c5ce7"}}>{summary.avgTrustScore}</div>
                <div style={styles.summaryLabel}>Avg Trust Score</div>
              </div>
            </div>

            {/* Header */}
            <div style={styles.header}>
              <h2 style={{margin: 0}}>Integrity Scan Logs</h2>
              <div style={styles.toolbar}>
                <div style={styles.searchBox}>
                  <FiSearch color="#999" />
                  <input
                    type="text"
                    placeholder="Search ID, name, or submission..."
                    style={styles.searchInput}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  {searchInput && (
                    <FiX color="#999" style={{cursor: "pointer"}} onClick={() => setSearchInput("")} />
                  )}
                </div>
                <div style={{position: "relative"}}>
                  <button style={styles.filterBtn} onClick={() => setShowFilters(!showFilters)}>
                    <FiFilter /> {statusFilter !== "All" ? statusFilter : "Filters"} <FiChevronDown />
                  </button>
                  {showFilters && (
                    <div style={styles.filterDropdown}>
                      {["All", "Critical", "Review", "Safe"].map(opt => (
                        <div
                          key={opt}
                          style={{...styles.filterOption, background: statusFilter === opt ? "#e6f2f9" : "transparent"}}
                          onClick={() => { setStatusFilter(opt); setShowFilters(false); }}
                        >
                          {opt === "All" ? "All Statuses" : opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button style={styles.exportBtn} onClick={handleExportCSV} disabled={logs.length === 0}>
                  <FiDownload /> Export CSV
                </button>
                <button style={styles.refreshBtn} onClick={fetchReports}>
                  <FiRefreshCw />
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={styles.card}>
              {loading ? (
                <div style={styles.loadingBox}>
                  <div style={styles.spinner}></div>
                  <p style={{color: "#888", marginTop: "15px"}}>Loading scan results...</p>
                </div>
              ) : error ? (
                <div style={styles.emptyBox}>
                  <FiAlertTriangle size={40} color="#f6a117" />
                  <p style={{color: "#888", marginTop: "15px"}}>{error}</p>
                  <button style={styles.retryBtn} onClick={fetchReports}>
                    <FiRefreshCw /> Retry
                  </button>
                </div>
              ) : logs.length === 0 ? (
                <div style={styles.emptyBox}>
                  <FiCheckCircle size={40} color="#ccc" />
                  <p style={{color: "#888", marginTop: "15px"}}>
                    {searchQuery || statusFilter !== "All" 
                      ? "No results match your search criteria." 
                      : "No scan records found. Upload student data to begin analysis."}
                  </p>
                </div>
              ) : (
                <>
                  <table style={{width: "100%", borderCollapse: "collapse"}}>
                    <thead>
                      <tr style={{borderBottom: "2px solid #eee", textAlign: "left"}}>
                        <th style={styles.th}>Scan ID</th>
                        <th style={styles.th}>Student</th>
                        <th style={styles.th}>Submission</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>AI %</th>
                        <th style={styles.th}>Plagiarism %</th>
                        <th style={styles.th}>Trust Score</th>
                        <th style={styles.th}>Flags</th>
                        <th style={styles.th}>Outcome</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} style={styles.tr}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#fafbfd"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={styles.td}><strong>{log.id}</strong></td>
                          <td style={styles.td}>
                            <div style={{fontWeight: "600"}}>{log.student}</div>
                            <div style={{fontSize: "12px", color: "#888"}}>{log.email}</div>
                          </td>
                          <td style={styles.td}>
                            {log.submission}
                            {log.semester && <div style={{fontSize: "12px", color: "#888"}}>Sem {log.semester}</div>}
                          </td>
                          <td style={styles.td}>{log.date}</td>
                          <td style={styles.td}>
                            <span style={{color: log.aiScore > 50 ? "#d7285c" : "#333"}}>{log.aiScore}%</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{color: log.plgScore > 30 ? "#f6a117" : "#333"}}>{log.plgScore}%</span>
                          </td>
                          <td style={styles.td}>
                            <strong style={{color: getTrustColor(log.trust)}}>{log.trust}</strong>
                            <span style={{color: "#999"}}>/100</span>
                          </td>
                          <td style={styles.td}>
                            {log.flags && log.flags.length > 0 ? (
                              <span style={{...styles.flagBadge, background: "#fbe9ed", color: "#d7285c"}}>
                                {log.flags.length} flag{log.flags.length > 1 ? "s" : ""}
                              </span>
                            ) : (
                              <span style={{color: "#ccc"}}>—</span>
                            )}
                          </td>
                          <td style={styles.td}>{getStatusBadge(log.status)}</td>
                          <td style={styles.td}>
                            <button
                              style={styles.viewBtn}
                              onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                              title="View Details"
                            >
                              <FiEye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={styles.tableFooter}>
                    Showing {logs.length} record{logs.length !== 1 ? "s" : ""}
                    {(searchQuery || statusFilter !== "All") && " (filtered)"}
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          /* GROUP CHEATING ANALYSIS TAB */
          <div>
            <div style={{...styles.header, marginBottom: "25px"}}>
              <div>
                <h2 style={{margin: 0}}>Group Cheating Intelligence</h2>
                <p style={{margin: "5px 0 0 0", color: "#666"}}>Clustered patterns detection using NLP and similarity indexing</p>
              </div>
              <button 
                style={{...styles.exportBtn, background: runningEngine ? "#999" : "var(--upes-blue)", cursor: runningEngine ? "default" : "pointer"}} 
                onClick={handleRunEngine}
                disabled={runningEngine}
              >
                <FiCpu /> {runningEngine ? "Running Intelligence Engine..." : "Run Intelligence Engine"}
              </button>
            </div>

            {groupLoading ? (
               <div style={styles.loadingBox}>
                <div style={styles.spinner}></div>
                <p style={{color: "#888", marginTop: "15px"}}>Consulting Intelligence Engine...</p>
              </div>
            ) : groupData.flagged_groups.length === 0 ? (
              <div style={styles.emptyBox}>
                <FiCheckCircle size={40} color="#0a8a0a" />
                <p style={{color: "#333", fontWeight: "600", marginTop: "15px"}}>All Systems Clear</p>
                <p style={{color: "#888", marginTop: "5px"}}>No suspicious student clusters detected in current datasets.</p>
              </div>
            ) : (
              <div style={styles.groupGrid}>
                {groupData.flagged_groups.map((group, idx) => (
                  <div key={idx} style={styles.groupCard}>
                    <div style={styles.groupHeader}>
                      <div>
                        <div style={styles.groupId}>{group.group_id}</div>
                        <div style={styles.questionId}>Question: {group.question_id}</div>
                      </div>
                      {getConfidenceBadge(group.confidence)}
                    </div>
                    
                    <div style={styles.groupStatsRow}>
                      <div style={styles.groupStat}>
                        <div style={styles.statLabel}>Similarity</div>
                        <div style={{...styles.statValue, color: "#d7285c"}}>{(group.similarity_score * 100).toFixed(1)}%</div>
                      </div>
                      <div style={styles.groupStat}>
                        <div style={styles.statLabel}>Group Size</div>
                        <div style={styles.statValue}>{group.group_size} Students</div>
                      </div>
                      <div style={styles.groupStat}>
                        <div style={styles.statLabel}>Outcome</div>
                        <div style={{...styles.statValue, color: group.all_answers_incorrect ? "#d7285c" : "#0465a3"}}>
                          {group.all_answers_incorrect ? "Incorrect Answers" : "Mixed Outcome"}
                        </div>
                      </div>
                    </div>

                    <div style={{padding: "15px 20px"}}>
                      <div style={styles.detailLabel}>Involved Students</div>
                      <div style={styles.studentList}>
                        {group.students.map((student, sIdx) => (
                          <div key={sIdx} style={styles.studentTag}>
                            <FiUsers /> {student}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Log Detail Panel (Overlay style or bottom expansion) */}
        {selectedLog && activeTab === "logs" && (
          <div style={styles.detailPanel}>
            <div style={styles.detailHeader}>
              <h3 style={{margin: 0}}>Scan Detail — {selectedLog.id}</h3>
              <FiX size={20} style={{cursor: "pointer"}} onClick={() => setSelectedLog(null)} />
            </div>
            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Student</div>
                <div style={styles.detailValue}>{selectedLog.student}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Email</div>
                <div style={styles.detailValue}>{selectedLog.email}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Program</div>
                <div style={styles.detailValue}>{selectedLog.program}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Submission</div>
                <div style={styles.detailValue}>{selectedLog.submission}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Semester</div>
                <div style={styles.detailValue}>{selectedLog.semester || "N/A"}</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Marks</div>
                <div style={styles.detailValue}>{selectedLog.marks}/100</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Attendance</div>
                <div style={styles.detailValue}>{selectedLog.attendance}%</div>
              </div>
              <div style={styles.detailItem}>
                <div style={styles.detailLabel}>Consistency Score</div>
                <div style={{...styles.detailValue, color: getTrustColor(selectedLog.consistencyScore), fontWeight: "bold"}}>
                  {selectedLog.consistencyScore}/100
                </div>
              </div>
            </div>
            {selectedLog.flags && selectedLog.flags.length > 0 && (
              <div style={{padding: "0 20px 20px"}}>
                <div style={styles.detailLabel}>Anomaly Flags</div>
                {selectedLog.flags.map((flag, idx) => (
                  <div key={idx} style={styles.flagItem}>
                    <FiAlertTriangle color="#d7285c" size={14} />
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

// Inject spinner keyframes
if (typeof document !== "undefined") {
  const existingStyle = document.getElementById("reports-spin-style");
  if (!existingStyle) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "reports-spin-style";
    styleSheet.innerText = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(styleSheet);
  }
}

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  tabContainer: {
    display: "flex",
    gap: "30px",
    borderBottom: "1px solid #ddd",
    marginBottom: "30px",
  },
  tabLink: {
    padding: "10px 5px",
    fontSize: "16px",
    fontWeight: "600",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s",
  },
  summaryRow: {
    display: "flex",
    gap: "15px",
    marginBottom: "25px",
  },
  summaryCard: {
    flex: 1,
    background: "#fff",
    borderRadius: "8px",
    padding: "18px 20px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },
  summaryValue: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0465a3",
    lineHeight: "1.2",
  },
  summaryLabel: {
    fontSize: "12px",
    color: "#888",
    fontWeight: "500",
    marginTop: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  toolbar: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    padding: "8px 15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    minWidth: "260px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    flex: 1,
  },
  filterBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 15px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
  },
  filterDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "5px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    zIndex: 100,
    minWidth: "160px",
    overflow: "hidden",
  },
  filterOption: {
    padding: "10px 15px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background 0.15s",
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 15px",
    background: "var(--upes-blue)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    padding: "8px 10px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    color: "#666",
  },
  card: {
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    overflow: "hidden"
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "80px 0",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e6f2f9",
    borderTop: "4px solid var(--upes-blue)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  emptyBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "80px 0",
  },
  retryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 20px",
    background: "#f4f4f4",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "15px",
  },
  th: {
    padding: "15px 16px",
    color: "#666",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "600",
  },
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#333",
    borderBottom: "1px solid #f0f0f0"
  },
  tr: {
    transition: "background 0.15s",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  flagBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  viewBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    background: "#f4f4f4",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#555",
  },
  tableFooter: {
    padding: "12px 20px",
    textAlign: "center",
    color: "#888",
    fontSize: "13px",
    borderTop: "1px solid #f0f0f0",
  },
  groupGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "20px",
  },
  groupCard: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    border: "1px solid #eee",
    overflow: "hidden",
  },
  groupHeader: {
    padding: "20px",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    background: "#fafbfd",
  },
  groupId: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "var(--upes-blue)",
    textTransform: "uppercase",
  },
  questionId: {
    fontSize: "13px",
    color: "#888",
    marginTop: "2px",
  },
  groupStatsRow: {
    display: "flex",
    borderBottom: "1px solid #f0f0f0",
  },
  groupStat: {
    flex: 1,
    padding: "15px 20px",
    borderRight: "1px solid #f0f0f0",
  },
  statLabel: {
    fontSize: "11px",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
  },
  studentList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
  },
  studentTag: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "6px 12px",
    background: "#f4f7fa",
    borderRadius: "6px",
    fontSize: "13px",
    color: "#555",
    border: "1px solid #e0e6ed",
  },
  detailPanel: {
    marginTop: "20px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #e0e0e0",
    overflow: "hidden",
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
    borderBottom: "1px solid #eee",
    background: "#fafbfd",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "0",
    padding: "20px",
  },
  detailItem: {
    padding: "10px 0",
  },
  detailLabel: {
    fontSize: "12px",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "600",
    marginBottom: "6px",
  },
  detailValue: {
    fontSize: "15px",
    color: "#333",
    fontWeight: "500",
  },
  flagItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "10px 14px",
    background: "#fbe9ed",
    borderLeft: "3px solid #d7285c",
    borderRadius: "4px",
    marginTop: "8px",
    fontSize: "13px",
    color: "#333",
    lineHeight: "1.5",
  },
};

export default Reports;