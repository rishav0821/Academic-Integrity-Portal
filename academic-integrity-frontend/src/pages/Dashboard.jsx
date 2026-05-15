import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiAlertTriangle, FiTrendingUp, FiTrendingDown, FiMinus, FiUser, FiUploadCloud, FiCalendar, FiBarChart2, FiChevronDown, FiChevronUp, FiX, FiFileText, FiMessageSquare } from "react-icons/fi";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [gradingData, setGradingData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [studentsOverview, setStudentsOverview] = useState([]);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [reviewStudent, setReviewStudent] = useState(null); // at-risk student being reviewed
  const [reviewNote, setReviewNote] = useState("");
  const [reviewSaved, setReviewSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard");
        const user = res.data.user;
        setUserInfo(user);

        const userRole = user?.role || "student";
        if (userRole === "student") {
          const [attRes, perfRes] = await Promise.all([
             api.get("/analytics/attendance"),
             api.get("/marks/dashboard")
          ]);
          setAttendanceData(attRes.data);
          setPerformanceData(perfRes.data);
        } else if (userRole === "teacher" || userRole === "admin") {
          const [gradRes, overviewRes] = await Promise.all([
            api.get("/analytics/grading-consistency"),
            api.get("/analytics/students-overview"),
          ]);
          setGradingData(gradRes.data);
          setStudentsOverview(overviewRes.data || []);
        }
      } catch (err) {
        console.error("failed to fetch protected data", err);
      }
    };
    fetchData();
  }, []);

  const role = userInfo?.role || "student";

  // Fallback empty chart state if no records exist
  const chartData = (performanceData && performanceData.chartData) ? performanceData.chartData : {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [
      {
        label: 'No Data Yet',
        data: [0, 0, 0, 0],
        borderColor: 'rgb(200, 200, 200)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Academic Performance — Last 12 Months" },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { callback: (v) => `${v}%` },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        ticks: { maxRotation: 45, font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  // ---------------- TEACHER DASHBOARD ----------------
  if (role === "teacher" || role === "admin") {
    const trendIcon = (t) => t === "improving"
      ? <FiTrendingUp color="#0a8a0a" />
      : t === "declining"
      ? <FiTrendingDown color="#d7285c" />
      : <FiMinus color="#f6a117" />;

    const trendColor = (t) => t === "improving" ? "#0a8a0a" : t === "declining" ? "#d7285c" : "#f6a117";

    const scoreColor = (s) => s >= 75 ? "#0a8a0a" : s >= 55 ? "#f6a117" : "#d7285c";

    return (
      <Layout>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          {/* Welcome */}
          <div style={{...styles.card, marginBottom: "20px"}}>
            <h2 style={{margin: "0 0 6px 0"}}>Faculty Portal</h2>
            <p style={{color: "#666", margin: 0}}>Welcome back, Prof. {userInfo?.name}. Full student academic overview below.</p>
            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              <Link to="/data-entry" style={{...styles.primaryAlertBtn, textDecoration: "none"}}><FiUploadCloud /> Upload Marks</Link>
              <Link to="/assignments" style={{...styles.primaryAlertBtn, textDecoration: "none", background: "#e91e8c"}}><FiCalendar /> Assignments</Link>
            </div>
          </div>

          {/* Summary cards */}
          <div style={styles.metricsRow}>
            <div style={styles.metricCard}>
              <div style={styles.metricIconBgRed}><FiAlertTriangle size={28} color="#d7285c" /></div>
              <div style={styles.metricInfo}>
                <div style={styles.metricValue}>{studentsOverview.filter(s => s.trend === "declining").length}</div>
                <div style={styles.metricLabel}>Declining Students</div>
              </div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricIconBgOrange}><FiTrendingUp size={28} color="#f6a117" /></div>
              <div style={styles.metricInfo}>
                <div style={styles.metricValue}>{gradingData?.atRiskStudents?.length || 0}</div>
                <div style={styles.metricLabel}>At-Risk Students</div>
              </div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricIconBgBlue}><FiCheckCircle size={28} color="#0465a3" /></div>
              <div style={styles.metricInfo}>
                <div style={styles.metricValue}>{studentsOverview.length}</div>
                <div style={styles.metricLabel}>Total Students</div>
              </div>
            </div>
          </div>

          {/* ── All Students Performance Table ── */}
          <div style={{...styles.card, marginTop: "20px"}}>
            <h3 style={{...styles.panelTitle, marginBottom: "20px"}}>
              <FiBarChart2 style={{verticalAlign: "middle", marginRight: "8px"}} />
              Student Academic Performance Overview
            </h3>

            {studentsOverview.length === 0 ? (
              <div style={{textAlign: "center", padding: "40px", color: "#888"}}>
                No student data found. Run the seed script or upload marks first.
              </div>
            ) : (
              <div>
                {/* Table header */}
                <div style={tableHeaderStyle}>
                  <div style={{flex: 2}}>Student</div>
                  <div style={{flex: 1, textAlign: "center"}}>Academic Score</div>
                  <div style={{flex: 1, textAlign: "center"}}>Avg Marks</div>
                  <div style={{flex: 1, textAlign: "center"}}>Attendance</div>
                  <div style={{flex: 1, textAlign: "center"}}>Assignments</div>
                  <div style={{flex: 1, textAlign: "center"}}>AI Score</div>
                  <div style={{flex: 1, textAlign: "center"}}>Plagiarism</div>
                  <div style={{flex: 1, textAlign: "center"}}>Trend</div>
                  <div style={{flex: 0.5, textAlign: "center"}}>Detail</div>
                </div>

                {studentsOverview.map((stu) => (
                  <div key={stu.studentId}>
                    {/* Row */}
                    <div style={{
                      display: "flex", alignItems: "center", padding: "14px 16px",
                      borderBottom: "1px solid #f0f0f0",
                      background: expandedStudent === stu.studentId ? "#fafbff" : "transparent",
                      transition: "background 0.15s",
                    }}>
                      <div style={{flex: 2}}>
                        <div style={{fontWeight: "600", fontSize: "14px", color: "#1a1a2e"}}>{stu.name}</div>
                        <div style={{fontSize: "12px", color: "#888"}}>{stu.email}</div>
                        {stu.department && stu.department !== "N/A" && (
                          <div style={{fontSize: "11px", color: "#aaa"}}>{stu.department}</div>
                        )}
                      </div>
                      <div style={{flex: 1, textAlign: "center"}}>
                        <span style={{fontSize: "18px", fontWeight: "800", color: scoreColor(stu.academicScore)}}>{stu.academicScore}</span>
                        <span style={{fontSize: "11px", color: "#aaa"}}>/100</span>
                        {/* Mini progress bar */}
                        <div style={{height: "4px", background: "#eee", borderRadius: "4px", marginTop: "4px"}}>
                          <div style={{width: `${stu.academicScore}%`, height: "100%", background: scoreColor(stu.academicScore), borderRadius: "4px"}} />
                        </div>
                      </div>
                      <div style={{flex: 1, textAlign: "center", fontWeight: "600", color: scoreColor(stu.avgMarks)}}>{stu.avgMarks}%</div>
                      <div style={{flex: 1, textAlign: "center"}}>
                        <span style={{color: stu.avgAttendance < 75 ? "#d7285c" : "#0a8a0a", fontWeight: "600"}}>{stu.avgAttendance}%</span>
                      </div>
                      <div style={{flex: 1, textAlign: "center", color: "#555"}}>{stu.avgAssignments}%</div>
                      <div style={{flex: 1, textAlign: "center"}}>
                        <span style={{color: stu.avgAiScore > 70 ? "#d7285c" : "#555"}}>{stu.avgAiScore}%</span>
                      </div>
                      <div style={{flex: 1, textAlign: "center"}}>
                        <span style={{color: stu.avgPlagiarism > 30 ? "#d7285c" : stu.avgPlagiarism > 15 ? "#f6a117" : "#555"}}>{stu.avgPlagiarism}%</span>
                      </div>
                      <div style={{flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"}}>
                        {trendIcon(stu.trend)}
                        <span style={{fontSize: "12px", color: trendColor(stu.trend), fontWeight: "600", textTransform: "capitalize"}}>{stu.trend}</span>
                      </div>
                      <div style={{flex: 0.5, textAlign: "center"}}>
                        <button
                          style={{background: "none", border: "1px solid #ddd", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", color: "#555"}}
                          onClick={() => setExpandedStudent(expandedStudent === stu.studentId ? null : stu.studentId)}
                        >
                          {expandedStudent === stu.studentId ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {expandedStudent === stu.studentId && (
                      <div style={{background: "#f8faff", borderBottom: "2px solid #e0e8ff", padding: "20px 24px"}}>
                        <div style={{display: "flex", gap: "30px"}}>
                          {/* Subject breakdown */}
                          <div style={{flex: 1}}>
                            <div style={{fontWeight: "700", fontSize: "13px", color: "#555", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px"}}>Subject-wise Breakdown</div>
                            <table style={{width: "100%", borderCollapse: "collapse", fontSize: "13px"}}>
                              <thead>
                                <tr style={{color: "#888", borderBottom: "1px solid #eee"}}>
                                  <th style={{padding: "6px 8px", textAlign: "left"}}>Subject</th>
                                  <th style={{padding: "6px 8px", textAlign: "center"}}>Marks</th>
                                  <th style={{padding: "6px 8px", textAlign: "center"}}>Attendance</th>
                                  <th style={{padding: "6px 8px", textAlign: "center"}}>Assignments</th>
                                </tr>
                              </thead>
                              <tbody>
                                {stu.subjects.map((sub, i) => (
                                  <tr key={i} style={{borderBottom: "1px solid #f0f0f0"}}>
                                    <td style={{padding: "8px"}}>{sub.name}</td>
                                    <td style={{padding: "8px", textAlign: "center", color: scoreColor(sub.avgMarks), fontWeight: "600"}}>{sub.avgMarks}%</td>
                                    <td style={{padding: "8px", textAlign: "center", color: sub.avgAttendance < 75 ? "#d7285c" : "#0a8a0a"}}>{sub.avgAttendance}%</td>
                                    <td style={{padding: "8px", textAlign: "center"}}>{sub.avgAssignments}%</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Monthly trend chart */}
                          <div style={{flex: 1.5, minHeight: "200px"}}>
                            <div style={{fontWeight: "700", fontSize: "13px", color: "#555", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px"}}>Monthly Performance Trend</div>
                            <div style={{height: "180px"}}>
                              <Line
                                data={{
                                  labels: stu.chartData.labels,
                                  datasets: [
                                    { label: "Marks", data: stu.chartData.marks, borderColor: "rgb(54,162,235)", tension: 0.4, pointRadius: 2, borderWidth: 2 },
                                    { label: "Attendance", data: stu.chartData.attendance, borderColor: "rgb(75,192,100)", tension: 0.4, pointRadius: 2, borderWidth: 2 },
                                    { label: "Assignments", data: stu.chartData.assignments, borderColor: "rgb(255,159,64)", tension: 0.4, pointRadius: 2, borderWidth: 2 },
                                  ]
                                }}
                                options={{
                                  responsive: true, maintainAspectRatio: false,
                                  plugins: { legend: { position: "top", labels: { font: { size: 11 } } } },
                                  scales: {
                                    y: { min: 0, max: 100, ticks: { font: { size: 10 } } },
                                    x: { ticks: { maxRotation: 45, font: { size: 9 } } }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* At-Risk Alerts */}
          {gradingData?.atRiskStudents?.length > 0 && (
            <div style={{...styles.card, marginTop: "20px"}}>
              <h3 style={styles.panelTitle}>At-Risk Student Alerts</h3>
              <table style={{width: "100%", borderCollapse: "collapse"}}>
                <thead>
                  <tr style={{textAlign: "left", borderBottom: "1px solid #eee"}}>
                    <th style={styles.th}>Student</th>
                    <th style={styles.th}>Trust Score</th>
                    <th style={styles.th}>Flag Reason</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {gradingData.atRiskStudents.map((student, idx) => (
                    <tr key={idx}>
                      <td style={{padding: "12px 10px", fontSize: "14px"}}>
                        <div style={{fontWeight: "600"}}>{student.name}</div>
                        <div style={{fontSize: "12px", color: "#888"}}>{student.course}</div>
                      </td>
                      <td style={{padding: "12px 10px"}}>
                        <span style={{color: student.trustScore < 50 ? "#d7285c" : "#f6a117", fontWeight: "bold"}}>{student.trustScore}/100</span>
                      </td>
                      <td style={{padding: "12px 10px", fontSize: "14px", color: "#555"}}>{student.flagReason}</td>
                      <td style={{padding: "12px 10px"}}>
                        <button
                          style={styles.secondaryBtn}
                          onClick={() => {
                            const full = studentsOverview.find(s => s.name === student.name);
                            setReviewStudent({ ...student, full });
                            setReviewNote("");
                            setReviewSaved(false);
                          }}
                        >
                          Review Case
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Review Case Modal ── */}
          {reviewStudent && (
            <div style={modalOverlay}>
              <div style={modalBox}>
                {/* Header */}
                <div style={modalHeader}>
                  <div>
                    <h3 style={{margin: 0, color: "#1a1a2e"}}>{reviewStudent.name}</h3>
                    <span style={{fontSize: "13px", color: "#888"}}>{reviewStudent.course} · Trust Score: </span>
                    <span style={{fontWeight: "700", color: reviewStudent.trustScore < 50 ? "#d7285c" : "#f6a117"}}>{reviewStudent.trustScore}/100</span>
                  </div>
                  <FiX size={22} style={{cursor: "pointer", color: "#666"}} onClick={() => setReviewStudent(null)} />
                </div>

                <div style={{padding: "20px", overflowY: "auto", maxHeight: "calc(85vh - 80px)"}}>
                  {/* Flag reason banner */}
                  <div style={{padding: "12px 16px", background: "#fbe9ed", borderLeft: "4px solid #d7285c", borderRadius: "6px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px"}}>
                    <FiAlertTriangle color="#d7285c" size={18} />
                    <div>
                      <div style={{fontWeight: "700", color: "#d7285c", fontSize: "14px"}}>Flag Reason</div>
                      <div style={{fontSize: "13px", color: "#555", marginTop: "2px"}}>{reviewStudent.flagReason}</div>
                    </div>
                  </div>

                  {/* Stats row */}
                  {reviewStudent.full && (
                    <>
                      <div style={{display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap"}}>
                        {[
                          { label: "Academic Score", value: `${reviewStudent.full.academicScore}/100`, color: reviewStudent.full.academicScore < 55 ? "#d7285c" : reviewStudent.full.academicScore < 75 ? "#f6a117" : "#0a8a0a" },
                          { label: "Avg Marks",      value: `${reviewStudent.full.avgMarks}%`,       color: "#0465a3" },
                          { label: "Attendance",     value: `${reviewStudent.full.avgAttendance}%`,  color: reviewStudent.full.avgAttendance < 75 ? "#d7285c" : "#0a8a0a" },
                          { label: "Assignments",    value: `${reviewStudent.full.avgAssignments}%`, color: "#555" },
                          { label: "AI Score",       value: `${reviewStudent.full.avgAiScore}%`,     color: reviewStudent.full.avgAiScore > 70 ? "#d7285c" : "#555" },
                          { label: "Plagiarism",     value: `${reviewStudent.full.avgPlagiarism}%`,  color: reviewStudent.full.avgPlagiarism > 30 ? "#d7285c" : "#555" },
                        ].map((stat, i) => (
                          <div key={i} style={{flex: "1 1 120px", background: "#f8faff", borderRadius: "8px", padding: "12px 14px", textAlign: "center", border: "1px solid #eee"}}>
                            <div style={{fontSize: "20px", fontWeight: "800", color: stat.color}}>{stat.value}</div>
                            <div style={{fontSize: "11px", color: "#888", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.4px"}}>{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Monthly trend chart */}
                      <div style={{marginBottom: "20px"}}>
                        <div style={{fontWeight: "700", fontSize: "13px", color: "#555", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px"}}>
                          Monthly Performance Trend
                        </div>
                        <div style={{height: "200px"}}>
                          <Line
                            data={{
                              labels: reviewStudent.full.chartData.labels,
                              datasets: [
                                { label: "Marks",       data: reviewStudent.full.chartData.marks,       borderColor: "rgb(54,162,235)",  tension: 0.4, pointRadius: 3, borderWidth: 2 },
                                { label: "Attendance",  data: reviewStudent.full.chartData.attendance,  borderColor: "rgb(75,192,100)",  tension: 0.4, pointRadius: 3, borderWidth: 2 },
                                { label: "Assignments", data: reviewStudent.full.chartData.assignments, borderColor: "rgb(255,159,64)",  tension: 0.4, pointRadius: 3, borderWidth: 2 },
                              ]
                            }}
                            options={{
                              responsive: true, maintainAspectRatio: false,
                              plugins: { legend: { position: "top", labels: { font: { size: 11 } } } },
                              scales: {
                                y: { min: 0, max: 100, ticks: { font: { size: 10 }, callback: v => `${v}%` } },
                                x: { ticks: { maxRotation: 45, font: { size: 9 } } }
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* Subject breakdown */}
                      <div style={{marginBottom: "20px"}}>
                        <div style={{fontWeight: "700", fontSize: "13px", color: "#555", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px"}}>
                          Subject-wise Breakdown
                        </div>
                        <table style={{width: "100%", borderCollapse: "collapse", fontSize: "13px"}}>
                          <thead>
                            <tr style={{background: "#f4f6fa", color: "#666"}}>
                              <th style={{padding: "8px 10px", textAlign: "left"}}>Subject</th>
                              <th style={{padding: "8px 10px", textAlign: "center"}}>Marks</th>
                              <th style={{padding: "8px 10px", textAlign: "center"}}>Attendance</th>
                              <th style={{padding: "8px 10px", textAlign: "center"}}>Assignments</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reviewStudent.full.subjects.map((sub, i) => (
                              <tr key={i} style={{borderBottom: "1px solid #f0f0f0"}}>
                                <td style={{padding: "9px 10px", fontWeight: "500"}}>{sub.name}</td>
                                <td style={{padding: "9px 10px", textAlign: "center", color: sub.avgMarks < 50 ? "#d7285c" : sub.avgMarks < 70 ? "#f6a117" : "#0a8a0a", fontWeight: "600"}}>{sub.avgMarks}%</td>
                                <td style={{padding: "9px 10px", textAlign: "center", color: sub.avgAttendance < 75 ? "#d7285c" : "#0a8a0a"}}>{sub.avgAttendance}%</td>
                                <td style={{padding: "9px 10px", textAlign: "center"}}>{sub.avgAssignments}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {/* Teacher note */}
                  <div>
                    <div style={{fontWeight: "700", fontSize: "13px", color: "#555", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px"}}>
                      <FiMessageSquare size={14} /> Teacher's Review Note
                    </div>
                    <textarea
                      style={{width: "100%", minHeight: "90px", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", background: "#f9fafb"}}
                      placeholder="Add your observations, action plan, or counseling notes here..."
                      value={reviewNote}
                      onChange={(e) => { setReviewNote(e.target.value); setReviewSaved(false); }}
                    />
                    <div style={{display: "flex", gap: "10px", marginTop: "10px", alignItems: "center"}}>
                      <button
                        style={{...styles.primaryAlertBtn, padding: "10px 20px", fontSize: "14px"}}
                        onClick={() => {
                          // Save note to localStorage keyed by student name
                          const key = `review_note_${reviewStudent.name}`;
                          localStorage.setItem(key, reviewNote);
                          setReviewSaved(true);
                        }}
                      >
                        <FiFileText size={14} /> Save Note
                      </button>
                      {reviewSaved && <span style={{color: "#0a8a0a", fontSize: "13px", fontWeight: "600"}}>✅ Note saved</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // ---------------- STUDENT DASHBOARD ----------------
  return (
    <Layout>
      <div style={styles.grid}>
        
        {/* LEFT COLUMN */}
        <div style={styles.leftCol}>
          <div style={styles.card}>
            <div style={styles.profileHeader}>
               <div style={styles.avatar}>
                 <FiUser size={60} color="#999" />
               </div>
               <h3 style={styles.name}>{userInfo ? userInfo.name : "Student Name"}</h3>
               <p style={styles.studentId}>Role: {role.toUpperCase()}</p>
               <div style={styles.statusBadge}>ACTIVE</div>
               <p style={styles.program}>Technology and AI Sciences</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={styles.rightCol}>
           {/* TOP METRICS */}
           <div style={styles.metricsRow}>
             <div style={styles.metricCard}>
               <div style={styles.metricIconBgBlue}>
                 <FiCheckCircle size={28} color="#0465a3" />
               </div>
               <div style={styles.metricInfo}>
                 <div style={styles.metricValue}>{performanceData ? performanceData.consistencyScore : "0"}/100</div>
                 <div style={styles.metricLabel}>Consistency Score</div>
               </div>
             </div>
             
             <div style={styles.metricCard}>
               <div style={styles.metricIconBgOrange}>
                 <FiAlertTriangle size={28} color="#f6a117" />
               </div>
               <div style={styles.metricInfo}>
                 <div style={styles.metricValue}>{performanceData ? performanceData.warnings : "0"}</div>
                 <div style={styles.metricLabel}>Academic Warnings</div>
               </div>
             </div>
             
             {attendanceData && (
                <div style={styles.metricCard}>
                  <div style={attendanceData.overallAttendance < 75 ? styles.metricIconBgRed : styles.metricIconBgBlue}>
                    <FiCalendar size={28} color={attendanceData.overallAttendance < 75 ? "#d7285c" : "#0465a3"} />
                  </div>
                  <div style={styles.metricInfo}>
                    <div style={{...styles.metricValue, color: attendanceData.overallAttendance < 75 ? "#d7285c" : "#333"}}>{attendanceData.overallAttendance}%</div>
                    <div style={styles.metricLabel}>Overall Attendance</div>
                  </div>
                </div>
              )}
           </div>

           {/* PANELS */}
           <div style={styles.panelsRow}>
              {/* GRAPH PANEL */}
              <div style={styles.panelLeft}>
                <div style={{...styles.card, height: "400px"}}>
                  <h3 style={styles.panelTitle}>Performance Trends</h3>
                  <div style={{ height: "300px" }}>
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>
              
              {/* INSIGHTS PANEL */}
              <div style={styles.panelRight}>
                <div style={{...styles.card, height: "400px", display: "flex", flexDirection: "column"}}>
                  <h3 style={styles.panelTitle}>AI Insights & Warnings</h3>
                  
                  <div style={{flex: 1, overflowY: "auto", padding: "0 5px"}}>
                    {/* Dynamic warnings from anomaly engine flags */}
                    {performanceData && performanceData.allFlags && performanceData.allFlags.length > 0 ? (
                      performanceData.allFlags.map((flag, idx) => (
                        <div key={idx} style={{ padding: "15px", background: "#fbe9ed", borderLeft: "4px solid #d7285c", borderRadius: "4px", marginBottom: "12px" }}>
                          <h4 style={{margin: "0 0 5px 0", color: "#d7285c"}}>
                            <span style={{display: "inline-flex", alignItems: "center", gap: "6px"}}>
                              <FiAlertTriangle size={14} /> Anomaly Detected
                            </span>
                          </h4>
                          <p style={{margin: 0, fontSize: "13px", color: "#333", lineHeight: "1.5"}}>{flag}</p>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "15px", background: "#e6f9ed", borderLeft: "4px solid #0a8a0a", borderRadius: "4px", marginBottom: "12px" }}>
                        <h4 style={{margin: "0 0 5px 0", color: "#0a8a0a"}}>All Clear</h4>
                        <p style={{margin: 0, fontSize: "13px", color: "#333"}}>No anomalies detected in your academic records. Your performance patterns are consistent.</p>
                      </div>
                    )}

                    {/* Contextual improvement insights */}
                    {performanceData && performanceData.consistencyScore < 80 && (
                      <div style={{ padding: "15px", background: "#fef5e7", borderLeft: "4px solid #f6a117", borderRadius: "4px", marginBottom: "12px" }}>
                        <h4 style={{margin: "0 0 5px 0", color: "#f6a117"}}>Improvement Needed</h4>
                        <p style={{margin: 0, fontSize: "13px", color: "#666"}}>Your consistency score is {performanceData.consistencyScore}/100. Focus on maintaining uniform performance across subjects and semesters.</p>
                      </div>
                    )}

                    {attendanceData && attendanceData.overallAttendance < 75 && (
                      <div style={{ padding: "15px", background: "#fbe9ed", borderLeft: "4px solid #d7285c", borderRadius: "4px", marginBottom: "12px" }}>
                        <h4 style={{margin: "0 0 5px 0", color: "#d7285c"}}>Attendance Risk</h4>
                        <p style={{margin: 0, fontSize: "13px", color: "#666"}}>Your attendance ({attendanceData.overallAttendance}%) is below the required 75% threshold. Research shows strong correlation between attendance and academic integrity outcomes.</p>
                      </div>
                    )}

                    {performanceData && performanceData.consistencyScore >= 90 && performanceData.warnings === 0 && (
                      <div style={{ padding: "15px", background: "#f9f9f9", borderRadius: "4px" }}>
                        <h4 style={{margin: "0 0 5px 0", color: "#0465a3"}}>Excellent Standing</h4>
                        <p style={{margin: 0, fontSize: "13px", color: "#666"}}>Your academic integrity score is excellent. Maintain this consistency for top-tier recommendations.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
           </div>

           {/* ATTENDANCE MODULE */}
           {attendanceData && (
             <div style={{...styles.panelsRow, marginTop: '20px'}}>
                {/* GRAPH PANEL */}
                <div style={styles.panelLeft}>
                  <div style={{...styles.card, height: "400px"}}>
                    <h3 style={styles.panelTitle}><FiCalendar style={{verticalAlign: 'middle', marginRight: '5px'}}/> Attendance Trends</h3>
                    <div style={{ height: "300px" }}>
                      {attendanceData.trends && attendanceData.trends.labels.length > 0 ? (
                        <Line 
                          data={{
                            labels: attendanceData.trends.labels,
                            datasets: [{
                              label: 'Attendance %',
                              data: attendanceData.trends.data,
                              borderColor: 'rgb(54, 162, 235)',
                              backgroundColor: 'rgba(54, 162, 235, 0.2)',
                              tension: 0.1,
                              fill: true
                            }]
                          }} 
                          options={{ responsive: true, maintainAspectRatio: false }} 
                        />
                      ) : (
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888'}}>No trends data available</div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* BREAKDOWN PANEL */}
                <div style={styles.panelRight}>
                  <div style={{...styles.card, height: "400px", display: "flex", flexDirection: "column"}}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
                      <h3 style={{...styles.panelTitle, margin: 0}}>Attendance Summary</h3>
                      <div style={{cursor: "pointer", color: "#888"}}>&#x21bb;</div>
                    </div>
                    
                    <div style={{flex: 1, overflowY: "auto"}}>
                       {/* Dynamically mapped API subjects maintaining layout */}
                       {attendanceData.subjects && attendanceData.subjects.map((sub, idx) => {
                         const percentage = sub.attendance;
                         const overrideColor = percentage >= 85 ? "#1ea1dc" : (percentage >= 75 ? "#f6a117" : "#d7285c");
                         
                         // Emulate 'total' logic purely for layout compatibility if the db just returns a %
                         const mockTotal = 40;
                         const computedAttended = Math.round((percentage / 100) * mockTotal);
                         
                         return (
                           <div key={idx} style={{ marginBottom: "20px" }}>
                             <div style={{ fontSize: "15px", color: "#555", marginBottom: "8px" }}>{sub.name}</div>
                             <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                               <div style={{ flex: 1, height: "8px", background: "#d9d9d9", borderRadius: "10px", overflow: "hidden" }}>
                                 <div style={{ width: `${percentage}%`, height: "100%", background: overrideColor, borderRadius: "10px" }}></div>
                               </div>
                               <div style={{ fontSize: "14px", color: "#666", minWidth: "110px", textAlign: "right" }}>
                                 {computedAttended}/{mockTotal} <span style={{color: "#ccc", margin: "0 8px"}}>|</span> {percentage.toFixed(2)}%
                               </div>
                             </div>
                           </div>
                         );
                       })}
                    </div>
                    
                    {/* Legend and Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", paddingTop: "15px" }}>
                       <div style={{ display: "flex", gap: "10px", fontSize: "12px", color: "#777" }}>
                         <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{width: "12px", height: "12px", background: "#1ea1dc"}}></div> Ok</div>
                         <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{width: "12px", height: "12px", background: "#f6a117"}}></div> Need Attention</div>
                         <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{width: "12px", height: "12px", background: "#d7285c"}}></div> Critical</div>
                       </div>
                       <Link to="/attendance" style={{ fontSize: "13px", color: "#1ea1dc", textDecoration: "none", fontWeight: "600" }}>View Student Attendance &rarr;</Link>
                    </div>
                  </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </Layout>
  );
};

const modalOverlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000, padding: "20px",
};
const modalBox = {
  background: "#fff", borderRadius: "14px", width: "100%",
  maxWidth: "780px", maxHeight: "85vh", boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
  display: "flex", flexDirection: "column", overflow: "hidden",
};
const modalHeader = {
  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
  padding: "20px 24px", borderBottom: "1px solid #eee",
  background: "#fafbff", flexShrink: 0,
};

const tableHeaderStyle = {
  display: "flex", alignItems: "center", padding: "10px 16px",
  background: "#f4f6fa", borderBottom: "2px solid #eee",
  fontSize: "12px", fontWeight: "700", color: "#666",
  textTransform: "uppercase", letterSpacing: "0.5px",
  borderRadius: "6px 6px 0 0",
};

const styles = {
  grid: { display: "flex", gap: "20px", width: "100%", maxWidth: "1400px", margin: "0 auto" },
  leftCol: { width: "280px", flexShrink: 0 },
  rightCol: { flex: 1, display: "flex", flexDirection: "column", gap: "20px" },
  card: { background: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  profileHeader: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "10px 0" },
  avatar: { width: "120px", height: "120px", borderRadius: "50%", background: "#f0f0f0", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "15px", border: "4px solid #fff", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" },
  name: { margin: "0 0 5px 0", fontSize: "18px", color: "var(--upes-blue)", fontWeight: "700" },
  studentId: { margin: "0 0 10px 0", fontSize: "13px", color: "#555", fontWeight: "500" },
  statusBadge: { background: "#0a8a0a", color: "#fff", padding: "4px 12px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", letterSpacing: "0.5px", marginBottom: "15px" },
  program: { margin: "0 0 5px 0", fontSize: "14px", color: "#555" },
  metricsRow: { display: "flex", gap: "20px" },
  metricCard: { flex: 1, background: "#fff", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "20px" },
  metricIconBgBlue: { width: "70px", height: "70px", borderRadius: "8px", background: "#e6f2f9", display: "flex", justifyContent: "center", alignItems: "center" },
  metricIconBgOrange: { width: "70px", height: "70px", borderRadius: "8px", background: "#fef5e7", display: "flex", justifyContent: "center", alignItems: "center" },
  metricIconBgRed: { width: "70px", height: "70px", borderRadius: "8px", background: "#fbe9ed", display: "flex", justifyContent: "center", alignItems: "center" },
  metricInfo: { display: "flex", flexDirection: "column" },
  metricValue: { fontSize: "28px", fontWeight: "700", color: "#333", lineHeight: "1.2" },
  metricLabel: { fontSize: "13px", color: "#888", fontWeight: "500" },
  panelsRow: { display: "flex", gap: "20px", flex: 1 },
  panelLeft: { flex: 6 },
  panelRight: { flex: 4 },
  panelTitle: { margin: "0 0 15px 0", fontSize: "16px", fontWeight: "700", color: "#333" },
  primaryAlertBtn: { display: "inline-flex", gap: "8px", alignItems: "center", padding: "12px 20px", background: "var(--upes-blue)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },
  secondaryBtn: { padding: "8px 12px", background: "#f4f4f4", color: "#333", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer", fontWeight: "600" },
  th: { padding: "10px", color: "#666", fontSize: "13px", textTransform: "uppercase" },
  td: { padding: "15px 10px", fontSize: "14px", color: "#333", borderBottom: "1px solid #f4f4f4" }
};

export default Dashboard;