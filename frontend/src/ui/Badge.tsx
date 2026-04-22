import { AppointmentStatus } from '../types';

interface BadgeProps {
	status: string | AppointmentStatus;
	className?: string;
}

function getStyles(s: string) {
	switch (s.toUpperCase()) {
		case 'CONFIRMED':
			return 'bg-emerald-50 text-emerald-600 border-emerald-100';
		case 'COMPLETED':
			return 'bg-blue-50 text-blue-600 border-blue-100';
		case 'PENDING':
			return 'bg-amber-50 text-amber-600 border-amber-100';
		case 'CANCELLED':
			return 'bg-rose-50 text-rose-600 border-rose-100';
		default:
			return 'bg-slate-50 text-slate-500 border-slate-100';
	}
}

export default function Badge({ status, className = '' }: BadgeProps) {
	return (
		<span
			className={`rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${getStyles(status as string)} ${className}`}
		>
			{status}
		</span>
	);
}
