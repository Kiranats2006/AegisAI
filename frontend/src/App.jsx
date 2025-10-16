import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import EmergencyChat from './pages/EmergencyChat'
import EmergencyContacts from './pages/EmergencyContacts'
import MedicalProfile from './pages/MedicalProfile'
import EmergencyHistory from './pages/EmergencyHistory'
import Settings from './pages/Settings'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes - Main App */}
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/chat" element={<EmergencyChat/>} />
          <Route path="/contacts" element={<EmergencyContacts/>} />
          <Route path="/medical" element={<MedicalProfile/>} />
          <Route path="/history" element={<EmergencyHistory/>} />
          <Route path="/settings" element={<Settings/>} />
          
          {/* Fallback route */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}