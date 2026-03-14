import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Main.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  role: string;
  car?: string;
}

interface Booking {
  id: number;
  bookedDate: string;
  status: string;
  student: { id: number; name: string; email: string };
  instructor: { id: number; name: string };
}

const TIMEOUT_SECONDS = 600; 

const AdminMainComp = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<'home' | 'users' | 'bookings'>('home');
  const [activeTab, setActiveTab] = useState<'students' | 'instructors' | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInstructor, setNewInstructor] = useState({
    name: '', email: '', password: '', car: '', status: 'online', role: 'INSTRUCTOR'
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    navigate('/admin');
  };

  // Időmérő
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Aktivitás esetén reset
  useEffect(() => {
    const resetTimer = () => setTimeLeft(TIMEOUT_SECONDS);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const fetchStudents = async () => {
    setLoading(true);
    const response = await fetch('http://localhost:3000/user/getstudents', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setUsers(data);
    setLoading(false);
  };

  const fetchInstructors = async () => {
    setLoading(true);
    const response = await fetch('http://localhost:3000/user/getinstructors', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setUsers(data);
    setLoading(false);
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    const response = await fetch('http://localhost:3000/booking/getbookings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setBookings(data);
    setBookingsLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'students') fetchStudents();
    if (activeTab === 'instructors') fetchInstructors();
  }, [activeTab]);

  useEffect(() => {
    if (activeMenu === 'bookings') fetchBookings();
  }, [activeMenu]);

  const handleDelete = async (id: number) => {
    if (!confirm('Biztosan törli ezt a felhasználót?')) return;
    await fetch(`http://localhost:3000/user/DeleteUser/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setUsers(users.filter(u => u.id !== id));
  };

  const handleUpdateRole = async (id: number, role: string) => {
    await fetch(`http://localhost:3000/user/updateRole/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    setUsers(users.map(u => u.id === id ? { ...u, role } : u));
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    await fetch(`http://localhost:3000/user/updateStatus/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setUsers(users.map(u => u.id === id ? { ...u, status } : u));
  };

  const handleAddInstructor = async () => {
    if (!newInstructor.name || !newInstructor.email || !newInstructor.password || !newInstructor.car) {
      alert('Kérlek töltsd ki az összes mezőt!');
      return;
    }
    const response = await fetch('http://localhost:3000/user/addInstructor', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(newInstructor)
    });
    if (response.ok) {
      alert('Oktató sikeresen hozzáadva!');
      setShowAddModal(false);
      setNewInstructor({ name: '', email: '', password: '', car: '', status: 'online', role: 'INSTRUCTOR' });
      fetchInstructors();
    } else {
      const err = await response.json();
      alert(`Hiba: ${err.message}`);
    }
  };

  const handleDeleteBooking = async (id: number) => {
    if (!confirm('Biztosan törli ezt a foglalást?')) return;
    await fetch(`http://localhost:3000/booking/deletebooking/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setBookings(bookings.filter(b => b.id !== id));
  };

  const handleBookingStatus = async (id: number, status: string) => {
    await fetch(`http://localhost:3000/booking/acceptBooking/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingStatus: status })
    });
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  };

  const selectedDateBookings = bookings.filter(b => {
    const bookingDate = new Date(b.bookedDate);
    return (
      bookingDate.getFullYear() === selectedDate.getFullYear() &&
      bookingDate.getMonth() === selectedDate.getMonth() &&
      bookingDate.getDate() === selectedDate.getDate()
    );
  });

  const bookedDates = bookings.map(b => new Date(b.bookedDate));

  const statusColor = (status: string) => {
    if (status === 'ACCEPTED') return '#4BB543';
    if (status === 'REJECTED') return '#ff4d4d';
    return '#fca311';
  };

  const statusLabel = (status: string) => {
    if (status === 'ACCEPTED') return 'Elfogadva';
    if (status === 'REJECTED') return 'Elutasítva';
    return 'Függőben';
  };

  return (
    <div style={{ backgroundColor: '#0a0f1d', minHeight: '100vh', color: 'white' }}>

      {/* HERO */}
      <div style={{
        width: '100%', height: '300px',
        backgroundImage: `linear-gradient(rgba(20, 33, 61, 0.7), rgba(10, 15, 29, 1))`,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        paddingTop: '8rem', position: 'relative'
      }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold' }}>Admin felület</h1>
        <div style={{ width: '180px', height: '5px', backgroundColor: '#fca311', margin: '20px 0', borderRadius: '10px' }}></div>
        <p style={{ fontSize: '1.4rem', fontWeight: '300' }}>Felhasználók és oktatók kezelése</p>

        {/* KIJELENTKEZÉS + IDŐMÉRŐ */}
        <div style={{
          position: 'absolute', top: '9rem', right: '2rem',
          display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
          <div style={{
            backgroundColor: timeLeft <= 60 ? 'rgba(255,77,77,0.15)' : 'rgba(252,163,17,0.1)',
            border: `1px solid ${timeLeft <= 60 ? '#ff4d4d' : '#fca311'}`,
            borderRadius: '10px', padding: '8px 16px',
            color: timeLeft <= 60 ? '#ff4d4d' : '#fca311',
            fontWeight: 'bold', fontSize: '1.1rem'
          }}>
            <i className="bi bi-clock"></i> {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'rgba(255,77,77,0.15)', color: '#ff4d4d',
              border: '1px solid #ff4d4d', borderRadius: '10px',
              padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold',
              fontSize: '1.1rem', transition: '0.2s'
            }}
          >
            <i className="bi bi-box-arrow-right"></i> Kijelentkezés
          </button>
        </div>
      </div>

      {/* MENÜ */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '2rem' }}>
        <button
          onClick={() => { setActiveMenu('users'); setActiveTab(null); }}
          style={{
            padding: '1.2rem 3rem', fontSize: '1.3rem', fontWeight: 'bold',
            backgroundColor: activeMenu === 'users' ? '#fca311' : 'transparent',
            color: activeMenu === 'users' ? '#14213d' : 'white',
            border: '2px solid #fca311', borderRadius: '12px', cursor: 'pointer', transition: '0.3s'
          }}
        >
          <i className="bi bi-people-fill"></i> Felhasználók kezelése
        </button>
        <button
          onClick={() => { setActiveMenu('bookings'); setActiveTab(null); }}
          style={{
            padding: '1.2rem 3rem', fontSize: '1.3rem', fontWeight: 'bold',
            backgroundColor: activeMenu === 'bookings' ? '#fca311' : 'transparent',
            color: activeMenu === 'bookings' ? '#14213d' : 'white',
            border: '2px solid #fca311', borderRadius: '12px', cursor: 'pointer', transition: '0.3s'
          }}
        >
          <i className="bi bi-calendar3"></i> Időpontok
        </button>
      </div>

      {/* FELHASZNÁLÓK KEZELÉSE */}
      {activeMenu === 'users' && (
        <div style={{ padding: '0 2rem 4rem 2rem' }}>
          {activeTab === null && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '2rem' }}>
              <div
                onClick={() => setActiveTab('students')}
                style={{
                  width: '280px', padding: '3rem 2rem', backgroundColor: '#14213d',
                  borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer', textAlign: 'center', transition: '0.3s'
                }}
                onMouseEnter={e => (e.currentTarget.style.border = '2px solid #fca311')}
                onMouseLeave={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
              >
                <i className="bi bi-person-fill" style={{ fontSize: '4rem', color: '#fca311' }}></i>
                <h2 style={{ marginTop: '1rem', fontSize: '1.8rem' }}>Tanulók</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Tanulók kezelése</p>
              </div>
              <div
                onClick={() => setActiveTab('instructors')}
                style={{
                  width: '280px', padding: '3rem 2rem', backgroundColor: '#14213d',
                  borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer', textAlign: 'center', transition: '0.3s'
                }}
                onMouseEnter={e => (e.currentTarget.style.border = '2px solid #fca311')}
                onMouseLeave={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
              >
                <i className="bi bi-person-workspace" style={{ fontSize: '4rem', color: '#fca311' }}></i>
                <h2 style={{ marginTop: '1rem', fontSize: '1.8rem' }}>Oktatók</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Oktatók kezelése</p>
              </div>
            </div>
          )}

          {activeTab !== null && (
            <div style={{ marginBottom: '2rem' }}>
              <button
                onClick={() => setActiveTab(null)}
                style={{
                  background: 'rgba(252, 163, 17, 0.1)', border: '1px solid #fca311',
                  color: '#fca311', padding: '10px 20px', cursor: 'pointer', borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <i className="bi bi-arrow-left"></i> Vissza
              </button>
            </div>
          )}

          {activeTab !== null && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '2rem', color: '#fca311' }}>
                  <i className={activeTab === 'students' ? 'bi bi-person-fill' : 'bi bi-person-workspace'}></i>
                  {activeTab === 'students' ? ' Tanulók' : ' Oktatók'}
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {activeTab === 'instructors' && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      style={{
                        backgroundColor: 'rgba(252,163,17,0.15)', color: '#fca311',
                        border: '1px solid #fca311', borderRadius: '10px',
                        padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'
                      }}
                    >
                      <i className="bi bi-person-plus-fill"></i> Oktató hozzáadása
                    </button>
                  )}
                  <button
                    onClick={() => activeTab === 'students' ? fetchStudents() : fetchInstructors()}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)', color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px',
                      padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'
                    }}
                  >
                    <i className="bi bi-arrow-clockwise"></i> Változtatások mentése
                  </button>
                </div>
              </div>

              {loading ? (
                <p style={{ textAlign: 'center', fontSize: '1.4rem' }}>Betöltés...</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="adminTable" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#14213d', borderBottom: '2px solid #fca311' }}>
                        <th>ID</th>
                        <th>Név</th>
                        <th>Email</th>
                        {activeTab === 'instructors' && <th>Autó</th>}
                        <th>Státusz</th>
                        <th>Role</th>
                        <th>Műveletek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(252,163,17,0.05)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td>{user.id}</td>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          {activeTab === 'instructors' && <td>{user.car ?? '-'}</td>}
                          <td>
                            <select
                              value={user.status}
                              onChange={e => handleUpdateStatus(user.id, e.target.value)}
                              style={{
                                backgroundColor: '#0a0f1d',
                                color: user.status === 'online' ? '#4BB543' : '#ff4d4d',
                                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                                padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold'
                              }}
                            >
                              <option value="online">Online</option>
                              <option value="offline">Offline</option>
                            </select>
                          </td>
                          <td>
                            <select
                              value={user.role}
                              onChange={e => handleUpdateRole(user.id, e.target.value)}
                              style={{
                                backgroundColor: '#0a0f1d', color: '#fca311',
                                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                                padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold'
                              }}
                            >
                              <option value="STUDENT">STUDENT</option>
                              <option value="INSTRUCTOR">INSTRUCTOR</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td>
                            <button
                              onClick={() => handleDelete(user.id)}
                              style={{
                                backgroundColor: 'rgba(255,77,77,0.15)', color: '#ff4d4d',
                                border: '1px solid #ff4d4d', borderRadius: '8px',
                                padding: '6px 14px', cursor: 'pointer', fontWeight: 'bold'
                              }}
                            >
                              <i className="bi bi-trash"></i> Törlés
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* IDŐPONTOK */}
      {activeMenu === 'bookings' && (
        <div style={{ padding: '0 2rem 4rem 2rem' }}>
          <h2 style={{ fontSize: '2rem', color: '#fca311', marginBottom: '2rem' }}>
            <i className="bi bi-calendar3"></i> Foglalások kezelése
          </h2>

          {bookingsLoading ? (
            <p style={{ textAlign: 'center', fontSize: '1.4rem' }}>Betöltés...</p>
          ) : (
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '320px' }}>
                <h3 style={{ color: '#fca311', marginBottom: '1rem' }}>Válassz napot:</h3>
                <Calendar
                  onChange={(date) => setSelectedDate(date as Date)}
                  value={selectedDate}
                  tileContent={({ date }) => {
                    const hasBooking = bookedDates.some(b =>
                      b.getFullYear() === date.getFullYear() &&
                      b.getMonth() === date.getMonth() &&
                      b.getDate() === date.getDate()
                    );
                    return hasBooking ? (
                      <div style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        backgroundColor: '#fca311', margin: '2px auto 0'
                      }}></div>
                    ) : null;
                  }}
                />
              </div>

              <div style={{ flex: '2', minWidth: '320px' }}>
                <h3 style={{ color: '#fca311', marginBottom: '1rem' }}>
                  {selectedDate.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })} — foglalások:
                </h3>

                {selectedDateBookings.length === 0 ? (
                  <div style={{
                    backgroundColor: '#14213d', borderRadius: '15px',
                    padding: '2rem', textAlign: 'center',
                    color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem'
                  }}>
                    <i className="bi bi-calendar-x" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}></i>
                    Ezen a napon nincs foglalás
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedDateBookings.map(booking => (
                      <div key={booking.id} style={{
                        backgroundColor: '#14213d', borderRadius: '15px', padding: '1.5rem',
                        border: `1px solid ${statusColor(booking.status)}33`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        flexWrap: 'wrap', gap: '1rem'
                      }}>
                        <div>
                          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fca311' }}>
                            {new Date(booking.bookedDate).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p style={{ marginTop: '0.3rem' }}>
                            <i className="bi bi-person-fill"></i> {booking.student.name}
                          </p>
                          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                            {booking.student.email}
                          </p>
                          <p style={{ marginTop: '0.3rem' }}>
                            <i className="bi bi-person-workspace"></i> {booking.instructor.name}
                          </p>
                          <span style={{
                            display: 'inline-block', marginTop: '0.5rem',
                            padding: '3px 12px', borderRadius: '20px', fontSize: '0.85rem',
                            fontWeight: 'bold', backgroundColor: `${statusColor(booking.status)}22`,
                            color: statusColor(booking.status),
                            border: `1px solid ${statusColor(booking.status)}`
                          }}>
                            {statusLabel(booking.status)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleBookingStatus(booking.id, 'ACCEPTED')}
                            disabled={booking.status === 'ACCEPTED'}
                            style={{
                              backgroundColor: 'rgba(75,181,67,0.2)', color: '#4BB543',
                              border: '1px solid #4BB543', borderRadius: '8px',
                              padding: '6px 14px', cursor: booking.status === 'ACCEPTED' ? 'not-allowed' : 'pointer',
                              fontWeight: 'bold', opacity: booking.status === 'ACCEPTED' ? 0.5 : 1
                            }}
                          >
                            <i className="bi bi-check-lg"></i> Elfogad
                          </button>
                          <button
                            onClick={() => handleBookingStatus(booking.id, 'REJECTED')}
                            disabled={booking.status === 'REJECTED'}
                            style={{
                              backgroundColor: 'rgba(255,77,77,0.2)', color: '#ff4d4d',
                              border: '1px solid #ff4d4d', borderRadius: '8px',
                              padding: '6px 14px', cursor: booking.status === 'REJECTED' ? 'not-allowed' : 'pointer',
                              fontWeight: 'bold', opacity: booking.status === 'REJECTED' ? 0.5 : 1
                            }}
                          >
                            <i className="bi bi-x-lg"></i> Elutasít
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            style={{
                              backgroundColor: 'rgba(255,77,77,0.15)', color: '#ff4d4d',
                              border: '1px solid #ff4d4d', borderRadius: '8px',
                              padding: '6px 14px', cursor: 'pointer', fontWeight: 'bold'
                            }}
                          >
                            <i className="bi bi-trash"></i> Törlés
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 999
        }}>
          <div style={{
            backgroundColor: '#14213d', borderRadius: '20px',
            padding: '3rem', width: '40rem',
            border: '1px solid rgba(252,163,17,0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', gap: '1.2rem'
          }}>
            <h2 style={{ color: '#fca311', fontSize: '1.8rem', textAlign: 'center' }}>
              <i className="bi bi-person-plus-fill"></i> Oktató hozzáadása
            </h2>

            {[
              { label: 'Név', key: 'name', type: 'text', placeholder: 'Pl. Kovács János' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'kovacsj@drivetime.hu' },
              { label: 'Jelszó', key: 'password', type: 'password', placeholder: '••••••••' },
              { label: 'Autó', key: 'car', type: 'text', placeholder: 'Pl. Toyota Corolla' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={newInstructor[field.key as keyof typeof newInstructor]}
                  onChange={e => setNewInstructor({ ...newInstructor, [field.key]: e.target.value })}
                  style={{
                    width: '100%', padding: '0.8rem 1rem', marginTop: '0.3rem',
                    backgroundColor: 'rgba(255,255,255,0.05)', color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                    fontSize: '1rem', outline: 'none'
                  }}
                />
              </div>
            ))}

            <div>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Státusz</label>
              <select
                value={newInstructor.status}
                onChange={e => setNewInstructor({ ...newInstructor, status: e.target.value })}
                style={{
                  width: '100%', padding: '0.8rem 1rem', marginTop: '0.3rem',
                  backgroundColor: '#0a0f1d', color: '#fca311',
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={handleAddInstructor}
                style={{
                  flex: 1, padding: '1rem', backgroundColor: '#fca311', color: '#14213d',
                  border: 'none', borderRadius: '10px', fontWeight: 'bold',
                  fontSize: '1.1rem', cursor: 'pointer'
                }}
              >
                <i className="bi bi-check-lg"></i> Hozzáadás
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1, padding: '1rem', backgroundColor: 'transparent', color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px',
                  fontSize: '1.1rem', cursor: 'pointer'
                }}
              >
                <i className="bi bi-x-lg"></i> Mégse
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminMainComp;