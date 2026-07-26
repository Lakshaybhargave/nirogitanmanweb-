import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
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
        <Route path="/dashboard" element={<RoleGuard><Dashboard /></RoleGuard>} />
        <Route path="/doctors" element={<RoleGuard><Dashboard /></RoleGuard>} />
        <Route path="/appointments" element={<RoleGuard><Dashboard /></RoleGuard>} />
        <Route path="/medicines" element={<RoleGuard><Dashboard /></RoleGuard>} />
        <Route path="/diet-plan" element={<RoleGuard><Dashboard /></RoleGuard>} />
        <Route path="/chat" element={<RoleGuard><Dashboard /></RoleGuard>} />
        
        {/* Doctor and Admin Specific Redirect Paths */}
        <Route path="/doctor" element={<RoleGuard><Dashboard /></RoleGuard>} />
        <Route path="/admin" element={<RoleGuard><Dashboard /></RoleGuard>} />

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
