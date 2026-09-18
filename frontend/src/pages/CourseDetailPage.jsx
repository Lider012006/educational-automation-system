import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/CourseDetailPage.css';

import { API_URL as API } from '../config';

async function getCsrfToken() {
  const res = await fetch(`${API}/api/csrf/`, { credentials: 'include' });
  const data = await res.json();
  return data.csrfToken;
}

function AssignmentBlock({ assignment, user, onChanged }) {
  const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');
  const isStudent = user && user.role === 'student';

  const [submissions, setSubmissions] = useState(assignment.submissions || []);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [gradeInputs, setGradeInputs] = useState({});

  const loadSubmissions = () => {
    fetch(`${API}/api/submissions/?assignment=${assignment.id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setSubmissions(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (isTeacher) loadSubmissions();
  }, [isTeacher]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${API}/api/submissions/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify({ assignment: assignment.id, content }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Ошибка отправки');
      }
      setContent('');
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGrade = async (submissionId) => {
    const input = gradeInputs[submissionId] || {};
    if (!input.score) return;
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${API}/api/grades/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify({
          submission: submissionId,
          score: input.score,
          feedback: input.feedback || '',
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
      }
      loadSubmissions();
    } catch (err) {
      alert('Ошибка при выставлении оценки: ' + err.message);
    }
  };

  return (
    <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 12 }}>
      <h3>{assignment.title}</h3>
      <p>{assignment.description}</p>
      <small>Срок сдачи: {new Date(assignment.due_date).toLocaleString('ru-RU')}</small>

      {isStudent && (
        <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <textarea
            placeholder="Ваш ответ на задание"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Сдать задание</button>
        </form>
      )}

      {isTeacher && (
        <div style={{ marginTop: 12 }}>
          <strong>Сдано работ: {submissions.length}</strong>
          {submissions.map((s) => (
            <div key={s.id} style={{ marginTop: 8, padding: 8, background: '#f7f7f7', borderRadius: 6 }}>
              <div><strong>{s.student_username}</strong></div>
              <div>{s.content}</div>
              <small>Сдано: {new Date(s.submitted_at).toLocaleString('ru-RU')}</small>
              <div style={{ marginTop: 8 }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Балл (0-100)"
                  style={{ width: 100, marginRight: 8 }}
                  onChange={(e) =>
                    setGradeInputs((prev) => ({
                      ...prev,
                      [s.id]: { ...prev[s.id], score: e.target.value },
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="Комментарий"
                  style={{ width: 200, marginRight: 8 }}
                  onChange={(e) =>
                    setGradeInputs((prev) => ({
                      ...prev,
                      [s.id]: { ...prev[s.id], feedback: e.target.value },
                    }))
                  }
                />
                <button onClick={() => handleGrade(s.id)}>Поставить оценку</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [formError, setFormError] = useState('');

  const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');

  const loadAssignments = () => {
    fetch(`${API}/api/assignments/?course=${id}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setAssignments(data))
      .catch((err) => console.error('Ошибка загрузки заданий:', err));
  };

  useEffect(() => {
    fetch(`${API}/api/courses/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setCourse(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка:', err);
        setError('Не удалось загрузить курс');
        setLoading(false);
      });

    loadAssignments();
  }, [id]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${API}/api/assignments/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify({
          course: id,
          title: newTitle,
          description: newDescription,
          due_date: newDueDate,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Ошибка создания задания');
      }
      setNewTitle('');
      setNewDescription('');
      setNewDueDate('');
      setShowForm(false);
      loadAssignments();
    } catch (err) {
      setFormError(err.message);
    }
  };

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

        <div className="assignments-section" style={{ marginTop: 32 }}>
          <h2>📝 Задания ({assignments.length})</h2>

          {isTeacher && (
            <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: 16 }}>
              {showForm ? 'Отмена' : '+ Новое задание'}
            </button>
          )}

          {showForm && (
            <form onSubmit={handleCreateAssignment} style={{ marginBottom: 24, padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
              <div style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="Название задания"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: 8 }}
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <textarea
                  placeholder="Описание"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                  style={{ width: '100%', padding: 8 }}
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <input
                  type="datetime-local"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: 8 }}
                />
              </div>
              {formError && <p style={{ color: 'red' }}>{formError}</p>}
              <button type="submit">Создать</button>
            </form>
          )}

          {assignments.length === 0 ? (
            <p>Заданий пока нет</p>
          ) : (
            <div className="assignments-list">
              {assignments.map((a) => (
                <AssignmentBlock key={a.id} assignment={a} user={user} onChanged={loadAssignments} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetailPage;