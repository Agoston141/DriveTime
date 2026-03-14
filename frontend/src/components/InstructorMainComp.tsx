import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Main.css';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const TIMEOUT_SECONDS = 600;

interface InstructorData {
  id: number;
  name: string;
  email: string;
  car: string;
  status: string;
}

interface InstructorBooking {
  id: number;
  bookedDate: string;
  status: string;
  student: { id: number; name: string; email: string };
}

const InstructorMainComp = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null);
  const [editData, setEditData] = useState({ car: '', status: '' });
  const [bookings, setBookings] = useState<InstructorBooking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const token = localStorage.getItem('token');

  const getInstructorId = () => {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    navigate('/instructor');
  };

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

  useEffect(() => {
    const id = getInstructorId();
    if (!id) return;
    setProfileLoading(true);
    fetch(`http://localhost:3000/user/me/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setInstructorData(data);
        setEditData({ car: data.car ?? '', status: data.status ?? 'offline' });
        setProfileLoading(false);
      });
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings') {
      const id = getInstructorId();
      if (!id) return;
      setBookingsLoading(true);
      fetch(`http://localhost:3000/booking/instructorbookings/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setBookings(data);
          setBookingsLoading(false);
        });
    }
  }, [activeTab]);

  const handleSaveProfile = async () => {
    const id = getInstructorId();
    if (!id) return;
    await fetch(`http://localhost:3000/user/update/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ car: editData.car })
    });
    await fetch(`http://localhost:3000/user/updateStatus/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: editData.status })
    });
    setInstructorData(prev => prev ? { ...prev, car: editData.car, status: editData.status } : prev);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleBookingStatus = async (id: number, status: string) => {
    await fetch(`http://localhost:3000/booking/acceptBooking/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bookingStatus: status })
    });
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleDeleteBooking = async (id: number) => {
    if (!confirm('Biztosan törli ezt a foglalást?')) return;
    await fetch(`http://localhost:3000/booking/deletebooking/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setBookings(bookings.filter(b => b.id !== id));
  };

  const selectedDateBookings = bookings.filter(b => {
    const bookingDate = new Date(b.bookedDate);
    return (
      bookingDate.getFullYear() === selectedDate.getFullYear() &&
      bookingDate.getMonth() === selectedDate.getMonth() &&
      bookingDate.getDate() === selectedDate.getDate()
    );
  });

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
        position: 'relative', width: '100%', height: '300px',
        backgroundImage: `linear-gradient(rgba(20, 33, 61, 0.7), rgba(10, 15, 29, 1))`,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        paddingTop: '8rem'
      }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold' }}>
          Üdvözöljük, {instructorData?.name ?? ''}!
        </h1>
        <div style={{ width: '180px', height: '5px', backgroundColor: '#fca311', margin: '20px 0', borderRadius: '10px' }}></div>
        <p style={{ fontSize: '1.4rem', fontWeight: '300' }}>Oktatói felület</p>

        {/* TIMER + KIJELENTKEZÉS */}
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
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '2rem'}}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '1.2rem 3rem', fontSize: '1.3rem', fontWeight: 'bold',
            backgroundColor: activeTab === 'profile' ? '#fca311' : 'transparent',
            color: activeTab === 'profile' ? '#14213d' : 'white',
            border: '2px solid #fca311', borderRadius: '12px', cursor: 'pointer', transition: '0.3s'
          }}
        >
          <i className="bi bi-person-fill"></i> Saját adataim
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '1.2rem 3rem', fontSize: '1.3rem', fontWeight: 'bold',
            backgroundColor: activeTab === 'bookings' ? '#fca311' : 'transparent',
            color: activeTab === 'bookings' ? '#14213d' : 'white',
            border: '2px solid #fca311', borderRadius: '12px', cursor: 'pointer', transition: '0.3s'
          }}
        >
          <i className="bi bi-calendar3"></i> Foglalásaim
        </button>
      </div>

      <main style={{ padding: '0 2rem 4rem 2rem' }}>

        {/* SAJÁT ADATOK */}
        {activeTab === 'profile' && (
          <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto',paddingTop: '2rem'   }}>
            {profileLoading ? (
              <p style={{ textAlign: 'center', fontSize: '1.4rem' }}>Betöltés...</p>
            ) : (
              <div style={{
                backgroundColor: '#14213d', borderRadius: '20px', padding: '3rem',
                border: '1px solid rgba(252,163,17,0.2)',
                boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
                display: 'flex', flexDirection: 'column', gap: '1.5rem'
              }}>
                <h2 style={{ color: '#fca311', fontSize: '1.8rem', textAlign: 'center' }}>
                  <i className="bi bi-person-circle"></i> Adataim
                </h2>

                <div>
                  <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Név</label>
                  <div style={{
                    padding: '0.8rem 1rem', marginTop: '0.3rem',
                    backgroundColor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '1rem'
                  }}>
                    {instructorData?.name}
                  </div>
                </div>

                <div>
                  <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Email</label>
                  <div style={{
                    padding: '0.8rem 1rem', marginTop: '0.3rem',
                    backgroundColor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '1rem'
                  }}>
                    {instructorData?.email}
                  </div>
                </div>

                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Autó</label>
                  <input
                    type="text"
                    value={editData.car}
                    onChange={e => setEditData({ ...editData, car: e.target.value })}
                    style={{
                      width: '100%', padding: '0.8rem 1rem', marginTop: '0.3rem',
                      backgroundColor: 'rgba(255,255,255,0.05)', color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      fontSize: '1rem', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Státusz</label>
                  <select
                    value={editData.status}
                    onChange={e => setEditData({ ...editData, status: e.target.value })}
                    style={{
                      width: '100%', padding: '0.8rem 1rem', marginTop: '0.3rem',
                      backgroundColor: '#0a0f1d',
                      color: editData.status === 'online' ? '#4BB543' : '#ff4d4d',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      fontSize: '1rem', fontWeight: 'bold'
                    }}
                  >
                    <option value="online">Online — Elérhető</option>
                    <option value="offline">Offline — Szünetel</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveProfile}
                  style={{
                    padding: '1rem', backgroundColor: '#fca311', color: '#14213d',
                    border: 'none', borderRadius: '10px', fontWeight: 'bold',
                    fontSize: '1.1rem', cursor: 'pointer', transition: '0.2s',
                    marginTop: '0.5rem'
                  }}
                >
                  <i className="bi bi-floppy"></i> Mentés
                </button>

                {saveSuccess && (
                  <div style={{
                    backgroundColor: 'rgba(75,181,67,0.15)', border: '1px solid #4BB543',
                    borderRadius: '10px', padding: '0.8rem', textAlign: 'center',
                    color: '#4BB543', fontWeight: 'bold'
                  }}>
                    <i className="bi bi-check-lg"></i> Adatok sikeresen mentve!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FOGLALÁSOK */}
        {activeTab === 'bookings' && (
          <div className="fade-in" style={{paddingTop: '2rem'}}>
            {bookingsLoading ? (
              <p style={{ textAlign: 'center', fontSize: '1.4rem' }}>Betöltés...</p>
            ) : (
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

               
               {/* NAPTÁR */}
<div style={{ flex: '1', minWidth: '320px' }}>
  <h3 style={{ color: '#fca311', marginBottom: '1rem' }}>Válassz napot:</h3>
  <Calendar
    onChange={(date) => setSelectedDate(date as Date)}
    value={selectedDate}
    tileContent={({ date }) => {
      const hasBooking = bookings.some(b => {
        const bookingDate = new Date(b.bookedDate);
        return (
          bookingDate.getFullYear() === date.getFullYear() &&
          bookingDate.getMonth() === date.getMonth() &&
          bookingDate.getDate() === date.getDate()
        );
      });
      return hasBooking ? (
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          backgroundColor: '#fca311', margin: '2px auto 0'
        }}></div>
      ) : null;
    }}
  />
</div>

                {/* LISTA */}
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
      </main>
    </div>
  );
};

export default InstructorMainComp;