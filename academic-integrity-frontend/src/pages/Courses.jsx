import Layout from "../components/Layout";
import courses from "../data/courses";
import { Link } from "react-router-dom";

const Courses = () => {
  return (
    <Layout>
      <h1>Courses</h1>
      <p>List of all monitored courses.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/courses/${course.id}`}
            style={{
              textDecoration: "none",
              background: "#1e1e1e",
              padding: "20px",
              borderRadius: "10px",
              color: "white",
            }}
          >
            <h3>{course.name}</h3>
            <p>Students: {course.students}</p>
            <p>Risk Score: {course.risk}%</p>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export default Courses;