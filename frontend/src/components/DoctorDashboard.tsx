import { useNavigate } from 'react-router-dom';
import { AppointmentStatus } from '../types';
import { useUser } from '../features/authentication/useUser';
import { useAppointments } from '../features/appointments/useAppointments';
import { useUpdateAppointment } from '../features/appointments/useUpdateAppointment';
import { getUserPhotoUrl, formatTime } from '../utils/helpers';

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

	const formatDate = (d: Date) =>
		d.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
		});

	return (
		<div className="max-w-7xl mx-auto flex flex-col gap-10 pb-12 animate-in fade-in duration-700">
			{/* Hero */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
						{formatDate(new Date())}
					</p>
					<h2 className="text-4xl font-black text-slate-800 tracking-tight">
						{greeting},{' '}
						<span className="text-indigo-600">
							Dr. {user?.name.split(' ')[0]}
						</span>
					</h2>
					<p className="text-slate-500 mt-2 font-medium">
						Here's your clinical summary for today.
					</p>
				</div>
				<button
					onClick={() => navigate('/appointments')}
					className="self-start md:self-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:-translate-y-0.5 transition-all"
				>
					<i className="fas fa-list-ul mr-2"></i>Full Schedule
				</button>
			</div>

			{/* Two columns */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Needs Confirmation */}
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h3 className="text-xl font-black text-slate-800">
							Needs Confirmation
						</h3>
						{pendingApts.length > 0 && (
							<span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-xl">
								{pendingApts.length} pending
							</span>
						)}
					</div>

					{pendingApts.length === 0 ? (
						<div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
							<i className="fas fa-check-circle text-3xl text-emerald-300 mb-3 block"></i>
							<p className="text-slate-400 font-bold">All caught up!</p>
						</div>
					) : (
						<div className="flex flex-col gap-3">
							{pendingApts.slice(0, 6).map((apt) => (
								<div
									key={apt.id}
									className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4"
								>
									<img
										src={getUserPhotoUrl(undefined, apt.patient.name)}
										className="w-11 h-11 rounded-2xl border-2 border-white shadow-sm flex-shrink-0 object-cover"
										alt=""
									/>
									<div className="flex-1 min-w-0">
										<p className="font-bold text-slate-800 truncate">
											{apt.patient.name}
										</p>
										<p className="text-xs text-slate-500 font-medium">
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
											className="w-9 h-9 bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
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
											className="w-9 h-9 bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
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
						<div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
							<i className="fas fa-calendar-day text-3xl text-slate-300 mb-3 block"></i>
							<p className="text-slate-400 font-bold">
								No confirmed sessions today.
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-0 relative">
							{/* Vertical connector line */}
							<div className="absolute left-[52px] top-5 bottom-5 w-0.5 bg-slate-100 z-0"></div>

							{todaySchedule.map((apt) => (
								<div
									key={apt.id}
									className="flex items-start gap-4 pb-4 last:pb-0"
								>
									{/* Time */}
									<div className="w-[44px] flex-shrink-0 text-right pt-1">
										<p className="text-[11px] font-black text-slate-500 leading-tight">
											{formatTime(apt.date)}
										</p>
									</div>

									{/* Dot */}
									<div className="w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-sm flex-shrink-0 mt-1.5 relative z-10"></div>

									{/* Card */}
									<div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
										<div className="flex items-center gap-3">
											<img
												src={getUserPhotoUrl(undefined, apt.patient.name)}
												className="w-9 h-9 rounded-xl border border-slate-100 flex-shrink-0 object-cover"
												alt=""
											/>
											<div className="flex-1 min-w-0">
												<p className="font-bold text-slate-800 text-sm truncate">
													{apt.patient.name}
												</p>
												<p className="text-[10px] text-slate-400 font-semibold truncate">
													{apt.service?.name}
												</p>
											</div>
											<span
												className={`px-2.5 py-1 text-[10px] font-black rounded-lg flex-shrink-0 ${
													apt.service?.category === 'SURGERY'
														? 'bg-rose-50 text-rose-500'
														: apt.service?.category === 'DIAGNOSTIC'
															? 'bg-amber-50 text-amber-600'
															: 'bg-indigo-50 text-indigo-600'
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
