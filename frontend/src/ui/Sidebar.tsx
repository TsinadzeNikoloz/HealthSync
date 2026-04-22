import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AppLogo from './AppLogo';
import { Role } from '../types';

interface SidebarProps {
	role?: Role;
	onLogout?: () => void;
	isOpen: boolean;
	onClose: () => void;
	guest?: boolean;
}

interface NavItemProps {
	icon: string;
	label: string;
	viewId: string;
	active: boolean;
	onClose: () => void;
}

function NavItem({ icon, label, viewId, active, onClose }: NavItemProps) {
	return (
		<Link
			to={`/${viewId}`}
			onClick={onClose}
			aria-current={active ? 'page' : undefined}
			className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200 ${
				active
					? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
					: 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
			}`}
		>
			<i
				className={`fas ${icon} w-5 text-lg ${active ? 'text-white' : 'group-hover:text-blue-600'}`}
			></i>
			<span className="font-semibold">{label}</span>
		</Link>
	);
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
	const path = location.pathname;

	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose]);

	return (
		<>
			{/* Mobile backdrop */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
					onClick={onClose}
					aria-hidden="true"
				/>
			)}

			<aside
				aria-label="Main navigation"
				className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r border-slate-100 bg-white transition-transform duration-300 ease-in-out lg:relative lg:inset-auto lg:z-auto lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
			>
				<div className="flex items-center justify-between p-8">
					<AppLogo variant="sidebar" />
					{/* Close button — mobile only */}
					<button
						onClick={onClose}
						aria-label="Close navigation"
						className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
					>
						<i className="fas fa-times"></i>
					</button>
				</div>

				<nav className="flex flex-1 flex-col gap-2 px-6">
					<div className="flex flex-col gap-1 pb-4">
						{guest ? (
							<>
								<NavItem
									icon="fa-briefcase-medical"
									label="Browse Services"
									viewId="services"
									active={path.startsWith('/services')}
									onClose={onClose}
								/>
								<NavItem
									icon="fa-circle-info"
									label="About Us"
									viewId="about"
									active={path === '/about'}
									onClose={onClose}
								/>
							</>
						) : (
							<>
								<NavItem
									icon="fa-th-large"
									label="Overview"
									viewId="dashboard"
									active={path === '/dashboard'}
									onClose={onClose}
								/>
								<NavItem
									icon="fa-calendar-alt"
									label="Appointments"
									viewId="appointments"
									active={path === '/appointments'}
									onClose={onClose}
								/>

								{role === Role.ADMIN && (
									<>
										<NavItem
											icon="fa-briefcase-medical"
											label="Clinic Services"
											viewId="services"
											active={path.startsWith('/services')}
											onClose={onClose}
										/>
										<NavItem
											icon="fa-users"
											label="Patient Records"
											viewId="patients"
											active={path === '/patients'}
											onClose={onClose}
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
											onClose={onClose}
										/>
										<NavItem
											icon="fa-file-medical"
											label="Medical History"
											viewId="medical-records"
											active={path === '/medical-records'}
											onClose={onClose}
										/>
									</>
								)}

								{role === Role.DOCTOR && (
									<NavItem
										icon="fa-file-medical-alt"
										label="Clinical Records"
										viewId="medical-records"
										active={path === '/medical-records'}
										onClose={onClose}
									/>
								)}

								<NavItem
									icon="fa-circle-info"
									label="About Us"
									viewId="about"
									active={path === '/about'}
									onClose={onClose}
								/>
							</>
						)}
					</div>

					{!guest && (
						<div className="flex flex-col gap-1 border-t border-slate-100 pt-4">
							<NavItem
								icon="fa-user-cog"
								label="Account Settings"
								viewId="settings"
								active={path === '/settings'}
								onClose={onClose}
							/>
						</div>
					)}
				</nav>

				<div className="p-6">
					{guest ? (
						<button
							onClick={() => navigate('/login')}
							className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 font-bold text-white shadow-lg shadow-blue-100 transition-colors hover:-translate-y-0.5"
						>
							<i className="fas fa-sign-in-alt w-5"></i>
							Sign In
						</button>
					) : (
						<button
							onClick={onLogout}
							className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-4 font-bold text-slate-500 transition-colors hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
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
