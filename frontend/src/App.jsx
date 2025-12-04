import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout/Layout'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Employees from './pages/Employees/EmployeeDetail'
import EmployeeDetail from './pages/Employees/EmployeeDetail'
import LeaveManagement from './pages/Leave/LeaveManagement'
import Attendance from './pages/Attendance/Attendance'
import TravelManagement from './pages/Travel/TravelManagement'
import Reports from './pages/Reports/Reports'
import Settings from './pages/Settings/Settings'
import Profile from './pages/Profile/Profile'
import MobileApp from './pages/Mobile/MobileApp'
import './App.css'

function App() {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/:id" element={<EmployeeDetail />} />
        <Route path="/leave" element={<LeaveManagement />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/travel" element={<TravelManagement />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mobile" element={<MobileApp />} />
      </Routes>
    </Layout>
  )
}

export default App