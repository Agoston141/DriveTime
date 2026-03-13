import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const StudentLogin = () => {
  const [showModal, setShowModal] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleModalOk = () => {
    setShowModal(false);
    navigate('/student-site');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/auth/loginUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Sikertelen tanulói belépés');
      }

      const receivedRole = data.user?.role || data.role;
      if (!receivedRole) {
        throw new Error('A szerver nem küldött szerepkört!');
      }

      if (receivedRole.toUpperCase() !== 'STUDENT') {
         throw new Error(`A fiók ${receivedRole} szerepkörhöz van társítva`);
      }

      localStorage.setItem('token', data.accessToken); 
      localStorage.setItem('role', receivedRole);
      localStorage.setItem('userName', data.user?.name || '');

      setShowModal(true);
    } catch (err: any) {
      setError(err.message);
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
          }}>Bejelentkezés a tanulói felületre</h1>
          <div className="underline"></div>
          <h2 style={{ color: "white" }}>Üdvözlünk a tanulói felületen!</h2>
        </div>

        <div className="forms">
          <form className='adminForm' onSubmit={handleSubmit}>
            <h1><i className="bi bi-person-circle"></i></h1>
            <h2>Tanuló Belépés</h2>
            <div className='loginError' style={{ color: '#ff4d4d', marginBottom: '0.5rem', fontWeight: 'bold' }}>{error}</div>
            <input
              type="email"
              name="email"
              placeholder='✉ E-mail címed'
              required
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder='🔒︎ Jelszó'
              required
              onChange={handleChange}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Folyamatban...' : 'Bejelentkezés'}
            </button>

            {/* --- REGISZTRÁCIÓ GOMB --- */}
            <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <p style={{ color: 'white', fontSize: '0.85rem', marginBottom: '0.8rem' }}>Nincs még fiókod?</p>
              <button 
                type="button" 
                onClick={() => navigate('/student-register')} 
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255,255,255,0.5)',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                REGISZTRÁCIÓ
              </button>
            </div>
          </form>
        </div>

        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 999
          }}>
            <div className="adminForm" style={{ gap: '1.5rem', width: '30rem', height: '20rem', textAlign: 'center' }}>
              <h1><i className="bi bi-exclamation-triangle-fill"></i></h1>
              <p style={{ color: 'white', fontSize: '1.1rem', lineHeight: '1.6' }}>
                Ha végzett tevékenységével, ne felejtsen el <strong>kijelentkezni</strong> a munkamenetből!
              </p>
              <div className='okButton'><button onClick={handleModalOk}>FOLYTATÁS</button></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentLogin;