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

import Header from './components/Header';
import Sidebar from './components/Sidebar';

const Auth = React.lazy(() => import('./components/Auth'));
const ForgotPassword = React.lazy(() => import('./components/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./components/ResetPassword'));
const PatientDashboard = React.lazy(
	() => import('./components/PatientDashboard'),
);
const DoctorDashboard = React.lazy(
	() => import('./components/DoctorDashboard'),
);
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const Appointments = React.lazy(() => import('./components/Appointments'));
const PatientServices = React.lazy(
	() => import('./components/PatientServices'),
);
const ServiceDetail = React.lazy(() => import('./components/ServiceDetail'));
const CheckoutSuccess = React.lazy(
	() => import('./components/CheckoutSuccess'),
);
const MedicalRecords = React.lazy(() => import('./components/MedicalRecords'));
const PatientRecords = React.lazy(() => import('./components/PatientRecords'));
const AccountSettings = React.lazy(
	() => import('./components/AccountSettings'),
);
const Operations = React.lazy(() => import('./components/Operations'));
const AboutUs = React.lazy(() => import('./components/AboutUs'));

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
	'/operations': 'Operations',
	'/about': 'About',
	'/checkout-success': 'Booking Confirmed',
	'/login': 'Login',
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

	if (isPending) {
		return (
			<div className="h-screen flex items-center justify-center bg-slate-50">
				<div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-slate-50 font-['Plus_Jakarta_Sans']">
			<Sidebar
				role={user?.role}
				onLogout={logout}
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
				guest={!user}
			/>
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
			<Sidebar
				role={user.role}
				onLogout={logout}
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
			/>
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<TitleManager />
				<React.Suspense
					fallback={
						<div className="h-screen flex items-center justify-center bg-slate-50">
							<div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
						</div>
					}
				>
					<Routes>
						{/* Public routes — guest shell or full shell depending on auth */}
						<Route element={<PublicLayout />}>
							<Route index element={<Navigate to="/services" replace />} />
							<Route path="/services" element={<PatientServices />} />
							<Route path="/services/:id" element={<ServiceDetail />} />
							<Route path="/about" element={<AboutUs />} />
						</Route>

						{/* Guest-only routes */}
						<Route element={<GuestRoute />}>
							<Route path="/login" element={<Auth />} />
							<Route path="/forgot-password" element={<ForgotPassword />} />
							<Route
								path="/reset-password/:token"
								element={<ResetPassword />}
							/>
						</Route>

						{/* Protected routes */}
						<Route element={<AppLayout />}>
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/appointments" element={<Appointments />} />
							<Route path="/medical-records" element={<MedicalRecords />} />
							<Route path="/patients" element={<PatientRecords />} />
							<Route path="/settings" element={<AccountSettings />} />
							<Route path="/operations" element={<Operations />} />
							<Route path="/checkout-success" element={<CheckoutSuccess />} />
							<Route path="*" element={<Navigate to="/services" replace />} />
						</Route>
					</Routes>
				</React.Suspense>
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
