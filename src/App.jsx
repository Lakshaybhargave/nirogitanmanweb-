import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import RoleGuard from './components/RoleGuard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Home />} />
        
        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard Shell Shared Navigation Links */}
        <Route path="/dashboard" element={<RoleGuard allowedRoles={['patient', 'paid_user', 'doctor', 'admin']}><Dashboard /></RoleGuard>} />
        <Route path="/doctors" element={<RoleGuard allowedRoles={['patient', 'paid_user', 'doctor', 'admin']}><Dashboard /></RoleGuard>} />
        <Route path="/appointments" element={<RoleGuard allowedRoles={['patient', 'paid_user', 'doctor', 'admin']}><Dashboard /></RoleGuard>} />
        <Route path="/medicines" element={<RoleGuard allowedRoles={['patient', 'paid_user', 'doctor', 'admin']}><Dashboard /></RoleGuard>} />
        <Route path="/diet-plan" element={<RoleGuard allowedRoles={['patient', 'paid_user', 'doctor', 'admin']}><Dashboard /></RoleGuard>} />
        <Route path="/chat" element={<RoleGuard allowedRoles={['patient', 'paid_user', 'doctor', 'admin']}><Dashboard /></RoleGuard>} />
        
        {/* Doctor and Admin Specific Redirect Paths */}
        <Route path="/doctor" element={<RoleGuard allowedRoles={['doctor', 'admin']}><Dashboard /></RoleGuard>} />
        <Route path="/admin" element={<RoleGuard allowedRoles={['admin']}><Dashboard /></RoleGuard>} />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
