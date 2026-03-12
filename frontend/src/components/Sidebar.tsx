import { useNavigate, useLocation } from 'react-router-dom';
import { Role } from '../types';

interface SidebarProps {
	role?: Role;
	onLogout?: () => void;
	isOpen: boolean;
	onClose: () => void;
	guest?: boolean;
}

function Sidebar({
	role,
	onLogout,
	isOpen,
	onClose,
	guest = false,
}: SidebarProps) {
	const navigate = useNavigate();
	const location = useLocation();

	const NavItem = ({
		icon,
		label,
		viewId,
		active,
	}: {
		icon: string;
		label: string;
		viewId: string;
		active: boolean;
	}) => (
		<button
			onClick={() => {
				navigate(`/${viewId}`);
				onClose();
			}}
			className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
				active
					? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
					: 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
			}`}
		>
			<i
				className={`fas ${icon} w-5 text-lg ${active ? 'text-white' : 'group-hover:text-indigo-600'}`}
			></i>
			<span className="font-semibold">{label}</span>
		</button>
	);

	const path = location.pathname;

	return (
		<>
			{/* Mobile backdrop */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
					onClick={onClose}
				/>
			)}

			<aside
				className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col h-full
        transition-transform duration-300 ease-in-out
        lg:relative lg:inset-auto lg:z-auto lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
			>
				<div className="p-8 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
							<i className="fas fa-heartbeat text-xl"></i>
						</div>
						<span className="text-2xl font-extrabold tracking-tight text-slate-800">
							HealthSync
						</span>
					</div>
					{/* Close button — mobile only */}
					<button
						onClick={onClose}
						className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
					>
						<i className="fas fa-times"></i>
					</button>
				</div>

				<nav className="flex-1 px-6 space-y-2">
					<div className="pb-4">
						{guest ? (
							<>
								<NavItem
									icon="fa-briefcase-medical"
									label="Browse Services"
									viewId="services"
									active={path.startsWith('/services')}
								/>
								<NavItem
									icon="fa-info-circle"
									label="About Us"
									viewId="about"
									active={path === '/about'}
								/>
							</>
						) : (
							<>
								<NavItem
									icon="fa-th-large"
									label="Overview"
									viewId="dashboard"
									active={path === '/dashboard'}
								/>
								<NavItem
									icon="fa-calendar-alt"
									label="Appointments"
									viewId="appointments"
									active={path === '/appointments'}
								/>

								{role === Role.ADMIN && (
									<>
										<NavItem
											icon="fa-briefcase-medical"
											label="Clinic Services"
											viewId="services"
											active={path.startsWith('/services')}
										/>
										<NavItem
											icon="fa-users"
											label="Patient Records"
											viewId="patients"
											active={path === '/patients'}
										/>
									</>
								)}

								{role === Role.PATIENT && (
									<>
										<NavItem
											icon="fa-briefcase-medical"
											label="Browse Services"
											viewId="services"
											active={path.startsWith('/services')}
										/>
										<NavItem
											icon="fa-file-medical"
											label="Medical History"
											viewId="medical-records"
											active={path === '/medical-records'}
										/>
									</>
								)}

								{role === Role.DOCTOR && (
									<NavItem
										icon="fa-file-medical-alt"
										label="Clinical Records"
										viewId="medical-records"
										active={path === '/medical-records'}
									/>
								)}

								<NavItem
									icon="fa-info-circle"
									label="About Us"
									viewId="about"
									active={path === '/about'}
								/>
							</>
						)}
					</div>

					{!guest && (
						<div className="pt-4 border-t border-slate-100">
							<NavItem
								icon="fa-user-cog"
								label="Account Settings"
								viewId="settings"
								active={path === '/settings'}
							/>
						</div>
					)}
				</nav>

				<div className="p-6">
					{guest ? (
						<button
							onClick={() => navigate('/login')}
							className="flex items-center justify-center gap-2 w-full px-4 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:-translate-y-0.5 transition-all"
						>
							<i className="fas fa-sign-in-alt w-5"></i>
							Sign In
						</button>
					) : (
						<button
							onClick={onLogout}
							className="flex items-center gap-3 w-full px-4 py-4 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all font-bold border border-transparent hover:border-rose-100"
						>
							<i className="fas fa-power-off w-5"></i>
							Sign Out
						</button>
					)}
				</div>
			</aside>
		</>
	);
}

export default Sidebar;
