import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import '../styles/CourseFormPage.css';

function CourseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    teacher: '',
  });
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/csrf/`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setCsrfToken(data.csrfToken);
      })
      .catch(err => console.error('Ошибка при получении CSRF:', err));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/users/`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setTeachers(data);
      })
      .catch(err => console.error('Ошибка при загрузке преподавателей:', err));
  }, []);

  useEffect(() => {
    if (id) {
      fetch(`${API_URL}/api/courses/${id}/`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setFormData({
            title: data.title,
            description: data.description,
            teacher: data.teacher,
          });
          setLoading(false);
        })
        .catch(err => {
          console.error('Ошибка:', err);
          setError('Не удалось загрузить курс');
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id
        ? `${API_URL}/api/courses/${id}/`
        : `${API_URL}/api/courses/`;

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMsg = responseData.detail || responseData.message || JSON.stringify(responseData);
        throw new Error(errorMsg);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Ошибка:', err);
      setError(err.message || 'Ошибка при сохранении курса');
    }
  };

  if (loading) return <div className="container"><p>⏳ Загрузка...</p></div>;

  return (
    <div className="form-page">
      <div className="container">
        <Link to="/" className="back-button">← Вернуться к курсам</Link>

        <div className="form-container">
          <h1>{id ? '✏️ Редактировать курс' : '➕ Создать новый курс'}</h1>

          {error && <div className="error-message">❌ {error}</div>}
          {success && <div className="success-message">✅ Курс успешно сохранён!</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Название курса *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Введите название курса"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Описание *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Введите описание курса"
                rows="5"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="teacher">Преподаватель *</label>
              <select
                id="teacher"
                name="teacher"
                value={formData.teacher}
                onChange={handleChange}
                required
              >
                <option value="">-- Выберите преподавателя --</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name} ({teacher.username})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {id ? '💾 Обновить курс' : '➕ Создать курс'}
              </button>
              <Link to="/" className="btn-secondary">Отмена</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CourseFormPage;