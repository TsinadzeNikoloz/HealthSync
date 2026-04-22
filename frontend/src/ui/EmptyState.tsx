import { ReactNode } from 'react';

interface EmptyStateProps {
	icon: string;
	title: string;
	description?: string;
	action?: ReactNode;
	size?: 'lg' | 'sm';
	iconBg?: string;
	iconColor?: string;
}

export default function EmptyState({
	icon,
	title,
	description,
	action,
	size = 'lg',
	iconBg = 'bg-slate-50',
	iconColor = 'text-slate-300',
}: EmptyStateProps) {
	if (size === 'sm') {
		return (
			<div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white p-16 text-center">
				<i className={`fas ${icon} text-3xl ${iconColor} mb-3 block`}></i>
				<p className="font-bold text-slate-400">{title}</p>
				{description && (
					<p className="mt-2 text-sm font-medium text-slate-400">
						{description}
					</p>
				)}
				{action && <div className="mt-4">{action}</div>}
			</div>
		);
	}

	return (
		<div className="rounded-[3rem] border-2 border-dashed border-slate-200 bg-white p-10 text-center sm:p-20">
			<div
				className={`h-20 w-20 ${iconBg} mx-auto mb-6 flex items-center justify-center rounded-full ${iconColor}`}
			>
				<i className={`fas ${icon} text-3xl`}></i>
			</div>
			<h3 className="text-xl font-bold text-slate-400">{title}</h3>
			{description && (
				<p className="mt-2 text-sm font-medium text-slate-400">{description}</p>
			)}
			{action && <div className="mt-6">{action}</div>}
		</div>
	);
}
