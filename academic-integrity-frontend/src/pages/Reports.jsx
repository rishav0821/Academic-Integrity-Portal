import Layout from "../components/Layout";
import { FiAlertTriangle, FiCheckCircle, FiSearch, FiFilter } from "react-icons/fi";

const Reports = () => {
  const dummyLogs = [
    { id: "REV-901", student: "Rishav", program: "MCA", submission: "Machine Learning Final", aiScore: 88, plgScore: 12, trust: 30, date: "2026-03-22", status: "Critical" },
    { id: "REV-902", student: "Aman", program: "BTech CS", submission: "OS Kernel Module", aiScore: 5, plgScore: 2, trust: 97, date: "2026-03-21", status: "Safe" },
    { id: "REV-903", student: "Priya", program: "MCA", submission: "Data Structures Hashmap", aiScore: 0, plgScore: 45, trust: 65, date: "2026-03-20", status: "Review" },
    { id: "REV-904", student: "Neha", program: "AI Data Sci", submission: "Neural Net Homework", aiScore: 95, plgScore: 10, trust: 20, date: "2026-03-20", status: "Critical" },
    { id: "REV-905", student: "Rohan", program: "BTech CS", submission: "Networking Proxy", aiScore: 12, plgScore: 5, trust: 92, date: "2026-03-19", status: "Safe" },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Critical": return <span style={{...styles.badge, background: "#fbe9ed", color: "#d7285c"}}><FiAlertTriangle /> Critical Risk</span>;
      case "Review": return <span style={{...styles.badge, background: "#fef5e7", color: "#f6a117"}}>Review Needed</span>;
      case "Safe": return <span style={{...styles.badge, background: "#e6f2f9", color: "#0465a3"}}><FiCheckCircle /> Cleared</span>;
      default: return null;
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2>Integrity Scan Logs</h2>
          <div style={styles.toolbar}>
             <div style={styles.searchBox}>
               <FiSearch color="#999" />
               <input type="text" placeholder="Search ID or Name" style={styles.searchInput} />
             </div>
             <button style={styles.filterBtn}><FiFilter /> Filters</button>
          </div>
        </div>

        <div style={styles.card}>
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
                <th style={styles.th}>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {dummyLogs.map((log) => (
                <tr key={log.id} style={styles.tr}>
                  <td style={styles.td}><strong>{log.id}</strong></td>
                  <td style={styles.td}>
                    <div style={{fontWeight: "600"}}>{log.student}</div>
                    <div style={{fontSize: "12px", color: "#888"}}>{log.program}</div>
                  </td>
                  <td style={styles.td}>{log.submission}</td>
                  <td style={styles.td}>{log.date}</td>
                  <td style={styles.td}>{log.aiScore}%</td>
                  <td style={styles.td}>{log.plgScore}%</td>
                  <td style={styles.td}><strong>{log.trust}</strong>/100</td>
                  <td style={styles.td}>{getStatusBadge(log.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{padding: "15px", textAlign: "center", color: "var(--upes-blue)", fontWeight: "600", fontSize: "14px", cursor: "pointer"}}>
            Load More Results
          </div>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  toolbar: {
    display: "flex",
    gap: "15px"
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    padding: "8px 15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: "14px"
  },
  filterBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 15px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500"
  },
  card: {
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    overflow: "hidden"
  },
  th: {
    padding: "15px 20px",
    color: "#666",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  td: {
    padding: "15px 20px",
    fontSize: "14px",
    color: "#333",
    borderBottom: "1px solid #eee"
  },
  tr: {
    transition: "background 0.2s",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
  }
};

export default Reports;