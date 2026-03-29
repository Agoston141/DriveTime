import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const StudentResetComp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailValid, setEmailValid] = useState<null | boolean>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailValid(value.length > 0 ? emailRegex.test(value) : null);
    }
  };

  // ← IDE kerül, komponens szintjére
  const checkEmailExists = async (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;
    try {
      const response = await fetch(`http://localhost:3000/user/checkEmail/${email}`);
      const data = await response.json();
      if (!data.exists) {
        setEmailValid(false);
        setError('Ez az email cím nem található a rendszerünkben!');
      } else {
        setEmailValid(true);
        setError('');
      }
    } catch {
      // hálózati hiba
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: 'Gyenge', color: '#ff4d4d', width: '33%' };
    if (score <= 2) return { label: 'Átlagos', color: '#fca311', width: '66%' };
    return { label: 'Erős', color: '#4BB543', width: '100%' };
  };

  const strength = getPasswordStrength(formData.password);
  const passwordsMatch = confirmPassword.length > 0 && formData.password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && formData.password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailValid) {
      setError('Kérlek adj meg egy érvényes email címet!');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('A két jelszó nem egyezik meg!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/user/reset', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/student'), 3000);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Hiba történt a jelszó visszaállítása során');
      }
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
          }}>Jelszó visszaállítása</h1>
          <div className="underline"></div>
          <h2 style={{ color: "white" }}>Add meg az új jelszavadat!</h2>
        </div>

        <div className="forms">
          <form className='adminForm' onSubmit={handleSubmit} style={{ minHeight: 'auto', gap: '0.8rem', padding: '2rem' }}>
            <h1 style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <i className="bi bi-key-fill" style={{ color: '#fca311' }}></i>
            </h1>
            <h2>Új jelszó beállítása</h2>

            {error && <div className='loginError' style={{ color: '#ff4d4d', fontWeight: 'bold' }}>{error}</div>}
            {success && <div style={{ color: '#4BB543', fontWeight: 'bold' }}>Sikeres visszaállítás! Átirányítás...</div>}

            {/* EMAIL */}
            <div style={{ width: '100%', position: 'relative' }}>
              <input
                type="email"
                name="email"
                placeholder='✉ E-mail címed'
                required
                disabled={success}
                onChange={handleChange}
                onBlur={(e) => checkEmailExists(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderBottom: emailValid === null
                    ? '2px solid gray'
                    : emailValid
                    ? '2px solid #4BB543'
                    : '2px solid #ff4d4d'
                }}
              />
              {emailValid === true && (
                <p style={{ color: '#4BB543', fontSize: '0.8rem', marginTop: '4px', fontWeight: 'bold' }}>
                  ✓ Létező email cím
                </p>
              )}
              {emailValid === false && (
                <p style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '4px', fontWeight: 'bold' }}>
                  ✗ Ez az email cím nem található!
                </p>
              )}
            </div>

            {/* ÚJ JELSZÓ */}
            <input
              type="password"
              name="password"
              placeholder='🔒︎ Új jelszó'
              required
              disabled={success}
              onChange={handleChange}
              style={{ padding: '10px', width: '100%' }}
            />

            {/* JELSZÓ ERŐSSÉG */}
            {strength && (
              <div style={{ width: '100%' }}>
                <div style={{
                  width: '100%', height: '6px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '10px', overflow: 'hidden'
                }}>
                  <div style={{
                    width: strength.width,
                    height: '100%',
                    backgroundColor: strength.color,
                    borderRadius: '10px',
                    transition: 'all 0.3s ease'
                  }}></div>
                </div>
                <p style={{ color: strength.color, fontSize: '0.8rem', marginTop: '4px', fontWeight: 'bold' }}>
                  {strength.label}
                </p>
              </div>
            )}

            {/* JELSZÓ MEGERŐSÍTÉS */}
            <input
              type="password"
              name="confirmPassword"
              placeholder='🔒︎ Jelszó megerősítése'
              required
              disabled={success}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{
                padding: '10px',
                width: '100%',
                borderBottom: passwordsMismatch
                  ? '2px solid #ff4d4d'
                  : passwordsMatch
                  ? '2px solid #4BB543'
                  : '2px solid gray'
              }}
            />

            {passwordsMismatch && (
              <p style={{ color: '#ff4d4d', fontSize: '0.8rem', fontWeight: 'bold', width: '100%' }}>
                ✗ A jelszavak nem egyeznek!
              </p>
            )}
            {passwordsMatch && (
              <p style={{ color: '#4BB543', fontSize: '0.8rem', fontWeight: 'bold', width: '100%' }}>
                ✓ A jelszavak egyeznek!
              </p>
            )}

            <button
              type="submit"
              disabled={loading || success || passwordsMismatch || !passwordsMatch || emailValid !== true}
              style={{ marginTop: '1rem', width: '100%' }}
            >
              {loading ? 'Folyamatban...' : success ? 'SIKERES!' : 'JELSZÓ VISSZAÁLLÍTÁSA'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/student')}
              style={{
                marginTop: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Vissza a bejelentkezéshez
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default StudentResetComp;