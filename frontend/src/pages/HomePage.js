import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/courses/')
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка:', err);
        setError('Не удалось загрузить курсы');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container"><p>⏳ Загрузка курсов...</p></div>;
  if (error) return <div className="container"><p className="error">❌ {error}</p></div>;

  return (
    <div className="home-page">
      <div className="container">
        <h1>📚 Курсы</h1>
        
        {courses.length === 0 ? (
          <p>Курсов пока нет</p>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <Link to={`/courses/${course.id}`} key={course.id} className="course-card">
                <div className="course-content">
                  <h2>{course.title}</h2>
                  <p>{course.description}</p>
                  <div className="course-meta">
                    <span className="lesson-count">
                      📖 {course.lessons?.length || 0} уроков
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
