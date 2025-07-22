import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage.jsx';
import Dashboard from '@/pages/Dashboard.jsx';
import TimeTracking from '@/pages/TimeTracking.jsx';
import LeaveManagement from '@/pages/LeaveManagement.jsx';
import CompanyHolidays from '@/pages/CompanyHolidays.jsx';
import Settings from '@/pages/Settings.jsx';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Helmet>
            <title>ระบบลงเวลาเข้า-ออกงาน | Time Tracking System</title>
            <meta name="description" content="ระบบจัดการเวลาทำงานและลางานที่ทันสมัย พร้อมฟีเจอร์ครบครัน" />
          </Helmet>
          
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/time-tracking" element={
              <ProtectedRoute>
                <TimeTracking />
              </ProtectedRoute>
            } />
            <Route path="/leave-management" element={
              <ProtectedRoute>
                <LeaveManagement />
              </ProtectedRoute>
            } />
            <Route path="/holidays" element={
              <ProtectedRoute>
                <CompanyHolidays />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
          </Routes>
          
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;