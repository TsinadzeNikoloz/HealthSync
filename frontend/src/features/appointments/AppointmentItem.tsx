import { useState } from 'react';
import { Appointment, AppointmentStatus } from '../../types';
import Badge from '../../ui/Badge';
import ConfirmModal from '../../ui/ConfirmModal';
import {
	getUserPhotoUrl,
	formatTime,
	formatCurrency,
} from '../../utils/helpers';

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

const statusAccent: Record<AppointmentStatus, string> = {
	[AppointmentStatus.PENDING]: 'bg-amber-400',
	[AppointmentStatus.CONFIRMED]: 'bg-emerald-500',
	[AppointmentStatus.COMPLETED]: 'bg-blue-500',
	[AppointmentStatus.CANCELLED]: 'bg-rose-400',
};

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

	const dateObj = appointment.date ? new Date(appointment.date) : null;
	const day = dateObj ? dateObj.getDate() : '--';
	const month = dateObj
		? dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
		: '---';
	const weekday = dateObj
		? dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
		: '---';
	const year = dateObj ? dateObj.getFullYear() : null;
	const displayTime =
		appointment.time || (appointment.date ? formatTime(appointment.date) : '');

	const actionButtons = !isPatientView && (
		<div className="flex gap-2">
			{appointment.status === AppointmentStatus.PENDING && onStatusChange && (
				<>
					<button
						onClick={() =>
							onStatusChange(appointment.id, AppointmentStatus.CONFIRMED)
						}
						disabled={isUpdating}
						className="h-11 w-11 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-100 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
						aria-label="Confirm appointment"
					>
						<i className="fas fa-check text-xs"></i>
					</button>
					<button
						onClick={() =>
							onStatusChange(appointment.id, AppointmentStatus.CANCELLED)
						}
						disabled={isUpdating}
						className="h-11 w-11 rounded-xl bg-rose-500 text-white shadow-md shadow-rose-100 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
						aria-label="Cancel appointment"
					>
						<i className="fas fa-times text-xs"></i>
					</button>
				</>
			)}

			{appointment.status === AppointmentStatus.CONFIRMED && onMarkComplete && (
				<>
					{/* Icon-only on mobile, text on sm+ */}
					<button
						onClick={() => onMarkComplete(appointment.id)}
						disabled={isUpdating}
						className="h-11 w-11 rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white disabled:opacity-50 sm:hidden"
						aria-label="Mark complete"
					>
						<i className="fas fa-check text-xs"></i>
					</button>
					<button
						onClick={() => onMarkComplete(appointment.id)}
						disabled={isUpdating}
						className="hidden min-h-[36px] rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-blue-600 transition-colors hover:bg-blue-600 hover:text-white disabled:opacity-50 sm:block"
					>
						Mark Complete
					</button>
				</>
			)}

			{onDelete && (
				<button
					onClick={() => setShowConfirm(true)}
					disabled={isUpdating}
					className="h-11 w-11 rounded-xl bg-rose-50 text-rose-400 transition-colors hover:bg-rose-500 hover:text-white disabled:opacity-50"
					aria-label="Delete appointment"
				>
					<i className="fas fa-trash text-xs"></i>
				</button>
			)}
		</div>
	);

	return (
		<div className="group overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lg">
			{/* Main row */}
			<div className="flex">
				{/* Status accent stripe */}
				<div
					className={`w-1.5 flex-shrink-0 ${statusAccent[appointment.status]}`}
				/>

				{/* Calendar block */}
				<div className="flex min-w-[52px] flex-col items-center justify-center border-r border-slate-50 px-3 py-4 sm:min-w-[68px] sm:px-5 sm:py-5">
					<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
						{month}
					</span>
					<span className="text-2xl font-black tabular-nums leading-none text-slate-800 sm:text-3xl">
						{day}
					</span>
					<span className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
						{weekday}
					</span>
					{year && (
						<span className="mt-0.5 text-[9px] font-bold tabular-nums text-slate-300">
							{year}
						</span>
					)}
				</div>

				{/* Avatar - hidden on mobile */}
				<div className="hidden flex-shrink-0 items-center pl-5 pr-3 sm:flex">
					{!isPatientView && patient ? (
						<img
							src={getUserPhotoUrl(
								patient.photo || patient.avatar,
								patient.name,
							)}
							className="h-11 w-11 rounded-xl border-2 border-white shadow-sm transition-transform group-hover:scale-105"
							alt={patient.name}
						/>
					) : (
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500 shadow-sm transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
							<i className="fas fa-stethoscope text-sm"></i>
						</div>
					)}
				</div>

				{/* Main info */}
				<div className="min-w-0 flex-1 px-3 py-4 sm:py-5">
					<h4 className="truncate text-sm font-black text-slate-800 sm:text-base">
						{service?.name || 'Medical Consultation'}
					</h4>
					<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
						<p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-500">
							<i className="fas fa-user text-[10px] text-blue-400/70"></i>
							{isPatientView ? `Dr. ${doctor?.name}` : patient?.name}
						</p>
						{!isPatientView && doctor?.name && (
							<p className="hidden items-center gap-1.5 truncate text-sm font-semibold text-slate-400 sm:flex">
								<i className="fas fa-user-doctor text-[10px] text-blue-400/70"></i>
								Dr. {doctor.name}
							</p>
						)}
						{service && service.price != null && (
							<span className="hidden rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-blue-600 sm:inline">
								{formatCurrency(service.price)}
							</span>
						)}
					</div>
				</div>

				{/* Right section - sm+ only */}
				<div className="hidden flex-shrink-0 items-center gap-4 px-5 py-5 sm:flex">
					{displayTime && (
						<div className="flex flex-col items-end gap-1">
							<p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
								Time
							</p>
							<p className="text-sm font-black tabular-nums text-slate-700">
								{displayTime}
							</p>
						</div>
					)}
					<Badge status={appointment.status} />
					{actionButtons}
				</div>
			</div>

			{/* Mobile bottom bar */}
			<div className="flex items-center justify-between px-4 pb-3 pl-5 sm:hidden">
				<div className="flex items-center gap-2">
					{displayTime && (
						<span className="text-xs font-black tabular-nums text-slate-400">
							{displayTime}
						</span>
					)}
					<Badge status={appointment.status} />
				</div>
				{actionButtons}
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
