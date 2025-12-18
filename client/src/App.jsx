import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import ResQLinkNavBar from './components/common/Navbar'
import LandingPage from './components/common/LandingPage'
import AboutUs from './components/common/AboutUs'
import ContactUs from './components/common/ContactUs'
import Login from './components/common/Login'
import Registration from './components/common/Registration'
import UserLayout from './components/Layout/UserLayout'
import Dashboard from './components/User/Dashboard'
import SOSPage from './components/User/SOSPage'
import MyRequests from './components/User/MyRequests'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={[<ResQLinkNavBar />, <LandingPage />]} />
        <Route path='/about' element={[<ResQLinkNavBar />, <AboutUs />]} />
        <Route path='/contact' element={[<ResQLinkNavBar />, <ContactUs />]} />
        <Route path='/login' element={[<ResQLinkNavBar />, <Login />]} />
        <Route path='/register' element={[<ResQLinkNavBar />, <Registration />]} />
        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sos" element={<SOSPage />} />
 <Route path="/my-requests" element={<MyRequests />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App