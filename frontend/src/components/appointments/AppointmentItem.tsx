import { useState } from 'react';
import { Appointment, AppointmentStatus } from '../../types';
import Badge from '../ui/Badge';
import ConfirmModal from '../ui/ConfirmModal';
import { getUserPhotoUrl, formatTime } from '../../utils/helpers';

interface AppointmentItemProps {
	appointment: Appointment;
	doctor?: { name?: string };
	patient?: { name?: string; avatar?: string; photo?: string };
	service?: { name?: string; price?: number };
	isPatientView?: boolean;
	onStatusChange?: (id: string, status: AppointmentStatus) => void;
	onMarkComplete?: (id: string) => void;
	onDelete?: (id: string) => void;
	isUpdating?: boolean;
}

function AppointmentItem({
	appointment,
	doctor,
	patient,
	service,
	isPatientView,
	onStatusChange,
	onMarkComplete,
	onDelete,
	isUpdating,
}: AppointmentItemProps) {
	const [showConfirm, setShowConfirm] = useState(false);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	const displayDate = appointment.date
		? new Date(appointment.date).toLocaleDateString()
		: '';
	const displayTime =
		appointment.time ||
		(appointment.date ? formatTime(appointment.date) : '');

	return (
		<div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 card-hover group transition-all">
			{/* Icon or Avatar Section */}
			<div className="flex-shrink-0">
				{!isPatientView && patient ? (
					<img
						src={getUserPhotoUrl(patient.photo || patient.avatar, patient.name)}
						className="w-16 h-16 rounded-2xl border-2 border-white shadow-md group-hover:scale-110 transition-transform"
						alt={patient.name}
					/>
				) : (
					<div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500 shadow-sm">
						<i className="fas fa-calendar-check text-2xl"></i>
					</div>
				)}
			</div>

			{/* Main Info */}
			<div className="flex-1 text-center md:text-left">
				<h4 className="font-black text-slate-800 text-lg">
					{service?.name || 'Medical Consultation'}
				</h4>
				<div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-1 flex-wrap">
					<p className="text-slate-500 text-sm font-bold flex items-center gap-2">
						<i className="fas fa-user text-indigo-400/60"></i>
						{isPatientView ? `Dr. ${doctor?.name}` : patient?.name}
					</p>
					{!isPatientView && doctor?.name && (
						<p className="text-slate-400 text-sm font-bold flex items-center gap-2">
							<i className="fas fa-user-md text-indigo-400/60"></i>
							Dr. {doctor.name}
						</p>
					)}
					{!isPatientView && service && (
						<span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-lg">
							{formatCurrency(service.price ?? 0)}
						</span>
					)}
				</div>
			</div>

			{/* Date & Time */}
			<div className="flex flex-col items-center md:items-end gap-1 px-6 md:border-l border-slate-50">
				<p className="font-black text-slate-900">{displayDate}</p>
				<p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
					{displayTime}
				</p>
			</div>

			{/* Status & Actions */}
			<div className="flex items-center gap-4">
				<Badge status={appointment.status} />

				{!isPatientView && (
					<div className="flex gap-2">
						{appointment.status === AppointmentStatus.PENDING &&
							onStatusChange && (
								<>
									<button
										onClick={() =>
											onStatusChange(
												appointment.id,
												AppointmentStatus.CONFIRMED,
											)
										}
										disabled={isUpdating}
										className="w-10 h-10 bg-emerald-500 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
										title="Confirm"
									>
										<i className="fas fa-check text-xs"></i>
									</button>
									<button
										onClick={() =>
											onStatusChange(
												appointment.id,
												AppointmentStatus.CANCELLED,
											)
										}
										disabled={isUpdating}
										className="w-10 h-10 bg-rose-500 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-rose-100 disabled:opacity-50"
										title="Cancel"
									>
										<i className="fas fa-times text-xs"></i>
									</button>
								</>
							)}

						{appointment.status === AppointmentStatus.CONFIRMED &&
							onMarkComplete && (
								<button
									onClick={() => onMarkComplete(appointment.id)}
									disabled={isUpdating}
									className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 disabled:opacity-50"
								>
									Mark Complete
								</button>
							)}

						{onDelete && (
							<button
								onClick={() => setShowConfirm(true)}
								disabled={isUpdating}
								className="w-10 h-10 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
								title="Delete appointment"
							>
								<i className="fas fa-trash text-xs"></i>
							</button>
						)}
					</div>
				)}
			</div>

			{showConfirm && onDelete && (
				<ConfirmModal
					title="Delete Appointment"
					message="Are you sure you want to delete this appointment? This action cannot be undone."
					confirmLabel="Delete"
					onConfirm={() => {
						setShowConfirm(false);
						onDelete(appointment.id);
					}}
					onCancel={() => setShowConfirm(false)}
				/>
			)}
		</div>
	);
}

export default AppointmentItem;
