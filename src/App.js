import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

import Login from './pages/auth/Login';
import PatientRegister from './pages/auth/PatientRegister';
import DoctorRegister from './pages/auth/DoctorRegister';
import ForgotPassword from './pages/auth/ForgotPassword';

import AdminDashboard from './pages/AdminDashboard';
import DoctorList from './pages/doctor/DoctorList';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientList from './pages/patient/PatientList';
import PatientProfile from './pages/patient/PatientProfile';
import BookAppointment from './pages/appointment/BookAppointment';
import AppointmentList from './pages/appointment/AppointmentList';
import AdmissionPage from './pages/admission/AdmissionPage';
import PrescriptionPage from './pages/prescription/PrescriptionPage';
import PharmacyBilling from './pages/pharmacy/PharmacyBilling';
import BillingPage from './pages/billing/BillingPage';
import ReportsPage from './pages/reports/ReportsPage';

function PrivateRoute({ children, roles }) {
  const { user, token } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { token, user } = useAuth();
  const homePath = user?.role === 'doctor' ? '/doctor-dashboard' : user?.role === 'patient' ? '/patient-profile' : user?.role === 'pharmacist' ? '/pharmacy' : '/dashboard';
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register/patient" element={<PatientRegister />} />
      <Route path="/register/doctor" element={<DoctorRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/dashboard" element={<PrivateRoute roles={['admin']}><AppLayout><AdminDashboard /></AppLayout></PrivateRoute>} />
      <Route path="/doctors" element={<PrivateRoute roles={['admin','doctor','patient']}><AppLayout><DoctorList /></AppLayout></PrivateRoute>} />
      <Route path="/doctor-dashboard" element={<PrivateRoute roles={['doctor']}><AppLayout><DoctorDashboard /></AppLayout></PrivateRoute>} />
      <Route path="/patients" element={<PrivateRoute roles={['admin','doctor']}><AppLayout><PatientList /></AppLayout></PrivateRoute>} />
      <Route path="/patient-profile" element={<PrivateRoute roles={['patient']}><AppLayout><PatientProfile /></AppLayout></PrivateRoute>} />
      <Route path="/book-appointment" element={<PrivateRoute roles={['patient']}><AppLayout><BookAppointment /></AppLayout></PrivateRoute>} />
      <Route path="/appointments" element={<PrivateRoute roles={['admin','doctor']}><AppLayout><AppointmentList /></AppLayout></PrivateRoute>} />
      <Route path="/my-appointments" element={<PrivateRoute roles={['patient']}><AppLayout><AppointmentList /></AppLayout></PrivateRoute>} />
      <Route path="/admissions" element={<PrivateRoute roles={['admin','doctor']}><AppLayout><AdmissionPage /></AppLayout></PrivateRoute>} />
      <Route path="/prescriptions" element={<PrivateRoute roles={['admin','doctor']}><AppLayout><PrescriptionPage /></AppLayout></PrivateRoute>} />
      <Route path="/my-prescriptions" element={<PrivateRoute roles={['patient']}><AppLayout><PrescriptionPage /></AppLayout></PrivateRoute>} />
      <Route path="/pharmacy" element={<PrivateRoute roles={['admin','pharmacist']}><AppLayout><PharmacyBilling /></AppLayout></PrivateRoute>} />
      <Route path="/billing" element={<PrivateRoute roles={['admin','pharmacist']}><AppLayout><BillingPage /></AppLayout></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute roles={['admin']}><AppLayout><ReportsPage /></AppLayout></PrivateRoute>} />

      <Route path="/" element={token ? <Navigate to={homePath} replace /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
