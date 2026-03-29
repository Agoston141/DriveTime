import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const StudentLogin = () => {
  const [showModal, setShowModal] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleModalOk = () => {
    setShowModal(false);
    navigate('/student-site');
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotStatus('idle');
    try {
      const response = await fetch(`http://localhost:3000/user/sendReset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (response.ok) {
        setForgotStatus('success');
      } else {
        setForgotStatus('error');
      }
    } catch {
      setForgotStatus('error');
    } finally {
      setForgotLoading(false);
    }
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
          <h2 style={{ color: "white" }}>Üdvözöljük a tanulói felületen!</h2>
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

            {/* ELFELEJTETT JELSZÓ */}
            <button
              type="button"
              onClick={() => { setShowForgotModal(true); setForgotStatus('idle'); setForgotEmail(''); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                marginTop: '-1.5rem',
                marginBottom: '-1.5rem'
              }}
            >
              Elfelejtett jelszó?
            </button>

            {/* REGISZTRÁCIÓ */}
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

        {/* BEJELENTKEZÉS SIKERES MODAL */}
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

        {/* ELFELEJTETT JELSZÓ MODAL */}
        {showForgotModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 999
          }}>
            <div style={{
              backgroundColor: '#14213d',
              borderRadius: '20px',
              padding: '3rem',
              width: '35rem',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem'
            }}>
              <h2 style={{ color: 'white', fontSize: '1.6rem' }}>
                <i className="bi bi-key-fill" style={{ color: '#fca311', marginRight: '0.5rem' }}></i>
                Elfelejtett jelszó
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                Azonosítsa magát ahhoz hogy visszállítsuk a jelszavát!
              </p>

              <input
                type="email"
                placeholder="✉ E-mail címed"
                value={forgotEmail}
                onChange={e => { setForgotEmail(e.target.value); setForgotStatus('idle'); }}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: `1px solid ${forgotStatus === 'success' ? '#4BB543' : forgotStatus === 'error' ? '#ff4d4d' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />

              {/* STÁTUSZ ÜZENET */}
              {forgotStatus === 'success' && (
                <div style={{
                  backgroundColor: 'rgba(75,181,67,0.15)',
                  border: '1px solid #4BB543',
                  borderRadius: '10px',
                  padding: '0.8rem',
                  color: '#4BB543',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  <i className="bi bi-check-circle-fill"></i> Sikeres azonosítás! Elküldük a megadott email címre a szükséges teendőket.
                </div>
              )}
              {forgotStatus === 'error' && (
                <div style={{
                  backgroundColor: 'rgba(255,77,77,0.15)',
                  border: '1px solid #ff4d4d',
                  borderRadius: '10px',
                  padding: '0.8rem',
                  color: '#ff4d4d',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  <i className="bi bi-x-circle-fill"></i> Ez az email cím nem létezik
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  onClick={handleForgotPassword}
                  disabled={forgotLoading || forgotStatus === 'success'}
                  style={{
                    flex: 1,
                    padding: '0.9rem',
                    backgroundColor: forgotStatus === 'success' ? 'rgba(75,181,67,0.3)' : '#fca311',
                    color: '#14213d',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: forgotLoading || forgotStatus === 'success' ? 'not-allowed' : 'pointer',
                    opacity: forgotLoading ? 0.7 : 1
                  }}
                >
                  {forgotLoading ? 'Küldés...' : forgotStatus === 'success' ? '✓ Elküldve' : 'Küldés'}
                </button>
                <button
                  onClick={() => { setShowForgotModal(false); setForgotStatus('idle'); setForgotEmail(''); }}
                  style={{
                    flex: 1,
                    padding: '0.9rem',
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Mégse
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentLogin;