import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const StudentRegisterComp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false); // Új state a siker jelzésére
  
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    email: '',
    password: '',
    isOver17: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.isOver17) {
      setError('A regisztrációhoz el kell múlnod 17 évesnek!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/auth/registerUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.lastName} ${formData.firstName}`,
          email: formData.email,
          password: formData.password,
          role: 'STUDENT'
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/student');
        }, 2000);
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Hiba történt a regisztráció során');
      }

    } catch (err: any) {
      if (!err.message.includes("Unexpected end of JSON input")) {
        setError(err.message);
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/student'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <main className='adminMain'>
        <div className="text">
          <h1 style={{
            color: "white",
            textTransform: "uppercase",
            fontSize: '3.2rem',
            marginTop: "2rem",
          }}>Tanulói Regisztráció</h1>
          <div className="underline"></div>
          <h2 style={{ color: "white" }}>Hozd létre saját fiókodat!</h2>
        </div>

        <div className="forms">
          <form className='adminForm' onSubmit={handleSubmit} style={{ minHeight: 'auto', gap: '0.8rem', padding: '1.5rem' }}>
            <h1 style={{ marginTop: '2.0rem', marginBottom: '2.5rem' }}><i className="bi bi-person-plus-fill"></i></h1>
            <h2>Új fiók létrehozása</h2>
            
            {/* Üzenetek megjelenítése */}
            {error && <div className='loginError' style={{ color: '#ff4d4d', marginBottom: '0.5rem', fontWeight: 'bold' }}>{error}</div>}
            {success && <div style={{ color: '#4BB543', marginBottom: '0.5rem', fontWeight: 'bold' }}>Sikeres regisztráció! Átirányítás...</div>}
            
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <input
                type="text"
                name="lastName"
                placeholder='Családnév'
                required
                disabled={success}
                onChange={handleChange}
                style={{ flex: 1, padding: '10px' }} 
              />
              <input
                type="text"
                name="firstName"
                placeholder='Utónév'
                required
                disabled={success}
                onChange={handleChange}
                style={{ flex: 1, padding: '10px' }}
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder='✉ E-mail cím'
              required
              disabled={success}
              onChange={handleChange}
              style={{ padding: '10px' }}
            />
            
            <input
              type="password"
              name="password"
              placeholder='🔒︎ Jelszó'
              required
              disabled={success}
              onChange={handleChange}
              style={{ padding: '10px' }}
            />

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: 'white', 
              marginTop: '5px',
              width: '100%',
              justifyContent: 'flex-start'
            }}>
              <input
                type="checkbox"
                name="isOver17"
                id="age-check"
                disabled={success}
                onChange={handleChange}
                style={{ width: 'auto', cursor: 'pointer' }}
              />
              <label htmlFor="age-check" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                Elmúltam 17 éves
              </label>
            </div>

            <button type="submit" disabled={loading || success} style={{ marginTop: '1.2rem' }}>
              {loading ? 'Regisztráció...' : success ? 'SIKERES!' : 'FIÓK LÉTREHOZÁSA'}
            </button>

            <button 
              type="button" 
              onClick={() => navigate('/student')}
              style={{
                marginTop: '0.8rem',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Van fiókod?
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default StudentRegisterComp;