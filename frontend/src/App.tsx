import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import HomeComp from './components/HomeComp'
import StudentSiteComp from './components/StudentSiteComp'
import InstructorSiteComp from './components/InstructorSiteComp'
import AdminSiteComp from './components/AdminSiteComp'


function App() {
  
  
  return (
    <>
      <BrowserRouter>
      <nav>
        <ul>
          <li><Link to='/'>Főoldal</Link></li>
          <li><Link to='/student'>Tanuló</Link></li>
          <li><Link to='/instructor'>Oktató</Link></li>
          <li><Link to='/admin'>Admin</Link></li>
        </ul>
      </nav>
        <Routes>
          <Route path='/' element={<HomeComp />}/>
          <Route path='/student' element={<StudentSiteComp />}/>
          <Route path='/instructor' element={<InstructorSiteComp />}/>
          <Route path='/admin' element={<AdminSiteComp />}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
