import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const InstructorLogin = () => {
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
    navigate('/instructor-site');
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
      
      console.log("Szerver válasza:", /* data */);

      if (!response.ok) {
        throw new Error(data.message || 'Hiba az oktatói belépés során');
      }

      //Szerver (enum) oldalrol erkezo role ellenorzes
      const receivedRole = data.user?.role || data.role;
      if (!receivedRole) {
        throw new Error('A szerver nem küldött szerepkört!');
      }

      // role-logikai (enum) ellenorzes
      if (receivedRole.toUpperCase() !== 'INSTRUCTOR') {
        throw new Error(`A fiók ${receivedRole} szerepkörhöz van társítva`);
      }

      localStorage.setItem('token', data.accessToken); 
      localStorage.setItem('role', receivedRole);
      localStorage.setItem('userName', data.user?.name || '');

      setShowModal(true); 
      
    } catch (err: any) {
      console.error("Login hiba:", err.message);
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
          }}>Bejelentkezés az oktatói felületre</h1>
          <div className="underline"></div>
          <h2 style={{ color: "white" }}>Üdvözlünk az oktatói felületen!</h2>
         {/*  <br />
          <h3 style={{ fontStyle: 'italic', color: "white" }}>Ön tanulók és órabeosztás kezelésére jogosult.</h3> */}
        </div>

        <div className="forms">
          <form className='adminForm' onSubmit={handleSubmit}>
          <h1><i className="bi bi-pencil"></i></h1>
            <h2>Oktatói Belépés</h2>
            <div className='loginError' style={{ color: '#ff4d4d', marginBottom: '0.5rem', fontWeight: 'bold' }}>{error}</div>
            <input
              type="email"
              name="email"
              placeholder='✉ Oktatói e-mail'
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
            <div className="adminForm" style={{ gap: '1.5rem', width: '30rem', height:'20rem', textAlign: 'center' }}>
              
              <h1><i className="bi bi-exclamation-triangle-fill "></i></h1>
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

export default InstructorLogin;