import { useState } from "react";
import Layout from "../components/Layout";
import { FiUploadCloud, FiSearch, FiAlertCircle, FiCheck, FiCpu } from "react-icons/fi";

const Submissions = () => {
  const [text, setText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = () => {
    if (!text.trim()) return;
    setScanning(true);
    setResult(null);

    // Mock an AI process taking time
    setTimeout(() => {
      setScanning(false);
      
      // Simple mock logic: if phrase contains "AI", flag it heavily. Otherwise base it on length.
      const isSuspect = text.toLowerCase().includes("ai") || text.split(" ").length > 30;
      
      setResult({
        aiProbability: isSuspect ? 89 : 12,
        plagiarismScore: isSuspect ? 45 : 2,
        trustScore: isSuspect ? 25 : 94,
        status: isSuspect ? "Critical Risk" : "Safe",
        color: isSuspect ? "#d7285c" : "#0465a3"
      });
    }, 2500);
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2>New Submission Scanner</h2>
          <p>Paste the student's assignment below to run an AI integrity verification.</p>
        </div>

        <div style={styles.content}>
          <div style={styles.inputSection}>
            <textarea 
              style={styles.textarea} 
              placeholder="Paste text contents here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={scanning}
            />
            
            <button 
              style={{...styles.scanBtn, opacity: (!text.trim() || scanning) ? 0.6 : 1}} 
              onClick={handleScan}
              disabled={!text.trim() || scanning}
            >
              {scanning ? (
                <><FiRefreshCw style={styles.spin} /> Scanning Dataset...</>
              ) : (
                <><FiSearch /> Run Integrity Scan</>
              )}
            </button>
          </div>

          <div style={styles.resultSection}>
            {scanning && (
              <div style={styles.loadingBox}>
                <div style={styles.spinner}></div>
                <h3 style={{marginTop: "20px", color: "var(--upes-blue)"}}>Analyzing Linguistic Signatures...</h3>
                <p style={{color: "#666", fontSize: "14px"}}>Checking against OpenAI classifiers and academic databases.</p>
              </div>
            )}

            {!scanning && !result && (
              <div style={styles.placeholderBox}>
                <FiUploadCloud size={60} color="#ddd" />
                <p style={{color: "#999", marginTop: "15px"}}>Awaiting submission.</p>
              </div>
            )}

            {!scanning && result && (
              <div style={styles.resultCard}>
                <div style={{...styles.resultHeader, borderBottom: `3px solid ${result.color}`}}>
                  <h3>Scan Complete: <span style={{color: result.color}}>{result.status}</span></h3>
                </div>
                
                <div style={styles.metricsGrid}>
                  <div style={styles.metric}>
                     <FiCpu size={24} color={result.aiProbability > 50 ? "#d7285c" : "#0465a3"} />
                     <div style={styles.metricValue}>{result.aiProbability}%</div>
                     <div style={styles.metricLabel}>AI Generated</div>
                  </div>
                  <div style={styles.metric}>
                     <FiAlertCircle size={24} color={result.plagiarismScore > 30 ? "#f6a117" : "#0465a3"} />
                     <div style={styles.metricValue}>{result.plagiarismScore}%</div>
                     <div style={styles.metricLabel}>Plagiarism Similarity</div>
                  </div>
                  <div style={styles.metric}>
                     <FiCheck size={24} color={result.trustScore < 50 ? "#d7285c" : "#0a8a0a"} />
                     <div style={styles.metricValue}>{result.trustScore}/100</div>
                     <div style={styles.metricLabel}>Overall Trust Score</div>
                  </div>
                </div>

                <div style={styles.actionRow}>
                   <button style={styles.secondaryBtn}>View Detailed Breakdown</button>
                   {result.status === "Critical Risk" && (
                     <button style={styles.primaryAlertBtn}>Trigger Automated Correction Request</button>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// basic inline spin animation requires a style tag
const spinStyle = `
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "20px",
  },
  content: {
    display: "flex",
    gap: "30px",
    height: "600px",
  },
  inputSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  textarea: {
    flex: 1,
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "15px",
    resize: "none",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
    fontFamily: "inherit",
    lineHeight: "1.6"
  },
  scanBtn: {
    padding: "16px",
    background: "var(--upes-button)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px"
  },
  resultSection: {
    flex: 1,
    background: "#fff",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  placeholderBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafd"
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #e6f2f9",
    borderTop: "5px solid var(--upes-blue)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  spin: {
    animation: "spin 1s linear infinite"
  },
  resultCard: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  resultHeader: {
    padding: "20px 30px",
    background: "#fafafa",
  },
  metricsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "40px",
    flex: 1,
  },
  metric: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "20px",
    background: "#f9f9f9",
    borderRadius: "8px"
  },
  metricValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    width: "80px"
  },
  metricLabel: {
    fontSize: "15px",
    color: "#666",
    fontWeight: "500"
  },
  actionRow: {
    padding: "20px 30px",
    borderTop: "1px solid #eee",
    display: "flex",
    gap: "15px",
  },
  secondaryBtn: {
    padding: "12px 20px",
    background: "#eee",
    color: "#333",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  primaryAlertBtn: {
    padding: "12px 20px",
    background: "#d7285c",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  }
};

// Inject keyframes globally
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = spinStyle;
  document.head.appendChild(styleSheet);
}

import { FiRefreshCw } from "react-icons/fi";
export default Submissions;
