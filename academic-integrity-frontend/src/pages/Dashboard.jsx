import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiAlertTriangle, FiTrendingUp, FiUser, FiUploadCloud, FiCalendar, FiBarChart2 } from "react-icons/fi";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [gradingData, setGradingData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);

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
          setAttendanceData(attRes.data?.overallAttendance ? attRes.data : {
            overallAttendance: 86,
            trends: { labels: ["Week 1", "Week 2", "Week 3", "Week 4"], data: [95, 88, 70, 82] },
            subjects: [
              { name: "Mathematics", attendance: 92 },
              { name: "Statistics", attendance: 65 },
              { name: "Computer Science", attendance: 89 }
            ]
          });
          setPerformanceData(perfRes.data?.consistencyScore ? perfRes.data : {
            consistencyScore: 75,
            warnings: 1,
            allFlags: ["Declining Trend: Performance has been consistently declining over the last 3 semesters. Recommend academic counseling."],
            chartData: {
              labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
              datasets: [
                {
                  label: 'Maths Performance',
                  data: [65, 60, 80, 81],
                  borderColor: 'rgb(75, 192, 192)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  tension: 0.1,
                  fill: false
                },
                {
                  label: 'Statistics Performance',
                  data: [70, 62, 20, 15],
                  borderColor: 'rgb(255, 99, 132)',
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  tension: 0.1,
                  fill: false
                }
              ]
            }
          });
        } else if (userRole === "teacher" || userRole === "admin") {
          const gradRes = await api.get("/analytics/grading-consistency");
          setGradingData(gradRes.data);
        }
      } catch (err) {
        console.error("failed to fetch protected data", err);
      }
    };
    fetchData();
  }, []);

  const role = userInfo?.role || "student";

  // Fallback to mock data if API dataset is empty or undefined
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
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Subject Consistency Over Time' },
    },
  };

  // ---------------- TEACHER DASHBOARD ----------------
  if (role === "teacher" || role === "admin") {
    const gradingChartData = (() => {
      if (!gradingData || !gradingData.consistencyData) return null;
      const labels = gradingData.consistencyData.map(c => c.subject);
      const allTeachers = new Set();
      gradingData.consistencyData.forEach(c => c.averages.forEach(a => allTeachers.add(a.teacher)));
      
      const datasets = Array.from(allTeachers).map((teacher, idx) => {
         const colors = ['rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 205, 86, 0.7)', 'rgba(54, 162, 235, 0.7)'];
         return {
           label: teacher,
           backgroundColor: colors[idx % colors.length],
           data: gradingData.consistencyData.map(c => {
              const found = c.averages.find(a => a.teacher === teacher);
              return found ? found.average : 0;
           })
         };
      });
      return { labels, datasets };
    })();

    return (
      <Layout>
        <div style={styles.grid}>
          <div style={styles.rightCol}>
            <div style={{...styles.card, marginBottom: "20px"}}>
              <h2 style={{margin: "0 0 10px 0"}}>Faculty Portal</h2>
              <p style={{color: "#666"}}>Welcome back, Prof. {userInfo?.name}. Monitor student performance anomalies below.</p>
              <div style={{ marginTop: "15px" }}>
                 <Link to="/data-entry" style={{...styles.primaryAlertBtn, textDecoration: "none"}}>
                   <FiUploadCloud /> Upload New Marks
                 </Link>
              </div>
            </div>

            <div style={styles.metricsRow}>
               <div style={styles.metricCard}>
                 <div style={styles.metricIconBgRed}>
                   <FiAlertTriangle size={28} color="#d7285c" />
                 </div>
                 <div style={styles.metricInfo}>
                   <div style={styles.metricValue}>12</div>
                   <div style={styles.metricLabel}>At-Risk Students</div>
                 </div>
               </div>
               
               <div style={styles.metricCard}>
                 <div style={styles.metricIconBgOrange}>
                   <FiTrendingUp size={28} color="#f6a117" />
                 </div>
                 <div style={styles.metricInfo}>
                   <div style={styles.metricValue}>3</div>
                   <div style={styles.metricLabel}>Recent Anomalies</div>
                 </div>
               </div>
            </div>

            <div style={{...styles.card, marginTop: "20px"}}>
              <h3 style={styles.panelTitle}>At-Risk Student Alerts</h3>
              <table style={{width: "100%", borderCollapse: "collapse"}}>
                <thead>
                  <tr style={{textAlign: "left", borderBottom: "1px solid #eee"}}>
                    <th style={styles.th}>Student</th>
                    <th style={styles.th}>Consistency</th>
                    <th style={styles.th}>Flag Reason</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {gradingData?.atRiskStudents && gradingData.atRiskStudents.length > 0 ? (
                    gradingData.atRiskStudents.map((student, idx) => (
                      <tr key={idx} style={styles.td}>
                        <td>{student.name} ({student.course})</td>
                        <td><span style={{color: student.trustScore < 50 ? "#d7285c" : "#f6a117", fontWeight: "bold"}}>{student.trustScore}/100</span></td>
                        <td>{student.flagReason}</td>
                        <td><button style={styles.secondaryBtn}>Review Case</button></td>
                      </tr>
                    ))
                  ) : (
                    <tr style={styles.td}>
                      <td colSpan="4" style={{textAlign: "center", color: "#888"}}>No at-risk students found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* GRADING CONSISTENCY MODULE */}
            {gradingData && (
              <div style={{...styles.card, marginTop: "20px"}}>
                <h3 style={styles.panelTitle}><FiBarChart2 style={{verticalAlign: 'middle', marginRight: '5px'}}/> Grading Consistency Analysis</h3>
                
                {gradingData.alerts && gradingData.alerts.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    {gradingData.alerts.map((al, idx) => (
                      <div key={idx} style={{ padding: "15px", background: "#fbe9ed", borderLeft: "4px solid #d7285c", borderRadius: "4px", marginBottom: "10px" }}>
                        <h4 style={{margin: "0 0 5px 0", color: "#d7285c"}}>Warning: Evaluation Bias Detected</h4>
                        <p style={{margin: 0, fontSize: "14px", color: "#333"}}><strong>{al.subject}:</strong> {al.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {gradingChartData && (
                  <div style={{ height: "300px", marginTop: "15px" }}>
                    <Bar 
                      data={gradingChartData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'top' }, title: { display: true, text: 'Average Marks by Evaluator' } }
                      }} 
                    />
                  </div>
                )}
              </div>
            )}
          </div>
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
                       <Link to="#" style={{ fontSize: "13px", color: "#1ea1dc", textDecoration: "none", fontWeight: "600" }}>View Student Attendance &rarr;</Link>
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