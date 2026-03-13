import React, { useState, useEffect } from 'react';
import { instructor } from './instructor';
import CalendarComp from './CalendarComp';
import './Main.css';

export const BookingStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
} as const;

const StudentMainComp = () => {
  const [userName, setUserName] = useState('');
  const [selectedInstructorId, setSelectedInstructorId] = useState<number | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const storedName = localStorage.getItem('userName') || 'Tanuló';
    const nameParts = storedName.trim().split(' ');
    const firstName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
    setUserName(firstName);
  }, []);

  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    const hh = hour < 10 ? `0${hour}` : `${hour}`;
    timeSlots.push(`${hh}:00`);
    timeSlots.push(`${hh}:30`);
  }

  const handleInstructorClick = (id: number) => {
    const clickedInst = instructor.find(i => i.id === id);
    if (clickedInst?.status === 'offline') {
      setError(`A(z) ${clickedInst.name} jelenleg nem fogad diákot. Kérlek válassz másik oktatót!`);
      setSelectedInstructorId(null);
    } else {
      setError(null);
      setSelectedInstructorId(id);
    }
  };

  const currentInstructor = instructor.find(i => i.id === selectedInstructorId);

  const handleFinalizeBooking = async () => {
    if (!selectedInstructorId || !selectedTime) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const finalDate = new Date(selectedDate);
    finalDate.setHours(hours, minutes, 0, 0);

    const payload = {
      bookedDate: finalDate.toISOString(),
      instructorId: selectedInstructorId,
      studentId: 1, 
      status: BookingStatus.PENDING
    };

    try {
      const response = await fetch('http://localhost:3000/booking/makeBooking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          console.log("Sikeres mentés adatai:", result);
        }

        alert(`Sikeres foglalás!`);
        
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

  return (
    <div className="student-page" style={{ backgroundColor: '#0a0f1d', minHeight: '100vh', color: 'white' }}>
      
      <div className="hero-banner" style={{
        position: 'relative', width: '100%', height: '400px',
        backgroundImage: `linear-gradient(rgba(20, 33, 61, 0.7), rgba(10, 15, 29, 1)), url('../img/mercedes_interior.jpg')`,
        backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '4.5rem', margin: 0, fontWeight: 'bold' }}>
          {step === 1 ? `Üdvözlünk, ${userName}!` : 'Időpontválasztás'}
        </h1>
        <div style={{ width: '180px', height: '5px', backgroundColor: '#fca311', margin: '25px 0', borderRadius: '10px' }}></div>
        <p style={{ fontSize: '1.6rem', fontWeight: '300' }}>
          {step === 1 ? 'Válassz oktatót a vezetéshez!' : `Kiválasztott oktató: ${currentInstructor?.name}`}
        </p>
        
        {step === 2 && (
          <button onClick={() => { setStep(1); setSelectedTime(null); }} style={{ 
            background: 'rgba(252, 163, 17, 0.1)', border: '1px solid #fca311', color: '#fca311', 
            padding: '10px 20px', cursor: 'pointer', marginTop: '20px', borderRadius: '8px'
          }}>
             <i className="bi bi-arrow-left"></i> Vissza az oktatókhoz
          </button>
        )}
      </div>

      <main style={{ padding: '3rem 2rem' }}>
        
        {/* STEP 1: OKTATÓ VÁLASZTÁS */}
        {step === 1 && (
          <div className="fade-in">
            {error && (
              <div style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <i className="bi bi-exclamation-triangle-fill"></i> {error}
              </div>
            )}
            
            <div className="instructorList" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px' }}>
              {instructor.map((inst) => (
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

        {/*NAPTÁR ÉS IDŐPONT VÁLASZTÓ */}
        {step === 2 && (
          <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ backgroundColor: '#14213d', padding: '2.5rem', borderRadius: '25px', boxShadow: '0 15px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem' }}>
                
                {/* BAL OLDAL: NAPTÁR */}
                <div style={{ flex: '1.2', minWidth: '320px' }}>
                  <h3 style={{ color: '#fca311', marginBottom: '1.5rem' }}><i className="bi bi-calendar3"></i> 1. Nap kiválasztása</h3>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '15px', }}>
                    
             
                    <CalendarComp 
                       onChange={(date: Date) => {
                         setSelectedDate(date);
                         setSelectedTime(null); 
                       }} 
                    />

                  </div>
                </div>

                {/* JOBB OLDAL: IDŐPONT RÁCS */}
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
                            padding: '12px 0',
                            borderRadius: '10px',
                            border: selectedTime === time ? '2px solid #fca311' : '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: isPast ? 'rgba(255,255,255,0.05)' : (selectedTime === time ? '#fca311' : 'transparent'),
                            color: isPast ? '#555' : (selectedTime === time ? '#14213d' : 'white'),
                            fontWeight: 'bold',
                            cursor: isPast ? 'not-allowed' : 'pointer',
                            opacity: isPast ? 0.4 : 1,
                            transition: '0.2s'
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
      </main>
    </div>
  );
};

export default StudentMainComp;