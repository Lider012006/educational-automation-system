import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
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
  };

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот курс?')) {
      fetch(`http://localhost:8000/api/courses/${id}/`, {
        method: 'DELETE',
      })
        .then(() => {
          setCourses(courses.filter(course => course.id !== id));
        })
        .catch(err => {
          console.error('Ошибка при удалении:', err);
          alert('Не удалось удалить курс');
        });
    }
  };

  if (loading) return <div className="container"><p>⏳ Загрузка курсов...</p></div>;
  if (error) return <div className="container"><p className="error">❌ {error}</p></div>;

  return (
    <div className="home-page">
      <div className="container">
        <div className="home-header">
          <h1>📚 Курсы</h1>
          <Link to="/courses/new" className="btn-add-course">
            ➕ Новый курс
          </Link>
        </div>
        
        {courses.length === 0 ? (
          <p className="no-courses">Курсов пока нет. <Link to="/courses/new">Создайте первый курс!</Link></p>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <Link to={`/courses/${course.id}`} className="course-link">
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
                <div className="course-actions">
                  <Link to={`/courses/${course.id}/edit`} className="btn-edit">
                    ✏️ Редактировать
                  </Link>
                  <button 
                    onClick={() => handleDelete(course.id)} 
                    className="btn-delete"
                  >
                    🗑️ Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
