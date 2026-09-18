import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { API_URL as API } from '../config';

function scoreColor(score) {
  if (score >= 85) return '#2e7d32';
  if (score >= 60) return '#f9a825';
  return '#c62828';
}

function GradesPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);

  const isTeacher = user && (user.role === 'teacher' || user.role === 'admin');

  useEffect(() => {
    fetch(`${API}/api/courses/`)
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    let url = isTeacher ? `${API}/api/grades/` : `${API}/api/grades/?mine=true`;
    if (selectedCourse) {
      url += (url.includes('?') ? '&' : '?') + `course=${selectedCourse}`;
    }
    fetch(url, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => new Date(b.graded_at) - new Date(a.graded_at));
        setGrades(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user, isTeacher, selectedCourse]);

  if (!user) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>Нужно войти в систему, чтобы посмотреть оценки.</p>
        <Link to="/login">Войти</Link>
      </div>
    );
  }

  const average =
    grades.length > 0
      ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1)
      : null;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 4 }}>📊 {isTeacher ? 'Все оценки' : 'Мои оценки'}</h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        {isTeacher ? 'Оценки всех студентов по всем курсам' : 'Ваша успеваемость по всем курсам'}
      </p>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value="">Все курсы</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>

        {average !== null && (
          <div style={{
            padding: '10px 18px',
            background: '#f0f4ff',
            borderRadius: 8,
            border: '1px solid #dbe4ff',
          }}>
            <strong>Средний балл: </strong>
            <span style={{ color: scoreColor(average), fontWeight: 'bold' }}>{average}</span>
            {' '}— {grades.length} {isTeacher ? 'оценок' : 'работ оценено'}
          </div>
        )}
      </div>

      {loading ? (
        <p>⏳ Загрузка...</p>
      ) : grades.length === 0 ? (
        <p>Оценок пока нет{selectedCourse ? ' по выбранному курсу' : ''}.</p>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #eee' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#fafafa', textAlign: 'left' }}>
                {isTeacher && <th style={thStyle}>Студент</th>}
                <th style={thStyle}>Курс</th>
                <th style={thStyle}>Задание</th>
                <th style={thStyle}>Балл</th>
                <th style={thStyle}>Комментарий</th>
                <th style={thStyle}>Дата</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, index) => (
                <tr
                  key={g.id}
                  style={{
                    background: index % 2 === 0 ? '#fff' : '#fafbff',
                    borderTop: '1px solid #eee',
                  }}
                >
                  {isTeacher && <td style={tdStyle}>{g.student_username}</td>}
                  <td style={tdStyle}>
                    <Link to={`/courses/${g.course_id}`} style={{ color: '#3949ab', textDecoration: 'none' }}>
                      {g.course_title}
                    </Link>
                  </td>
                  <td style={tdStyle}>{g.assignment_title}</td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 12,
                      background: scoreColor(g.score) + '22',
                      color: scoreColor(g.score),
                      fontWeight: 'bold',
                    }}>
                      {g.score}
                    </span>
                  </td>
                  <td style={tdStyle}>{g.feedback || '—'}</td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: '#888' }}>
                    {new Date(g.graded_at).toLocaleString('ru-RU', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '10px 12px', fontSize: 13, color: '#555', borderBottom: '2px solid #eee' };
const tdStyle = { padding: '10px 12px', fontSize: 14 };

export default GradesPage;