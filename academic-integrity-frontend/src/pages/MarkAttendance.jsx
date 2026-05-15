import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../api/axios";
import { FiSave, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

export default function MarkAttendance() {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceState, setAttendanceState] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get("/attendance/subjects");
        setSubjects(res.data);
        if (res.data.length > 0) {
          setSelectedSubject(res.data[0]._id);
        }
      } catch (error) {
        console.error("Failed to load subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch students and existing attendance when date or subject changes
  useEffect(() => {
    if (!selectedSubject || !date) return;
    
    const fetchData = async () => {
      setLoading(true);
      setMessage(null);
      try {
        // 1. Fetch all students
        const studentRes = await api.get("/attendance/students");
        const fetchedStudents = studentRes.data;
        setStudents(fetchedStudents);

        // 2. Fetch attendance for date AND subject
        const attendanceRes = await api.get(`/attendance?date=${date}&subjectId=${selectedSubject}`);
        const existingRecords = attendanceRes.data;

        // 3. Map state
        const stateMap = {};
        fetchedStudents.forEach(student => {
          const record = existingRecords.find(r => r.student._id === student._id);
          // Default to "present" if not marked yet
          stateMap[student._id] = record ? record.status : "present";
        });
        setAttendanceState(stateMap);
      } catch (error) {
        console.error(error);
        setMessage({ type: "error", text: "Failed to load students/attendance data." });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, selectedSubject]);

  const toggleStatus = (studentId) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present"
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const attendances = Object.keys(attendanceState).map(studentId => ({
        studentId,
        status: attendanceState[studentId]
      }));

      await api.post("/attendance", { date, subjectId: selectedSubject, attendances });
      setMessage({ type: "success", text: "Attendance saved successfully!" });
      
      // clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to save attendance." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
          <div>
            <h2 style={{ margin: 0, color: "#fff" }}>Mark Attendance</h2>
            <p style={{ margin: "5px 0 0", color: "#8892a4" }}>Record subject-wise daily attendance.</p>
          </div>
          <div style={{ display: "flex", gap: "15px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <label style={{ fontSize: "12px", color: "#8892a4", marginBottom: "5px" }}>Select Subject</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{
                  background: "#1a2333",
                  border: "1px solid #2a3a58",
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  outline: "none",
                  minWidth: "150px"
                }}
              >
                {subjects.map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.name} ({sub.code})</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <label style={{ fontSize: "12px", color: "#8892a4", marginBottom: "5px" }}>Select Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                style={{
                  background: "#1a2333",
                  border: "1px solid #2a3a58",
                  color: "#fff",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  outline: "none"
                }}
              />
            </div>
          </div>
        </div>

        {message && (
          <div style={{
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: message.type === "error" ? "rgba(215, 40, 92, 0.1)" : "rgba(10, 138, 10, 0.1)",
            color: message.type === "error" ? "#d7285c" : "#0a8a0a",
            border: `1px solid ${message.type === "error" ? "#d7285c" : "#0a8a0a"}`
          }}>
            {message.type === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
            {message.text}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#8892a4" }}>Loading...</div>
        ) : !selectedSubject ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#8892a4" }}>Please select a subject.</div>
        ) : (
          <div style={{ background: "#111827", borderRadius: "10px", border: "1px solid #2a3a58", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: "#e2e8f0" }}>
              <thead>
                <tr style={{ background: "#1e293b", borderBottom: "1px solid #2a3a58" }}>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>Student Name</th>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>Student ID</th>
                  <th style={{ padding: "12px 20px", textAlign: "center", fontWeight: "600", fontSize: "14px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ padding: "20px", textAlign: "center", color: "#8892a4" }}>
                      No students found.
                    </td>
                  </tr>
                ) : (
                  students.map(student => (
                    <tr key={student._id} style={{ borderBottom: "1px solid #1e293b" }}>
                      <td style={{ padding: "12px 20px", fontSize: "14px" }}>{student.name}</td>
                      <td style={{ padding: "12px 20px", fontSize: "14px", color: "#8892a4" }}>{student.studentId || "N/A"}</td>
                      <td style={{ padding: "12px 20px", textAlign: "center" }}>
                        <button
                          onClick={() => toggleStatus(student._id)}
                          style={{
                            padding: "6px 16px",
                            borderRadius: "20px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            background: attendanceState[student._id] === "present" ? "rgba(10, 138, 10, 0.2)" : "rgba(215, 40, 92, 0.2)",
                            color: attendanceState[student._id] === "present" ? "#4ade80" : "#f87171",
                            transition: "all 0.2s"
                          }}
                        >
                          {attendanceState[student._id] === "present" ? "Present" : "Absent"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {students.length > 0 && (
              <div style={{ padding: "16px 20px", borderTop: "1px solid #2a3a58", display: "flex", justifyContent: "flex-end", background: "#1e293b" }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#e91e8c",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  <FiSave />
                  {saving ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
