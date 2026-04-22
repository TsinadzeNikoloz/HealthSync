interface AppLogoProps {
	variant?: 'default' | 'sidebar' | 'dark';
	className?: string;
}

export default function AppLogo({
	variant = 'default',
	className = '',
}: AppLogoProps) {
	if (variant === 'dark') {
		return (
			<div className={`flex items-center gap-3 ${className}`}>
				<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-xl">
					<i className="fas fa-heartbeat text-2xl"></i>
				</div>
				<span className="text-3xl font-black tracking-tight text-white">
					HealthSync
				</span>
			</div>
		);
	}

	if (variant === 'sidebar') {
		return (
			<div className={`flex items-center gap-3 ${className}`}>
				<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-100">
					<i className="fas fa-heartbeat text-xl"></i>
				</div>
				<span className="text-2xl font-extrabold tracking-tight text-slate-800">
					HealthSync
				</span>
			</div>
		);
	}

	return (
		<div className={`flex items-center gap-3 ${className}`}>
			<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
				<i className="fas fa-heartbeat text-xl"></i>
			</div>
			<span className="text-2xl font-black text-slate-900">HealthSync</span>
		</div>
	);
}
