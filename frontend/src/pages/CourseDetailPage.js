import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/CourseDetailPage.css';

function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/courses/${id}/`)
      .then(res => res.json())
      .then(data => {
        setCourse(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка:', err);
        setError('Не удалось загрузить курс');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="container"><p>⏳ Загрузка курса...</p></div>;
  if (error) return <div className="container"><p className="error">❌ {error}</p></div>;
  if (!course) return <div className="container"><p>Курс не найден</p></div>;

  return (
    <div className="course-detail-page">
      <div className="container">
        <Link to="/" className="back-button">← Вернуться к курсам</Link>
        
        <div className="course-header">
          <h1>{course.title}</h1>
          <p className="description">{course.description}</p>
        </div>

        <div className="lessons-section">
          <h2>📖 Уроки ({course.lessons?.length || 0})</h2>
          
          {!course.lessons || course.lessons.length === 0 ? (
            <p>Уроков в этом курсе пока нет</p>
          ) : (
            <div className="lessons-list">
              {course.lessons
                .sort((a, b) => a.order - b.order)
                .map((lesson, index) => (
                  <div key={lesson.id} className="lesson-item">
                    <div className="lesson-header">
                      <h3>
                        <span className="lesson-number">{index + 1}</span>
                        {lesson.title}
                      </h3>
                    </div>
                    <p className="lesson-content">{lesson.content}</p>
                    {lesson.video_url && (
                      <div className="lesson-video">
                        <a href={lesson.video_url} target="_blank" rel="noopener noreferrer">
                          🎥 Посмотреть видео
                        </a>
                      </div>
                    )}
                    <small className="lesson-date">
                      Создано: {new Date(lesson.created_at).toLocaleDateString('ru-RU')}
                    </small>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetailPage;
