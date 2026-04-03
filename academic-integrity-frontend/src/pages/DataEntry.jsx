import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { FiSave, FiUser, FiBook } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const DataEntry = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    studentId: "",
    subjectId: "",
    semester: 1,
    marks: "",
    attendance: "",
    assignments: ""
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [studRes, subRes] = await Promise.all([
          api.get("/meta/students"),
          api.get("/meta/subjects")
        ]);
        setStudents(studRes.data);
        setSubjects(subRes.data);
      } catch (err) {
        console.error("Error fetching form data params", err);
      }
    };
    fetchMeta();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await api.post("/marks", {
        studentId: formData.studentId,
        subjectId: formData.subjectId,
        semester: Number(formData.semester),
        marks: Number(formData.marks),
        attendance: Number(formData.attendance) || 0,
        assignments: Number(formData.assignments) || 0
      });
      setMsg("✅ " + res.data.message + " - Consistency Score: " + res.data.data.consistencyScore);
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err) {
      setMsg("❌ Error submitting marks.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={{marginTop: 0, color: "var(--upes-blue)"}}>Upload Student Marks</h2>
          <p style={{color: "#666", marginBottom: "25px"}}>Submit academic records to run them through the Anomaly Detection Engine.</p>
          
          {msg && <div style={styles.alertBox}>{msg}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}><FiUser/> Select Student</label>
                <select name="studentId" required value={formData.studentId} onChange={handleChange} style={styles.input}>
                  <option value="">-- Choose Student --</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}><FiBook/> Select Subject</label>
                <select name="subjectId" required value={formData.subjectId} onChange={handleChange} style={styles.input}>
                  <option value="">-- Choose Subject --</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Semester</label>
                <input type="number" name="semester" min="1" max="8" required value={formData.semester} onChange={handleChange} style={styles.input} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Marks Obtained (0-100)</label>
                <input type="number" name="marks" min="0" max="100" required value={formData.marks} onChange={handleChange} style={styles.input} />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Attendance % (Optional)</label>
                <input type="number" name="attendance" min="0" max="100" value={formData.attendance} onChange={handleChange} style={styles.input} />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Internal Assignment Score (Optional)</label>
                <input type="number" name="assignments" min="0" max="100" value={formData.assignments} onChange={handleChange} style={styles.input} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{...styles.submitBtn, opacity: loading ? 0.7 : 1}}>
              <FiSave size={18} /> {loading ? "Running AI Engine Analysis..." : "Submit & Analyze Record"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: { maxWidth: "800px", margin: "40px auto" },
  card: { background: "#fff", padding: "40px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  row: { display: "flex", gap: "20px" },
  formGroup: { flex: 1, display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#444", display: "flex", alignItems: "center", gap: "6px" },
  input: { padding: "12px 15px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "15px", color: "#333", backgroundColor: "#f9fafb" },
  submitBtn: { padding: "15px", background: "var(--upes-blue)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "10px" },
  alertBox: { padding: "15px", background: "#e6f2f9", color: "#0465a3", borderRadius: "6px", marginBottom: "20px", fontWeight: "bold" }
};

export default DataEntry;
