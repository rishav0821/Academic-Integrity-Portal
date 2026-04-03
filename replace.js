const fs = require('fs');
let content = fs.readFileSync('academic-integrity-frontend/src/pages/Dashboard.jsx', 'utf8');

// Replace mock array with blank
content = content.replace(
  `  // ---------------- STUDENT DASHBOARD ----------------
  const mockAttendanceSubjects = [
    { name: "Data Structure", attended: 32, total: 33 },
    { name: "Machine Learning", attended: 28, total: 31 },
    { name: "Operating System", attended: 25, total: 35 }
  ];
  const overallMockAttendance = Math.round(
    (mockAttendanceSubjects.reduce((acc, curr) => acc + curr.attended, 0) / 
     mockAttendanceSubjects.reduce((acc, curr) => acc + curr.total, 0)) * 100
  );`,
  `  // ---------------- STUDENT DASHBOARD ----------------`
);

// Replace Chart Data
const oldChart = `  // Mock data for graphs
  const chartData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [
      {
        label: 'Maths Performance',
        data: [65, 59, 80, 81],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Statistics Performance',
        data: [70, 62, 20, 15],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };`;

const newChart = `  // Render dynamic trends
  const chartData = (performanceData && performanceData.chartData) ? performanceData.chartData : {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [{ label: 'No Data Yet', data: [0,0,0,0], borderColor: 'rgb(200, 200, 200)' }]
  };`;

content = content.replace(oldChart, newChart);

fs.writeFileSync('academic-integrity-frontend/src/pages/Dashboard.jsx', content);
console.log('Replaced more strings successfully');
