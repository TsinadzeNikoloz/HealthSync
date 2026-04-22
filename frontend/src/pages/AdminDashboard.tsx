import {
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	AreaChart,
	Area,
} from 'recharts';
import { useUserCounts } from '../features/users/useUserCounts';
import { useServices } from '../features/services/useServices';
import { useServiceStats } from '../features/services/useServiceStats';
import { useAppointmentStats } from '../features/appointments/useAppointmentStats';
import StatCard from '../features/dashboard/StatCard';
import Spinner from '../ui/Spinner';

const T = {
	borderRadius: '1rem',
	border: 'none',
	boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
	fontWeight: 700,
};
const TICK = { fontSize: 11, fontWeight: 700, fill: '#94a3b8' };

function AdminDashboard() {
	const { patients, doctors } = useUserCounts();
	const { services } = useServices();
	const { stats: serviceStats } = useServiceStats();
	const appointmentStats = useAppointmentStats();

	if (appointmentStats.isPending) return <Spinner />;

	const topRated = [...serviceStats]
		.sort((a, b) => b.avgRating - a.avgRating)
		.slice(0, 5)
		.map((s) => ({
			name: s._id.charAt(0) + s._id.slice(1).toLowerCase(),
			rating: +s.avgRating.toFixed(1),
		}));

	return (
		<div className="space-y-10 duration-500 animate-in fade-in">
			{/* KPI Stat Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				<StatCard
					label="Patients"
					value={patients ?? '—'}
					icon="fa-users"
					color="bg-blue-600"
				/>
				<StatCard
					label="Doctors"
					value={doctors ?? '—'}
					icon="fa-user-doctor"
					color="bg-emerald-500"
				/>
				<StatCard
					label="Appointments"
					value={appointmentStats.totalAppointments}
					icon="fa-calendar-check"
					color="bg-amber-500"
				/>
				<StatCard
					label="Services"
					value={services.length}
					icon="fa-stethoscope"
					color="bg-violet-500"
				/>
			</div>

			<div className="flex flex-col gap-8">
				{/* Analytics KPIs */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					{[
						{
							label: 'Total Revenue',
							value: `€${appointmentStats.totalRevenue.toLocaleString()}`,
							icon: 'fa-coins',
							color: 'text-blue-600',
							bg: 'bg-blue-50',
						},
						{
							label: 'Completion Rate',
							value: `${appointmentStats.completionRate}%`,
							icon: 'fa-circle-check',
							color: 'text-blue-600',
							bg: 'bg-blue-50',
						},
						{
							label: 'Cancellation Rate',
							value: `${appointmentStats.cancellationRate}%`,
							icon: 'fa-circle-xmark',
							color: 'text-rose-500',
							bg: 'bg-rose-50',
						},
					].map((kpi) => (
						<div
							key={kpi.label}
							className="flex items-center gap-4 rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-sm"
						>
							<div
								className={`h-11 w-11 ${kpi.bg} flex shrink-0 items-center justify-center rounded-2xl`}
							>
								<i className={`fas ${kpi.icon} ${kpi.color}`}></i>
							</div>
							<div>
								<p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
									{kpi.label}
								</p>
								<p className={`text-xl font-black ${kpi.color}`}>{kpi.value}</p>
							</div>
						</div>
					))}
				</div>

				{/* Revenue trend */}
				<div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
					<p className="mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
						Revenue Generated (Last 6 Months)
					</p>
					<ResponsiveContainer width="100%" height={220}>
						<AreaChart
							data={appointmentStats.revenueByMonth}
							margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
						>
							<defs>
								<linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
									<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
							<XAxis
								dataKey="month"
								tick={TICK}
								axisLine={false}
								tickLine={false}
							/>
							<YAxis
								tick={TICK}
								axisLine={false}
								tickLine={false}
								tickFormatter={(v) => `€${v}`}
							/>
							<Tooltip
								contentStyle={T}
								formatter={(v: number | undefined) => [
									`€${(v ?? 0).toLocaleString()}`,
									'Revenue',
								]}
							/>
							<Area
								type="monotone"
								dataKey="revenue"
								stroke="#10b981"
								strokeWidth={2.5}
								fill="url(#revGrad)"
								dot={{ fill: '#10b981', r: 4 }}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>

				{/* Most booked + Top rated */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
					<div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
						<p className="mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
							Most Booked Services
						</p>
						<ResponsiveContainer width="100%" height={220}>
							<BarChart
								data={appointmentStats.mostBooked}
								layout="vertical"
								margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#f1f5f9"
									horizontal={false}
								/>
								<XAxis
									type="number"
									tick={TICK}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis
									type="category"
									dataKey="name"
									tick={TICK}
									axisLine={false}
									tickLine={false}
									width={90}
								/>
								<Tooltip
									contentStyle={T}
									formatter={(v: number | undefined) => [v ?? 0, 'Bookings']}
								/>
								<Bar
									dataKey="count"
									name="Bookings"
									fill="#2563eb"
									radius={[0, 6, 6, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>

					<div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
						<p className="mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
							Top Rated Categories
						</p>
						<ResponsiveContainer width="100%" height={220}>
							<BarChart
								data={topRated}
								layout="vertical"
								margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#f1f5f9"
									horizontal={false}
								/>
								<XAxis
									type="number"
									domain={[0, 5]}
									tick={TICK}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis
									type="category"
									dataKey="name"
									tick={TICK}
									axisLine={false}
									tickLine={false}
									width={90}
								/>
								<Tooltip
									contentStyle={T}
									formatter={(v: number | undefined) => [
										`${v ?? 0} ★`,
										'Avg Rating',
									]}
								/>
								<Bar
									dataKey="rating"
									name="Avg Rating"
									fill="#f59e0b"
									radius={[0, 6, 6, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>
		</div>
	);
}

export default AdminDashboard;
