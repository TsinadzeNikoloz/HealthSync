import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useUser } from './features/authentication/useUser';
import { useLogout } from './features/authentication/useLogout';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import Appointments from './components/Appointments';
import PatientServices from './components/PatientServices';
import ServiceDetail from './components/ServiceDetail';
import CheckoutSuccess from './components/CheckoutSuccess';
import MedicalRecords from './components/MedicalRecords';
import PatientRecords from './components/PatientRecords';
import AccountSettings from './components/AccountSettings';
import Operations from './components/Operations';
import AboutUs from './components/AboutUs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: false,
    },
  },
});

function AppLayout() {
  const { user, isPending } = useUser();
  const { logout } = useLogout();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (isPending) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-slate-50 font-['Plus_Jakarta_Sans']">
      <Sidebar role={user.role} onLogout={logout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header user={user} onMenuToggle={() => setIsSidebarOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useUser();
  if (user?.role === 'ADMIN') return <AdminDashboard />;
  if (user?.role === 'DOCTOR') return <DoctorDashboard />;
  return <PatientDashboard />;
}

function GuestRoute() {
  const { user, isPending } = useUser();
  if (isPending) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/services" element={<PatientServices />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/medical-records" element={<MedicalRecords />} />
            <Route path="/patients" element={<PatientRecords />} />
            <Route path="/settings" element={<AccountSettings />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: '8px' }}
        toastOptions={{
          success: { duration: 3000 },
          error: { duration: 5000 },
          style: {
            fontSize: '14px',
            fontWeight: '600',
            maxWidth: '500px',
            padding: '16px 24px',
            borderRadius: '1rem',
          },
        }}
      />
    </QueryClientProvider>
  );
}
