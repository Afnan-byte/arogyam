import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import HealthProfile from './pages/student/HealthProfile';
import StudentIllRegister from './pages/student/IllRegister';
import StudentAppointments from './pages/student/Appointments';
import StudentMedicines from './pages/student/Medicines';
import StudentComplaints from './pages/student/Complaints';
import StudentCommunity from './pages/student/Community';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPatients from './pages/doctor/Patients';
import DoctorPrescriptions from './pages/doctor/Prescriptions';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminDoctors from './pages/admin/Doctors';
import AdminComplaints from './pages/admin/Complaints';
import AdminWaterFilters from './pages/admin/WaterFilters';
import AdminSettings from './pages/admin/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Student Routes */}
          <Route path="/student" element={<ProtectedRoute allowedRole="student"><DashboardLayout role="student" /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="profile" element={<HealthProfile />} />
            <Route path="ill-register" element={<StudentIllRegister />} />
            <Route path="appointments" element={<StudentAppointments />} />
            <Route path="medicines" element={<StudentMedicines />} />
            <Route path="complaints" element={<StudentComplaints />} />
            <Route path="community" element={<StudentCommunity />} />
          </Route>

          {/* Protected Doctor Routes */}
          <Route path="/doctor" element={<ProtectedRoute allowedRole="doctor"><DashboardLayout role="doctor" /></ProtectedRoute>}>
            <Route index element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="prescriptions" element={<DoctorPrescriptions />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><DashboardLayout role="admin" /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="water-filters" element={<AdminWaterFilters />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
