interface StatCardProps {
	label: string;
	value: string | number;
	icon: string;
	color: string;
	trend?: string;
}

function StatCard({ label, value, icon, color, trend }: StatCardProps) {
	return (
		<div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
			<div
				className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg`}
			>
				<i className={`fas ${icon}`}></i>
			</div>
			<div>
				<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
					{label}
				</p>
				<div className="flex items-baseline gap-2">
					<p className="text-3xl font-black text-slate-800">{value}</p>
					{trend && (
						<span className="text-[10px] font-bold text-blue-500">
							{trend}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

export default StatCard;
