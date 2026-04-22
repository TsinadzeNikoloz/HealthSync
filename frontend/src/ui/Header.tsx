import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { getUserPhotoUrl } from '../utils/helpers';
import { useNotifications } from '../features/notifications/useNotifications';
import { useMarkAllRead } from '../features/notifications/useMarkAllRead';
import { useMarkRead } from '../features/notifications/useMarkRead';
import { useOutsideClick } from '../hooks/useOutsideClick';

interface HeaderProps {
	user: User | null;
	onMenuToggle: () => void;
}

function timeAgo(dateStr: string): string {
	const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
	if (diff < 60) return 'just now';
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	return `${Math.floor(diff / 86400)}d ago`;
}

const typeIcon: Record<string, string> = {
	appointment: 'fa-calendar-check',
	record: 'fa-file-medical',
	system: 'fa-bell',
};
const typeBg: Record<string, string> = {
	appointment: 'bg-blue-50 text-blue-600',
	record: 'bg-emerald-50 text-emerald-600',
	system: 'bg-slate-100 text-slate-500',
};

function NotificationBell() {
	const navigate = useNavigate();
	const { notifications, unreadCount } = useNotifications();
	const { markAllRead } = useMarkAllRead();
	const { markRead } = useMarkRead();
	const [open, setOpen] = useState(false);

	const close = useCallback(() => setOpen(false), []);
	const ref = useOutsideClick<HTMLDivElement>(close);

	const handleClick = (id: string, read: boolean, link?: string) => {
		if (!read) markRead(id);
		setOpen(false);
		if (link) navigate(link);
	};

	return (
		<div ref={ref} className="relative">
			<button
				onClick={() => setOpen((o) => !o)}
				className="relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
				aria-label="Notifications"
			>
				<i className="fas fa-bell text-lg"></i>
				{unreadCount > 0 && (
					<span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black leading-none text-white">
						{unreadCount > 9 ? '9+' : unreadCount}
					</span>
				)}
			</button>

			{open && (
				<div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl duration-200 animate-in fade-in slide-in-from-top-2">
					{/* Header */}
					<div className="flex items-center justify-between border-b border-slate-50 px-5 py-4">
						<p className="text-sm font-black text-slate-800">Notifications</p>
						{unreadCount > 0 && (
							<button
								onClick={() => markAllRead()}
								className="text-[10px] font-bold uppercase tracking-widest text-blue-500 transition-colors hover:text-blue-700"
							>
								Mark all read
							</button>
						)}
					</div>

					{/* List */}
					<div className="max-h-80 divide-y divide-slate-50 overflow-y-auto">
						{notifications.length === 0 ? (
							<div className="py-10 text-center">
								<i className="fas fa-bell-slash mb-2 block text-2xl text-slate-200"></i>
								<p className="text-xs font-bold text-slate-300">
									No notifications yet
								</p>
							</div>
						) : (
							notifications.map((n) => (
								<button
									key={n._id}
									onClick={() => handleClick(n._id, n.read, n.link)}
									className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 ${!n.read ? 'bg-blue-50/40' : ''}`}
								>
									<div
										className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${typeBg[n.type] ?? typeBg.system}`}
									>
										<i
											className={`fas ${typeIcon[n.type] ?? typeIcon.system} text-xs`}
										></i>
									</div>
									<div className="min-w-0 flex-1">
										<p
											className={`text-xs leading-snug ${!n.read ? 'font-bold text-slate-800' : 'font-medium text-slate-500'}`}
										>
											{n.message}
										</p>
										<p className="mt-0.5 text-[10px] font-bold text-slate-300">
											{timeAgo(n.createdAt)}
										</p>
									</div>
									{!n.read && (
										<div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
									)}
								</button>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}

function Header({ user, onMenuToggle }: HeaderProps) {
	const navigate = useNavigate();
	return (
		<header className="glass sticky top-0 z-30 flex items-center justify-between border-b border-white/20 px-6 py-6 md:px-10">
			<div className="flex items-center gap-4">
				<button
					onClick={onMenuToggle}
					className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800 lg:hidden"
					aria-label="Open menu"
				>
					<i className="fas fa-bars text-lg"></i>
				</button>

				<div className="flex flex-col">
					<h1 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
						{user
							? user.role === 'ADMIN'
								? 'Administrator'
								: user.role === 'DOCTOR'
									? 'Physician Control'
									: 'Personal Health'
							: 'Welcome'}
					</h1>
					<p className="text-xl font-black text-slate-800">Dashboard</p>
				</div>
			</div>

			<div className="flex items-center gap-4">
				{user ? (
					<>
						<NotificationBell />
						<button
							onClick={() => navigate('/settings')}
							className="group flex items-center gap-4"
						>
							<div className="hidden text-right sm:block">
								<p className="text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-600">
									{user.name}
								</p>
								<p
									className={`text-[10px] font-extrabold uppercase tracking-widest ${user.role === 'ADMIN' ? 'text-rose-500' : user.role === 'DOCTOR' ? 'text-blue-500' : 'text-blue-500'}`}
								>
									{user.role}
								</p>
							</div>
							<div className="relative">
								<img
									src={getUserPhotoUrl(user.photo, user.name)}
									alt={user.name}
									className="h-12 w-12 rounded-2xl border-2 border-white shadow-md transition-transform group-hover:scale-105"
								/>
								<div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500"></div>
							</div>
						</button>
					</>
				) : (
					<>
						<button
							onClick={() => navigate('/login')}
							className="px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:text-blue-600"
						>
							Sign In
						</button>
						<button
							onClick={() => navigate('/signup')}
							className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5"
						>
							Sign Up
						</button>
					</>
				)}
			</div>
		</header>
	);
}

export default Header;
