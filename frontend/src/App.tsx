import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
	Outlet,
	useLocation,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useUser } from './features/authentication/useUser';
import { useLogout } from './features/authentication/useLogout';

import Header from './ui/Header';
import Sidebar from './ui/Sidebar';
import Spinner from './ui/Spinner';
import ErrorBoundary from './pages/ErrorBoundary';

const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const PatientDashboard = React.lazy(() => import('./pages/PatientDashboard'));
const DoctorDashboard = React.lazy(() => import('./pages/DoctorDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Appointments = React.lazy(() => import('./pages/Appointments'));
const ServicesPage = React.lazy(() => import('./pages/Services'));
const ServiceDetail = React.lazy(() => import('./pages/ServiceDetail'));
const CheckoutSuccess = React.lazy(() => import('./pages/CheckoutSuccess'));
const MedicalRecords = React.lazy(() => import('./pages/MedicalRecords'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const AccountSettings = React.lazy(() => import('./pages/AccountSettings'));
const AboutUs = React.lazy(() => import('./pages/AboutUs'));
const NotFound = React.lazy(() => import('./ui/NotFound'));

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000,
			retry: false,
		},
	},
});

const PAGE_TITLES: Record<string, string> = {
	'/dashboard': 'Dashboard',
	'/appointments': 'Appointments',
	'/services': 'Services',
	'/medical-records': 'Medical Records',
	'/patients': 'Patient Records',
	'/settings': 'Account Settings',
	'/about': 'About',
	'/checkout-success': 'Booking Confirmed',
	'/login': 'Login',
	'/signup': 'Sign Up',
	'/forgot-password': 'Forgot Password',
};

function TitleManager() {
	const { pathname } = useLocation();
	useEffect(() => {
		const base = Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k));
		document.title = base ? `${PAGE_TITLES[base]} | HealthSync` : 'HealthSync';
	}, [pathname]);
	return null;
}

// Layout for /services and /about — full shell when logged in, guest shell when not
function PublicLayout() {
	const { user, isPending } = useUser();
	const { logout } = useLogout();
	const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

	if (isPending) return <Spinner fullscreen />;

	return (
		<div className="flex h-screen bg-slate-50 font-['Plus_Jakarta_Sans']">
			<Sidebar
				role={user?.role}
				onLogout={logout}
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
				guest={!user}
			/>
			<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
				<Header
					user={user ?? null}
					onMenuToggle={() => setIsSidebarOpen((o) => !o)}
				/>
				<main className="flex-1 overflow-y-auto p-8 lg:p-10">
					<Outlet />
				</main>
			</div>
		</div>
	);
}

function AppLayout() {
	const { user, isPending } = useUser();
	const { logout } = useLogout();
	const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

	if (isPending) return <Spinner fullscreen />;

	if (!user) return <Navigate to="/login" replace />;

	return (
		<div className="flex h-screen bg-slate-50 font-['Plus_Jakarta_Sans']">
			<Sidebar
				role={user.role}
				onLogout={logout}
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
			/>
			<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
				<Header user={user} onMenuToggle={() => setIsSidebarOpen((o) => !o)} />
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
// I used AI here for generating this code
export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<TitleManager />
				<ErrorBoundary>
					<React.Suspense fallback={<Spinner fullscreen />}>
						<Routes>
							{/* Public routes */}
							<Route element={<PublicLayout />}>
								<Route index element={<Navigate to="/services" replace />} />
								<Route path="/services" element={<ServicesPage />} />
								<Route path="/services/:slug" element={<ServiceDetail />} />
								<Route path="/about" element={<AboutUs />} />
							</Route>

							{/* Guest-only routes */}
							<Route element={<GuestRoute />}>
								<Route path="/login" element={<Login />} />
								<Route path="/signup" element={<Signup />} />
								<Route path="/forgot-password" element={<ForgotPassword />} />
							</Route>

							{/* Accessible regardless of auth */}
							<Route
								path="/reset-password/:token"
								element={<ResetPassword />}
							/>

							{/* Protected routes */}
							<Route element={<AppLayout />}>
								<Route path="/dashboard" element={<Dashboard />} />
								<Route path="/appointments" element={<Appointments />} />
								<Route path="/medical-records" element={<MedicalRecords />} />
								<Route path="/patients" element={<UserManagement />} />
								<Route path="/settings" element={<AccountSettings />} />
								<Route path="/checkout-success" element={<CheckoutSuccess />} />
							</Route>

							<Route path="*" element={<NotFound />} />
						</Routes>
					</React.Suspense>
				</ErrorBoundary>
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
