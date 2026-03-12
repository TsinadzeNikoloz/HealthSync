import { useNavigate } from 'react-router-dom';
import { useUser } from '../features/authentication/useUser';
import { useAppointments } from '../features/appointments/useAppointments';
import { useMedicalRecords } from '../features/medical-records/useMedicalRecords';
import { AppointmentStatus } from '../types';
import { formatDate, formatTime } from '../utils/helpers';
import Button from './ui/Button';
import AppointmentItem from './appointments/AppointmentItem';

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
		<div className="max-w-7xl mx-auto flex flex-col gap-10 pb-12 animate-in fade-in duration-700">
			{/* Hero */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
						{new Date().toLocaleDateString('en-US', {
							weekday: 'long',
							month: 'long',
							day: 'numeric',
						})}
					</p>
					<h2 className="text-4xl font-black text-slate-800 tracking-tight">
						Hello,{' '}
						<span className="text-indigo-600">{user?.name.split(' ')[0]}</span>
					</h2>
					<p className="text-slate-500 mt-2 font-medium">
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
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Upcoming Appointments */}
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<h3 className="text-xl font-black text-slate-800">
							Upcoming Appointments
						</h3>
						<button
							onClick={() => navigate('/appointments')}
							className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-colors"
						>
							View all <i className="fas fa-arrow-right ml-1"></i>
						</button>
					</div>

					{upcoming.length === 0 ? (
						<div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
							<i className="fas fa-calendar-plus text-3xl text-slate-300 mb-3 block"></i>
							<p className="text-slate-400 font-bold">
								No upcoming appointments.
							</p>
							<button
								onClick={() => navigate('/services')}
								className="mt-4 text-sm font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
							>
								Book one now →
							</button>
						</div>
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
									className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors text-center py-2"
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
							className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-colors"
						>
							View all <i className="fas fa-arrow-right ml-1"></i>
						</button>
					</div>

					{recentRecords.length === 0 ? (
						<div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
							<i className="fas fa-file-medical text-3xl text-slate-300 mb-3 block"></i>
							<p className="text-slate-400 font-bold">
								No medical records yet.
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-3">
							{recentRecords.map((rec) => (
								<div
									key={rec.id}
									className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-start gap-4"
								>
									<div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
										<i className="fas fa-file-medical text-indigo-400"></i>
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-bold text-slate-800 truncate">
											{rec.diagnosis}
										</p>
										<p className="text-xs text-slate-500 font-medium mt-0.5">
											Dr. {rec.doctor.name} · {formatDate(rec.createdAt)}
										</p>
										{rec.appointment?.service?.name && (
											<span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100">
												{rec.appointment.service.name}
											</span>
										)}
									</div>
									<p className="text-[10px] font-bold text-slate-300 flex-shrink-0 pt-1">
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
