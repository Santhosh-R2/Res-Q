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
import SafetyTips from './components/User/SafetyTips'
import Profile from './components/User/Profile'
import MissionController from './components/User/MissonController'
import LiveMap from './components/User/LiveMap'
import History from './components/User/History'
import AvailableTasks from './components/Admin/AvailableTasks'
import AdminDashBoard from './components/Admin/AdminDashBoard'
import UserAvailableTaks from './components/User/AvailableTasks'
import DonateItems from './components/User/DonateItems'
import TrackDonation from './components/User/TrackDonation'
import DeliveryLogistics from './components/User/DeliveryLogistics'
import UserDatabase from './components/Admin/UserDatabase'
import GlobalInventory from './components/Admin/GlobalInventory'
import ForgotPassword from './components/User/ForgotPassword'
import InventoryHistory from './components/Admin/InventoryHistory'
import Enquiries from './components/Admin/Enquiries'
import EnquiriesDetails from './components/Admin/EnquiriesDetails'
function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={[<ResQLinkNavBar />, <LandingPage />]} />
        <Route path='/about' element={[<ResQLinkNavBar />, <AboutUs />]} />
        <Route path='/contact' element={[<ResQLinkNavBar />, <ContactUs />]} />
        <Route path='/login' element={[<ResQLinkNavBar />, <Login />]} />
        <Route path='/register' element={[<ResQLinkNavBar />, <Registration />]} />
          <Route path="/forgotPassword" element={[<ResQLinkNavBar />,<ForgotPassword />]}/>

        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sos" element={<SOSPage />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/safety-tips" element={<SafetyTips />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mission-controller" element={<MissionController />} />
          <Route path="/map" element={<LiveMap />} />
          <Route path="/history" element={<History />} />
          <Route path="/available-tasks" element={<AvailableTasks />} />
          <Route path="/admin-dashboard" element={<AdminDashBoard />} />
          <Route path="/missions" element={<UserAvailableTaks />} />
          <Route path="/donate" element={<DonateItems />} />
          <Route path="/track-donations" element={<TrackDonation />} />
          <Route path="/logistics" element={<DeliveryLogistics />} />
          <Route path="/manage-users" element={<UserDatabase />} />
          <Route path="/inventory" element={<GlobalInventory />} />
          <Route path="/inventory-history" element={<InventoryHistory />} />
          <Route path ="/enquiries" element={<Enquiries />} />
          <Route path="/enquiries/:id" element={<EnquiriesDetails />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App