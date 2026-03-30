import React, { useState, useEffect } from 'react'
import './Header.css'
import './Main.css'
import './Nav.css'
import './Footer.css'
import { useScrollIntoView } from '@mantine/hooks'; 
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import CalendarComp from './CalendarComp';
import { getInstructors, type Instructor } from './instructor';

const HomeComp = () => {

  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
  });

  const [instructors, setInstructors] = useState<Instructor[]>([]);

  useEffect(() => {
    getInstructors().then(data => setInstructors(data));
  }, []);

  return (
    <div style={{overflow: "hidden"}}>
      <header>
          <div className="openingText">   
            <h1>
            Üdvözli Önt a 
            <span style={{color: "#14213d", fontStyle: "italic"}}> Drive</span>
            <span style={{color: "#fca311", fontStyle: "italic"}}>Time </span> 
              autósiskola!</h1>
             <br />
             <hr style={{width:"100%"}}/>
            <br />
            <button className='appointment' onClick={() => scrollIntoView()}><i className="bi bi-hand-index-thumb-fill"></i> Elérhető oktatóink </button>
            <img src="../img/logo.png" alt="DriveTime_logo" className='logo' style={{height:"15rem"}}/>
          </div>
      </header>
      <div className="extras">
  <div className="extras-track">
    <p style={{backgroundColor: "#14213d", color:'white'}}><i className="bi bi-clock-fill"></i> Órák</p>
    <p><i className="bi bi-arrow-clockwise"></i> Gyakorlás</p>
    <p style={{backgroundColor: "#14213d", color:'white'}}><i className="bi bi-car-front-fill"></i> Vizsga</p>
    <p><i className="bi bi-info-circle"></i> Információk</p>
    <p style={{backgroundColor: "#14213d", color:'white'}}><i className="bi bi-clock-fill"></i> Órák</p>
    <p><i className="bi bi-arrow-clockwise"></i> Gyakorlás</p>
    <p style={{backgroundColor: "#14213d", color:'white'}}><i className="bi bi-car-front-fill"></i> Vizsga</p>
    <p><i className="bi bi-info-circle"></i> Információk</p>
  </div>
</div>

      <main>

        <div className="scard" style={{paddingTop:"5rem", paddingBottom:"5rem"}}>
          <div className="studentCard">

              <h1 style={{fontSize:"3rem"}}>Kedves Tanuló!</h1>
              <br />
              <p style={{fontSize:"1.6rem"}}>Örömmel köszöntjük a DriveTime személyre szabott tanulói felületén. Itt minden eszközt biztosítunk ahhoz, hogy Ön magabiztosan és felkészülten vágjon neki a forgalmi vizsgának.</p>
              <br />
              <p style={{fontSize:"1.6rem"}}>A naptárban nyomon követheti a már lefoglalt vezetés óráit, illetve módósíthatja azokat.</p>
              <br />
              <hr style={{width: "100%"}}/>
              <br />
              <p style={{fontSize:"1.5rem"}}>Az oktatók közül <b>kattintással</b> tud választani, az alábbi módon:</p>
              
              <div className="radios" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="checkbox" checked readOnly onClick={(e) => e.preventDefault()} style={{ width: '20px', height: '20px', cursor: 'default' }} />
                  <span style={{ fontSize: "1.4rem", color: "#14213d" }}>Maga választja az oktatókat!</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="checkbox" checked readOnly onClick={(e) => e.preventDefault()} style={{ width: '20px', height: '20px', cursor: 'default' }} />
                  <span style={{ fontSize: "1.4rem", color: "#14213d" }}>Mindent elintézhet ONLINE!</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="checkbox" checked readOnly onClick={(e) => e.preventDefault()} style={{ width: '20px', height: '20px', cursor: 'default' }} />
                  <span style={{ fontSize: "1.4rem", color: "#14213d" }}>Szabad idejéhez mérten igazíthatja az órákat.</span>
                </div>
              </div>
            </div>

            <div className="smthng">
              <div className="card">
                <div className="cBody">
                  <img src="../img/auto1.jpg" alt="" />
                </div>
              </div>
              <div className="card">
                <div className="cBody">
                  <img src="../img/auto2.jpg" alt="" />
                </div>
              </div>
              <div className="card">
                <div className="cBody">
                  <img src="../img/auto3.jpg" alt="" />
                </div>
              </div>
              <div className="card">
                <div className="cBody">
                  <img src="../img/auto4.jpg" alt="" />
                </div>
              </div>
            </div>
        </div>

        <div className="cards" ref={targetRef}>
          <div className="instructor">
            <h1>Elérhető oktatóink:</h1>
              <div className="instructorList">
                {instructors.map((instructor) => (
                  <div className="instructorCard" key={instructor.id}>
                    <h2 style={{fontSize:"2rem"}}>{instructor.name}</h2>
                    <p style={{paddingTop:"1rem", fontSize:"1.5rem"}}><strong>Autó:</strong> {instructor.car}</p>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '10px', 
                      marginTop: '1.5rem' 
                    }}>
                      <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: instructor.status === 'online' ? '#4BB543' : '#ff4d4d',
                        boxShadow: instructor.status === 'online' ? '0 0 10px #4BB543' : '0 0 10px #ff4d4d',
                      }}></div>
                      <span style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold', 
                        color: instructor.status === 'online' ? '#4BB543' : '#ff4d4d' 
                      }}>
                        {instructor.status === 'online' ? 'Elérhető' : 'Jelenleg szünetel'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
          </div>

          <div className="calendar">
            <CalendarComp/>
          </div>
        </div>

        <hr style={{width: "100rem", margin:"auto", marginTop:"5rem", marginBottom:"5rem", border:"1px solid black"}}/>
       
        <div className="cards2">
          <div className="box1">
            <p className='boxIcon'><i className="bi bi-search"></i></p>
            <div className="cardText">
              <h1>Keressen minket bátran</h1>
              <br /><hr style={{width:"100%"}}/><br />
              <p>Elérhetők a social médiában is <i className="bi bi-instagram"></i></p>
            </div>
          </div>
          <div className="box2">
  
  <div className="cardText">
    
    <h1>Helyszín  <i className="bi bi-geo-alt-fill"></i>  </h1> 
    <br /><hr style={{width:"100%"}}/> <br />
    
    <p>3200 Gyöngyös, Biztonság utca 1.</p> 
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3326.739075859197!2d19.928781100000002!3d47.7826142!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47405a0f8ad186ff%3A0xcb28be8f0bd45995!2zVmFrIEJvdHR5w6FuIErDoW5vcyBLYXRvbGlrdXMgTcWxc3pha2kgw6lzIEvDtnpnYXpkYXPDoWdpIFRlY2huaWt1bSwgR2ltbsOheml1bSDDqXMgS29sbMOpZ2l1bQ!5e1!3m2!1shu!2shu!4v1773519529397!5m2!1shu!2shu"
      width="100%"
      height="250"
      style={{ borderRadius: '12px', border: 'none', marginTop: '1rem' }}
      allowFullScreen
      loading="lazy"
    ></iframe>
  </div>
</div>
        </div>
      </main>

      <footer>
        <div className="firstText">
            <p style={{fontSize:'2.5rem', marginTop: '6rem'}}>Szeretne velünk tanulni? Keressen bátran!</p>     
            <p style={{color:'#fca311', fontSize:'2rem', fontStyle:'italic'}}>drivetime-autosiskola@gmail.com</p>
            <hr style={{marginTop: '6rem', width:'100rem'}}/>
        </div>
        <div className="secondText">
          <div className="descript">
            <ul>
              <p style={{fontSize:'1.5rem'}}>DriveTime.</p>
              <hr />
              <br />
              <li><b>Autósiskolánk célja, hogy magabiztos, biztonságos sofőröket képezzünk.</b></li>
              <li>Tapasztalt, türelmes oktatóink és rugalmas időbeosztásunk garantálja, hogy minden tanuló a saját tempójában fejlődhessen. Kortól függetlenül segítünk eljutni a biztos járműkezelésig és a magabiztos forgalmi vezetésig.</li>
              <br />
              <li style={{color:'white'}}>
                <i className="bi bi-instagram"> </i>
                <i className="bi bi-youtube"> <br /></i>
                <i className="bi bi-facebook"> </i>
                <i className="bi bi-twitter-x"> </i>  
              </li>
            </ul>
          </div>
          <div className="con">
            <ul>
              <p style={{fontSize:'1.5rem'}}><i className="bi bi-telephone"></i> Kontakt</p>
              <li>+36 30 123 4567</li>
              <li>+36 70 456 7890</li>
            </ul>
          </div>
          <div className="service">
            <ul>
              <p style={{fontSize:'1.5rem'}}><i className="bi bi-check-circle"></i> Szolgáltatások</p>
              <li>Alapos felkészítés</li>
              <li>Biztonság</li>
              <li>Jól felszerelt autók</li>
            </ul>
          </div>
          <div className="creators">
            <ul>
              <p style={{fontSize:'1.5rem'}}><i className="bi bi-person-circle"></i> Készítők</p>
              <li>Kisbenedek Enikő</li>
              <li>Molnár Ágoston</li>
              <li>Palatinus Ágoston Zoltán</li>
            </ul>
          </div>
        </div>
      </footer> 
    </div>
  )
}

export default HomeComp
