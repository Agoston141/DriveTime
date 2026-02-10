import React from 'react'
import { useScrollIntoView } from '@mantine/hooks'; // npm i @mantine/hooks 
import 'bootstrap-icons/font/bootstrap-icons.css'; // npm i bootstrap icons

const HomeComp = () => {

  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLButtonElement>({
    offset: 60,
  });

  return (
    <div>
      <header>
          <div className="openingText">   
            <h1>
            Üdvözli Önt a 
            <span style={{color: "#14213d", fontStyle: "italic"}}> Drive</span>
            <span style={{color: "#fca311", fontStyle: "italic"}}>Time </span> 
             autósiskola!</h1>
            <p style={{color: "white"}}>Szeretne olyan oktatót, aki mellett tényleg megtanul vezetni és nem csak „letudja” a kötelező órákat?</p>
            <button className='appointment'>Foglaljon időpontot!</button>
            <img src="../img/logo.png" alt="DriveTime_logo" className='logo' style={{height:"15rem"}}/>
          </div>
      </header>
      <div className="extras">
            <p style={{backgroundColor: "#14213d", color:'white'}}><i className="bi bi-clock-fill"></i> Órák</p>
            <p><i className="bi bi-arrow-clockwise"></i> Gyakorlás</p>
            <p style={{backgroundColor: "#14213d", color:'white'}}><i className="bi bi-car-front-fill"></i> Vizsga</p>
            <p><button className='scrollBtn' onClick={() => scrollIntoView()}><i className="bi bi-info-circle"></i></button> Információk</p>
          </div>

      <main>
        <div className="text">
          <h1 
            style={{color:"#e47711", 
            textTransform: "uppercase",
            letterSpacing:"2rem",
            fontSize:'3.2rem'}}>- Regisztráció/Bejelentkezés -</h1>
          <div className="underline"></div>
          <h2 style={{color:"#14213d"}}>Válasszon szerepkört a folytatáshoz:</h2>
          <br />
          <h3 style={{fontStyle:'italic'}}>Választhat, miként kíván regisztrálni/bejelentkezni az oldalunkra az alábbiak közül:</h3>
        </div>
        
        <div className="forms">
          <form action="" className='studentForm'>
              <h2>Tanuló</h2>
              <img src="../img/student_icon_JO.png" alt="Student picture"/>
              <input type="text" name='name' placeholder='Név'/>
              <input type="text" name='email' placeholder='E-mail cím'/>
              <input type="text" name='password' placeholder='Jelszó'/>
              <button type="submit">Belépés</button>
          </form>

          <form action="" className='instructorForm'>
              <h2>Oktató</h2>
              <img src="../img/instructor_icon.png" alt="Instructor picture"/>
              <input type="text" name='name' placeholder='Név'/>
              <input type="text" name='email' placeholder='E-mail cím'/>
              <input type="text" name='password' placeholder='Jelszó'/>
              <button type="submit">Belépés</button>
          </form>

          <form action="" className='adminForm'>
            <h2>Admin</h2>
            <img src="../img/admin_icon.png" alt="Admin picture"/>
              <input type="text" name='email' placeholder='E-mail cím'/>
              <input type="text" name='password' placeholder='Jelszó'/>
              <button type="submit">Belépés</button>
          </form>
        </div>
        
      </main>

      <div className="wave-container">
          <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className="parallax">
            <use href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7" />
            <use href="#gentle-wave" x="48" y="3" fill="rgba(20, 33, 61, 0.5)" />
            <use href="#gentle-wave" x="48" y="5" fill="rgba(20, 33, 61, 0.7)" />
            <use href="#gentle-wave" x="48" y="7" fill="rgba(20, 33, 61, 0.3)" />
          </g>
        </svg>
        </div>

       <footer ref={targetRef}>
        <div className="firstText">
            <p style={{fontSize:'2.5rem', marginTop: '6rem'}}>Szeretne velünk tanulni? Keressen bátran!</p>     
            <p style={{color:'#fca311', fontSize:'2rem'}}>drivetime-autosiskola@gmail.com</p>
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
