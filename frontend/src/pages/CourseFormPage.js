import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/CourseFormPage.css';

function CourseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  // Получить CSRF токен
  useEffect(() => {
    fetch('http://localhost:8000/api/csrf/')
      .then(res => res.json())
      .then(data => {
        console.log('CSRF токен получен:', data.csrfToken);
        setCsrfToken(data.csrfToken);
      })
      .catch(err => console.error('Ошибка при получении CSRF:', err));
  }, []);

  // Загрузить данные курса если редактируем
  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8000/api/courses/${id}/`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            title: data.title,
            description: data.description,
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
        ? `http://localhost:8000/api/courses/${id}/`
        : 'http://localhost:8000/api/courses/';

      console.log('Отправляю запрос:', { method, url, formData, csrfToken });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(formData),
      });

      console.log('Ответ статус:', response.status);

      const responseData = await response.json();
      console.log('Ответ данные:', responseData);

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
