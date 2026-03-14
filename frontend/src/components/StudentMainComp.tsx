import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInstructors, type Instructor } from './instructor';
import CalendarComp from './CalendarComp';
import './Main.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export const BookingStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
} as const;

const TIMEOUT_SECONDS = 600;

interface MyBooking {
  id: number;
  bookedDate: string;
  status: string;
  instructor: { id: number; name: string; car: string };
}

const StudentMainComp = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'booking' | 'mybookings'>('booking');
  const [myBookings, setMyBookings] = useState<MyBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const token = localStorage.getItem('token');

  const getStudentId = () => {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    navigate('/student');
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
    const storedName = localStorage.getItem('userName') || 'Tanuló';
    const nameParts = storedName.trim().split(' ');
    const firstName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
    setUserName(firstName);
    getInstructors().then(data => setInstructors(data));
  }, []);

  useEffect(() => {
    if (activeTab === 'mybookings') {
      const studentId = getStudentId();
      if (!studentId) return;
      setBookingsLoading(true);
      fetch(`http://localhost:3000/booking/mybookings/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setMyBookings(data);
          setBookingsLoading(false);
        });
    }
  }, [activeTab]);

  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    const hh = hour < 10 ? `0${hour}` : `${hour}`;
    timeSlots.push(`${hh}:00`);
    timeSlots.push(`${hh}:30`);
  }

  const handleInstructorClick = (id: number) => {
    const clickedInst = instructors.find((i: Instructor) => i.id === id);
    if (clickedInst?.status === 'offline') {
      setError(`A(z) kiválasztott oktató, ${clickedInst.name} jelenleg nem fogad diákot. Kérlek válassz másik oktatót!`);
      setSelectedInstructorId(null);
    } else {
      setError(null);
      setSelectedInstructorId(id);
    }
  };

  const currentInstructor = instructors.find((i: Instructor) => i.id === selectedInstructorId);

  const handleFinalizeBooking = async () => {
    if (!selectedInstructorId || !selectedTime) return;

    const studentId = getStudentId();
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const finalDate = new Date(selectedDate);
    finalDate.setHours(hours, minutes, 0, 0);

    const payload = {
      bookedDate: finalDate.toISOString(),
      instructorId: selectedInstructorId,
      studentId: studentId,
      status: BookingStatus.PENDING
    };

    try {
      const response = await fetch('http://localhost:3000/booking/makeBooking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowSuccessModal(true);
        setStep(1);
        setSelectedTime(null);
        setSelectedInstructorId(null);
        setSelectedDate(new Date());
      } else {
        const errorText = await response.text();
        alert(`Hiba: ${errorText || 'A szerver hibát küldött'}`);
      }
    } catch (err) {
      console.error("Hálózati hiba:", err);
      alert("Nem sikerült elérni a backendet!");
    }
  };

  const handleDeleteBooking = async (id: number) => {
    if (!confirm('Biztosan törli ezt a foglalást?')) return;
    await fetch(`http://localhost:3000/booking/deletebooking/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setMyBookings(myBookings.filter(b => b.id !== id));
  };

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
    <div className="student-page" style={{ backgroundColor: '#0a0f1d', minHeight: '100vh', color: 'white' }}>

      {/* HERO */}
      <div className="hero-banner" style={{
        position: 'relative', width: '100%', height: '400px',
        backgroundImage: `linear-gradient(rgba(20, 33, 61, 0.7), rgba(10, 15, 29, 1)), url('../img/mercedes_interior.jpg')`,
        backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        paddingTop: '8rem'
      }}>
        <h1 style={{ fontSize: '4.5rem', margin: 0, fontWeight: 'bold' }}>
          {activeTab === 'booking'
            ? (step === 1 ? `Üdvözlünk, ${userName}!` : 'Időpontválasztás')
            : 'Foglalásaim'}
        </h1>
        <div style={{ width: '180px', height: '5px', backgroundColor: '#fca311', margin: '25px 0', borderRadius: '10px' }}></div>
        <p style={{ fontSize: '1.6rem', fontWeight: '300' }}>
          {activeTab === 'booking'
            ? (step === 1 ? 'Válassz oktatót a vezetéshez!' : `Kiválasztott oktató: ${currentInstructor?.name}`)
            : 'Eddigi és közelgő foglalásaid'}
        </p>

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

        {activeTab === 'booking' && step === 2 && (
          <button onClick={() => { setStep(1); setSelectedTime(null); }} style={{
            background: 'rgba(252, 163, 17, 0.1)', border: '1px solid #fca311', color: '#fca311',
            padding: '10px 20px', cursor: 'pointer', marginTop: '20px', borderRadius: '8px'
          }}>
            <i className="bi bi-arrow-left"></i> Vissza az oktatókhoz
          </button>
        )}
      </div>

      {/* MENÜ GOMBOK */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '2rem' }}>
        <button
          onClick={() => { setActiveTab('booking'); setStep(1); }}
          style={{
            padding: '1.2rem 3rem', fontSize: '1.3rem', fontWeight: 'bold',
            backgroundColor: activeTab === 'booking' ? '#fca311' : 'transparent',
            color: activeTab === 'booking' ? '#14213d' : 'white',
            border: '2px solid #fca311', borderRadius: '12px', cursor: 'pointer', transition: '0.3s'
          }}
        >
          <i className="bi bi-calendar-plus"></i> Időpont-foglalás
        </button>
        <button
          onClick={() => setActiveTab('mybookings')}
          style={{
            padding: '1.2rem 3rem', fontSize: '1.3rem', fontWeight: 'bold',
            backgroundColor: activeTab === 'mybookings' ? '#fca311' : 'transparent',
            color: activeTab === 'mybookings' ? '#14213d' : 'white',
            border: '2px solid #fca311', borderRadius: '12px', cursor: 'pointer', transition: '0.3s'
          }}
        >
          <i className="bi bi-calendar-check"></i> Foglalásaim
        </button>
      </div>

      <main style={{ padding: '0 2rem 4rem 2rem' }}>

        {/* IDŐPONT FOGLALÁS */}
        {activeTab === 'booking' && (
          <>
            {step === 1 && (
              <div className="fade-in">
                {error && (
                  <div style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <i className="bi bi-exclamation-triangle-fill"></i> {error}
                  </div>
                )}

                <div className="instructorList" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', paddingTop: '2rem'}}>
                  {instructors.map((inst: Instructor) => (
                    <div
                      key={inst.id}
                      className="instructorCard"
                      onClick={() => handleInstructorClick(inst.id)}
                      style={{
                        width: '300px', padding: '2rem', backgroundColor: '#14213d', borderRadius: '20px',
                        border: selectedInstructorId === inst.id ? '4px solid #fca311' : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer', position: 'relative', transition: '0.3s',
                        opacity: inst.status === 'offline' ? 0.6 : 1
                      }}
                    >
                      {selectedInstructorId === inst.id && (
                        <div style={{
                          position: 'absolute', top: '-12px', right: '-12px', backgroundColor: '#fca311',
                          color: '#14213d', width: '40px', height: '40px', borderRadius: '50%',
                          display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                        }}>
                          <i className="bi bi-check-lg"></i>
                        </div>
                      )}
                      <h3 style={{ color: '#fca311', fontSize: '1.8rem' }}>{inst.name}</h3>
                      <p><strong>Autó:</strong> {inst.car}</p>
                      <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <div style={{
                          width: '12px', height: '12px', borderRadius: '50%',
                          backgroundColor: inst.status === 'online' ? '#4BB543' : '#ff4d4d',
                          boxShadow: inst.status === 'online' ? '0 0 10px #4BB543' : '0 0 10px #ff4d4d'
                        }}></div>
                        <span style={{ color: inst.status === 'online' ? '#4BB543' : '#ff4d4d', fontWeight: 'bold' }}>
                          {inst.status === 'online' ? 'Elérhető' : 'Szünetel'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedInstructorId && (
                  <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <button className="appointment" onClick={() => setStep(2)} style={{ padding: '1.2rem 4rem', fontSize: '1.4rem' }}>
                      Folytatás a naptárhoz <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ backgroundColor: '#14213d', padding: '2.5rem', borderRadius: '25px', boxShadow: '0 15px 40px rgba(0,0,0,0.5)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem' }}>
                    <div style={{ flex: '1.2', minWidth: '320px' }}>
                      <h3 style={{ color: '#fca311', marginBottom: '1.5rem' }}><i className="bi bi-calendar3"></i> 1. Nap kiválasztása</h3>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '15px' }}>
                        <CalendarComp
                          onChange={(date: Date) => {
                            setSelectedDate(date);
                            setSelectedTime(null);
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ flex: '1', minWidth: '280px' }}>
                      <h3 style={{ color: '#fca311', marginBottom: '1.5rem' }}><i className="bi bi-clock"></i> 2. Idősávok (30 perc)</h3>
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                        gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px'
                      }} className="custom-scroll">
                        {timeSlots.map((time) => {
                          const now = new Date();
                          const [hours, minutes] = time.split(':').map(Number);
                          const slotTime = new Date(selectedDate);
                          slotTime.setHours(hours, minutes, 0, 0);
                          const isPast = slotTime < now;
                          return (
                            <button
                              key={time}
                              disabled={isPast}
                              onClick={() => setSelectedTime(time)}
                              style={{
                                padding: '12px 0', borderRadius: '10px',
                                border: selectedTime === time ? '2px solid #fca311' : '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: isPast ? 'rgba(255,255,255,0.05)' : (selectedTime === time ? '#fca311' : 'transparent'),
                                color: isPast ? '#555' : (selectedTime === time ? '#14213d' : 'white'),
                                fontWeight: 'bold', cursor: isPast ? 'not-allowed' : 'pointer',
                                opacity: isPast ? 0.4 : 1, transition: '0.2s'
                              }}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {selectedTime && (
                    <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem' }}>
                      <p style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>
                        Kiválasztott időpont: <strong style={{ color: '#fca311' }}>{selectedDate.toLocaleDateString()} {selectedTime}</strong>
                      </p>
                      <button className="appointment" onClick={handleFinalizeBooking} style={{ padding: '1.3rem 6rem', fontSize: '1.5rem' }}>
                        Foglalás véglegesítése
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* FOGLALÁSAIM */}
        {activeTab === 'mybookings' && (
          <div className="fade-in" style={{paddingTop: '2rem'}}>
            {bookingsLoading ? (
              <p style={{ textAlign: 'center', fontSize: '1.4rem',  }}>Betöltés...</p>
            ) : myBookings.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '4rem',
                backgroundColor: '#14213d', borderRadius: '20px',
                maxWidth: '500px', margin: '0 auto', 
              }}>
                <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '1rem' , }}></i>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.2rem'  }}>Még nincs foglalásod</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto'}}>
                {myBookings.map(booking => (
                  <div key={booking.id} style={{
                    backgroundColor: '#14213d', borderRadius: '15px', padding: '1.5rem',
                    border: `1px solid ${statusColor(booking.status)}33`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: '1rem'
                  }}>
                    <div>
                      <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fca311' }}>
                        <i className="bi bi-calendar3"></i> {new Date(booking.bookedDate).toLocaleDateString('hu-HU', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                        {' '}
                        {new Date(booking.bookedDate).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p style={{ marginTop: '0.5rem' }}>
                        <i className="bi bi-person-workspace"></i> <strong>Oktató:</strong> {booking.instructor.name}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                        <i className="bi bi-car-front"></i> {booking.instructor.car}
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

                    <button
                      onClick={() => handleDeleteBooking(booking.id)}
                      style={{
                        backgroundColor: 'rgba(255,77,77,0.15)', color: '#ff4d4d',
                        border: '1px solid #ff4d4d', borderRadius: '8px',
                        padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold', 
                      }}
                    >
                      <i className="bi bi-trash"></i> Törlés
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* SIKERES FOGLALÁS MODAL */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          zIndex: 999
        }}>
          <div style={{
            backgroundColor: '#14213d', borderRadius: '20px',
            padding: '3rem', width: '35rem', textAlign: 'center',
            border: '1px solid rgba(75,181,67,0.4)',
            boxShadow: '0 0 40px rgba(75,181,67,0.2)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem'
          }}>
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%',
              backgroundColor: 'rgba(75,181,67,0.15)',
              border: '2px solid #4BB543',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
              <i className="bi bi-check-lg" style={{ fontSize: '2.5rem', color: '#4BB543' }}></i>
            </div>
            <h2 style={{ color: '#4BB543', fontSize: '1.8rem' }}>Sikeres foglalás!</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', lineHeight: '1.6' }}>
              Az időpontod sikeresen rögzítve lett. <br />
              Az oktató hamarosan visszaigazolja a foglalást.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                marginTop: '0.5rem', padding: '0.8rem 3rem',
                backgroundColor: '#4BB543', color: 'white',
                border: 'none', borderRadius: '10px', fontWeight: 'bold',
                fontSize: '1.1rem', cursor: 'pointer', transition: '0.2s'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentMainComp;