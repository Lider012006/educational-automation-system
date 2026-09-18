import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      background: '#333',
      color: '#fff',
    }}>
      <div>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', marginRight: 16 }}>
          📚 LMS
        </Link>
        {user && (
          <Link to="/grades" style={{ color: '#fff', textDecoration: 'none' }}>
            📊 Оценки
          </Link>
        )}
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: 12 }}>
              {user.username} ({user.role})
            </span>
            <button onClick={handleLogout}>Выйти</button>
          </>
        ) : (
          <Link to="/login" style={{ color: '#fff' }}>Войти</Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;