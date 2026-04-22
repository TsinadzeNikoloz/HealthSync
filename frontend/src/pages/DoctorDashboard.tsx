import { useNavigate } from 'react-router-dom';
import { AppointmentStatus } from '../types';
import { useUser } from '../features/authentication/useUser';
import { useAppointments } from '../features/appointments/useAppointments';
import { useUpdateAppointment } from '../features/appointments/useUpdateAppointment';
import { getUserPhotoUrl, formatTime, formatLongDate } from '../utils/helpers';
import EmptyState from '../ui/EmptyState';

function DoctorDashboard() {
	const navigate = useNavigate();
	const { user } = useUser();
	const { appointments } = useAppointments();
	const { editAppointment, isUpdating } = useUpdateAppointment();

	const today = new Date().toDateString();
	const hour = new Date().getHours();
	const greeting =
		hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

	const todayApts = appointments
		.filter((a) => new Date(a.date).toDateString() === today)
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	const pendingApts = appointments
		.filter((a) => a.status === AppointmentStatus.PENDING)
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	const todaySchedule = todayApts.filter(
		(a) => a.status === AppointmentStatus.CONFIRMED,
	);

	return (
		<div className="mx-auto flex max-w-7xl flex-col gap-10 pb-12 duration-700 animate-in fade-in">
			{/* Hero */}
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div>
					<p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
						{formatLongDate()}
					</p>
					<h2 className="text-4xl font-black tracking-tight text-slate-800">
						{greeting},{' '}
						<span className="text-blue-600">
							Dr. {user?.name.split(' ')[0]}
						</span>
					</h2>
					<p className="mt-2 font-medium text-slate-500">
						Here's your clinical summary for today.
					</p>
				</div>
				<button
					onClick={() => navigate('/appointments')}
					className="self-start rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5 md:self-auto"
				>
					<i className="fas fa-list-ul mr-2"></i>Full Schedule
				</button>
			</div>

			{/* Two columns */}
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				{/* Needs Confirmation */}
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h3 className="text-xl font-black text-slate-800">
							Needs Confirmation
						</h3>
						{pendingApts.length > 0 && (
							<span className="rounded-xl bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
								{pendingApts.length} pending
							</span>
						)}
					</div>

					{pendingApts.length === 0 ? (
						<EmptyState
							size="sm"
							icon="fa-check-circle"
							iconColor="text-blue-300"
							title="All caught up!"
						/>
					) : (
						<div className="flex flex-col gap-3">
							{pendingApts.slice(0, 6).map((apt) => (
								<div
									key={apt.id}
									className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5"
								>
									<img
										src={getUserPhotoUrl(undefined, apt.patient.name)}
										className="h-11 w-11 flex-shrink-0 rounded-2xl border-2 border-white object-cover shadow-sm"
										alt=""
									/>
									<div className="min-w-0 flex-1">
										<p className="truncate font-bold text-slate-800">
											{apt.patient.name}
										</p>
										<p className="text-xs font-medium text-slate-500">
											{apt.service?.name} ·{' '}
											{new Date(apt.date).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
											})}{' '}
											{formatTime(apt.date)}
										</p>
									</div>
									<div className="flex gap-2">
										<button
											onClick={() =>
												editAppointment({
													id: apt.id,
													updates: { status: AppointmentStatus.CONFIRMED },
												})
											}
											disabled={isUpdating}
											className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-all hover:bg-blue-500 hover:text-white disabled:opacity-50"
											title="Confirm"
										>
											<i className="fas fa-check text-xs"></i>
										</button>
										<button
											onClick={() =>
												editAppointment({
													id: apt.id,
													updates: { status: AppointmentStatus.CANCELLED },
												})
											}
											disabled={isUpdating}
											className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-500 transition-all hover:bg-rose-500 hover:text-white disabled:opacity-50"
											title="Cancel"
										>
											<i className="fas fa-times text-xs"></i>
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Today's Schedule */}
				<div className="flex flex-col gap-4">
					<h3 className="text-xl font-black text-slate-800">
						Today's Schedule
					</h3>

					{todaySchedule.length === 0 ? (
						<EmptyState
							size="sm"
							icon="fa-calendar-day"
							title="No confirmed sessions today."
						/>
					) : (
						<div className="relative flex flex-col gap-0">
							{/* Vertical connector line */}
							<div className="absolute bottom-5 left-[52px] top-5 z-0 w-0.5 bg-slate-100"></div>

							{todaySchedule.map((apt) => (
								<div
									key={apt.id}
									className="flex items-start gap-4 pb-4 last:pb-0"
								>
									{/* Time */}
									<div className="w-[44px] flex-shrink-0 pt-1 text-right">
										<p className="text-[11px] font-black leading-tight text-slate-500">
											{formatTime(apt.date)}
										</p>
									</div>

									{/* Dot */}
									<div className="relative z-10 mt-1.5 h-4 w-4 flex-shrink-0 rounded-full border-2 border-white bg-blue-600 shadow-sm"></div>

									{/* Card */}
									<div className="flex-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
										<div className="flex items-center gap-3">
											<img
												src={getUserPhotoUrl(undefined, apt.patient.name)}
												className="h-9 w-9 flex-shrink-0 rounded-xl border border-slate-100 object-cover"
												alt=""
											/>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-bold text-slate-800">
													{apt.patient.name}
												</p>
												<p className="truncate text-[10px] font-semibold text-slate-400">
													{apt.service?.name}
												</p>
											</div>
											<span
												className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-black ${
													apt.service?.category === 'SURGERY'
														? 'bg-rose-50 text-rose-500'
														: apt.service?.category === 'DIAGNOSTIC'
															? 'bg-amber-50 text-amber-600'
															: 'bg-blue-50 text-blue-600'
												}`}
											>
												{apt.service?.category ?? '—'}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default DoctorDashboard;
