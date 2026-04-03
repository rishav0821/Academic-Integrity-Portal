import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import courses from "../data/courses";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale);

const CourseDetail = () => {
  const { id } = useParams();
  const course = courses.find((c) => c.id === parseInt(id));

  const data = {
    labels: ["Risk Score"],
    datasets: [
      {
        label: "Risk %",
        data: [course.risk],
        backgroundColor: course.risk > 70 ? "red" : course.risk > 40 ? "orange" : "green",
      },
    ],
  };

  return (
    <Layout>
      <h1>{course.name}</h1>
      <p>{course.description}</p>
      <p>Total Students: {course.students}</p>

      <div style={{ width: "400px", marginTop: "30px" }}>
        <Bar data={data} />
      </div>
    </Layout>
  );
};

export default CourseDetail;