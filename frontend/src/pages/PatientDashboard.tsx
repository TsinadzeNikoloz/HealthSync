import { useNavigate } from 'react-router-dom';
import { useUser } from '../features/authentication/useUser';
import { useAppointments } from '../features/appointments/useAppointments';
import { useMedicalRecords } from '../features/medical-records/useMedicalRecords';
import { AppointmentStatus } from '../types';
import { formatDate, formatTime, formatLongDate } from '../utils/helpers';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import AppointmentItem from '../features/appointments/AppointmentItem';

function PatientDashboard() {
	const navigate = useNavigate();
	const { user } = useUser();
	const { appointments } = useAppointments();
	const { records } = useMedicalRecords();

	const now = new Date();

	const upcoming = appointments
		.filter(
			(a) =>
				(a.status === AppointmentStatus.CONFIRMED ||
					a.status === AppointmentStatus.PENDING) &&
				new Date(a.date) > now,
		)
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	const recentRecords = [...records]
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		)
		.slice(0, 3);

	return (
		<div className="mx-auto flex max-w-7xl flex-col gap-10 pb-12 duration-700 animate-in fade-in">
			{/* Hero */}
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div>
					<p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
						{formatLongDate()}
					</p>
					<h2 className="text-4xl font-black tracking-tight text-slate-800">
						Hello,{' '}
						<span className="text-blue-600">{user?.name.split(' ')[0]}</span>
					</h2>
					<p className="mt-2 font-medium text-slate-500">
						Here's a summary of your health activity.
					</p>
				</div>
				<Button
					onClick={() => navigate('/services')}
					leftIcon={<i className="fas fa-plus"></i>}
					className="self-start md:self-auto"
				>
					New Appointment
				</Button>
			</div>

			{/* Two-column: upcoming + records */}
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				{/* Upcoming Appointments */}
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h3 className="text-xl font-black text-slate-800">
							Upcoming Appointments
						</h3>
						<button
							onClick={() => navigate('/appointments')}
							className="text-[10px] font-black uppercase tracking-widest text-blue-500 transition-colors hover:text-blue-700"
						>
							View all <i className="fas fa-arrow-right ml-1"></i>
						</button>
					</div>

					{upcoming.length === 0 ? (
						<EmptyState
							size="sm"
							icon="fa-calendar-plus"
							title="No upcoming appointments."
							action={
								<button
									onClick={() => navigate('/services')}
									className="text-sm font-bold text-blue-500 transition-colors hover:text-blue-700"
								>
									Book one now →
								</button>
							}
						/>
					) : (
						<div className="flex flex-col gap-3">
							{upcoming.slice(0, 3).map((apt) => (
								<AppointmentItem
									key={apt.id}
									appointment={apt}
									doctor={apt.doctor}
									service={apt.service}
								/>
							))}
							{upcoming.length > 3 && (
								<button
									onClick={() => navigate('/appointments')}
									className="py-2 text-center text-sm font-bold text-slate-400 transition-colors hover:text-blue-600"
								>
									+{upcoming.length - 3} more appointments
								</button>
							)}
						</div>
					)}
				</div>

				{/* Recent Medical Records */}
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h3 className="text-xl font-black text-slate-800">
							Recent Medical Records
						</h3>
						<button
							onClick={() => navigate('/medical-records')}
							className="text-[10px] font-black uppercase tracking-widest text-blue-500 transition-colors hover:text-blue-700"
						>
							View all <i className="fas fa-arrow-right ml-1"></i>
						</button>
					</div>

					{recentRecords.length === 0 ? (
						<EmptyState
							size="sm"
							icon="fa-file-medical"
							title="No medical records yet."
						/>
					) : (
						<div className="flex flex-col gap-3">
							{recentRecords.map((rec) => (
								<div
									key={rec.id}
									className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
								>
									<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
										<i className="fas fa-file-medical text-blue-400"></i>
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-bold text-slate-800">
											{rec.diagnosis}
										</p>
										<p className="mt-0.5 text-xs font-medium text-slate-500">
											Dr. {rec.doctor.name} · {formatDate(rec.createdAt)}
										</p>
										{rec.appointment?.service?.name && (
											<span className="mt-1.5 inline-block rounded-lg border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
												{rec.appointment.service.name}
											</span>
										)}
									</div>
									<p className="flex-shrink-0 pt-1 text-[10px] font-bold text-slate-300">
										{formatTime(rec.createdAt)}
									</p>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default PatientDashboard;
