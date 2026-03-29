  import { BrowserRouter, Routes, Route, NavLink  } from 'react-router-dom'
  import './App.css'
  import HomeComp from './components/HomeComp'
  import AdminSiteComp from './components/AdminSiteComp'
  import InstructorLogin from './components/InstructorSiteComp'
  import StudentLogin from './components/StudentSiteComp'
  import StudentRegisterComp from './components/StudenRegisterComp'
  import StudentMainComp from './components/StudentMainComp'
  import AdminMainComp from './components/AdminMainComp'
  import InstructorMainComp from './components/InstructorMainComp'
  import StudentResetComp from './components/StudentResetComp'


  function App() {
    
    
    return (
      <>
        <BrowserRouter>
        <nav>
          <ul>
            <li><NavLink to='/' end><i className="bi bi-box-arrow-in-right"></i> Főoldal</NavLink></li>
            <li><NavLink to='/student'><i className="bi bi-person-circle"></i> Tanulóknak</NavLink></li>
            <li><NavLink to='/instructor'><i className="bi bi-pencil"></i> Tanároknak</NavLink></li>

            <li><NavLink to='/admin'><i className="bi bi-gear"></i> Admin</NavLink></li>
              
          </ul>
        </nav>
          <Routes>
            <Route path='/' element={<HomeComp />}/>
            <Route path='/student' element={<StudentLogin />}/> 
            <Route path='/instructor' element={<InstructorLogin />}/>
            <Route path='/admin' element={<AdminSiteComp />}/>
            <Route path='/student-register' element={<StudentRegisterComp />}/>
            <Route path='/student-site' element={<StudentMainComp />}/>
            <Route path='/admin-site' element={<AdminMainComp />}/>
            <Route path='/instructor-site' element={<InstructorMainComp  />}/>
            <Route path='/student-reset' element={<StudentResetComp />}/>
          </Routes>
        </BrowserRouter>
      </>
    )
  }

  export default App
