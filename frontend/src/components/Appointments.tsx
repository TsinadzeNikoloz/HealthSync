import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Appointment, AppointmentStatus, Role } from '../types';
import { useUser } from '../features/authentication/useUser';
import { useAppointments } from '../features/appointments/useAppointments';
import { useUpdateAppointment } from '../features/appointments/useUpdateAppointment';
import { useDeleteAppointment } from '../features/appointments/useDeleteAppointment';
import { useCreateMedicalRecord } from '../features/medical-records/useCreateMedicalRecord';
import AppointmentItem from './appointments/AppointmentItem';
import StatCard from './dashboard/StatCard';
import Pagination from './ui/Pagination';
import Modal from './ui/Modal';
import MedicalRecordForm from './medical/MedicalRecordForm';


function Appointments() {
	const { user } = useUser();
	const [searchParams, setSearchParams] = useSearchParams();
	const { appointments, count } = useAppointments();
	const { editAppointment, isUpdating } = useUpdateAppointment();
	const { deleteAppointment } = useDeleteAppointment();
	const { createRecord, isCreating } = useCreateMedicalRecord();

	const filter = (searchParams.get('status') || 'ALL') as
		| AppointmentStatus
		| 'ALL';
	const setFilter = (value: AppointmentStatus | 'ALL') => {
		const next = new URLSearchParams(searchParams);
		if (value === 'ALL') next.delete('status');
		else next.set('status', value);
		next.delete('page');
		setSearchParams(next);
	};

	const [completingApt, setCompletingApt] = useState<Appointment | null>(null);
	const [diagnosis, setDiagnosis] = useState('');
	const [prescription, setPrescription] = useState('');
	const [notes, setNotes] = useState('');

	if (!user) return null;

	const handleStatusChange = (id: string, status: AppointmentStatus) => {
		editAppointment({ id, updates: { status } });
	};

	const handleMarkComplete = (id: string) => {
		const apt = appointments.find((a: Appointment) => a.id === id);
		if (!apt) return;
		setCompletingApt(apt);
		setDiagnosis('');
		setPrescription('');
		setNotes('');
	};

	const handleCompleteSubmit = (e: { preventDefault(): void }) => {
		e.preventDefault();
		if (!completingApt) return;
		createRecord(
			{
				patient: completingApt.patient._id,
				appointment: completingApt._id,
				diagnosis,
				prescription,
				notes,
			},
			{
				onSuccess: () => {
					editAppointment({
						id: completingApt.id,
						updates: { status: AppointmentStatus.COMPLETED },
					});
					setCompletingApt(null);
				},
			},
		);
	};

	const stats = {
		total: count,
		pending: appointments.filter(
			(a: Appointment) => a.status === AppointmentStatus.PENDING,
		).length,
		confirmed: appointments.filter(
			(a: Appointment) => a.status === AppointmentStatus.CONFIRMED,
		).length,
		completed: appointments.filter(
			(a: Appointment) => a.status === AppointmentStatus.COMPLETED,
		).length,
	};

	return (
		<div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div>
					<h2 className="text-4xl font-black text-slate-800 tracking-tight">
						{user.role === Role.ADMIN ? 'Global Schedule' : 'My Appointments'}
					</h2>
					<p className="text-slate-500 mt-2 font-medium">
						{user.role === Role.PATIENT
							? 'Keep track of your medical visits and health schedule.'
							: 'Managing clinical consultations and patient flow.'}
					</p>
				</div>

				<div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
					{/* Fix: Using AppointmentStatus enum values instead of raw strings to resolve TypeScript's SetStateAction compatibility issue */}
					{(
						[
							'ALL',
							AppointmentStatus.PENDING,
							AppointmentStatus.CONFIRMED,
							AppointmentStatus.COMPLETED,
							AppointmentStatus.CANCELLED,
						] as const
					).map((s) => (
						<button
							key={s}
							onClick={() => setFilter(s)}
							className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
								filter === s
									? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
									: 'text-slate-400 hover:text-slate-600'
							}`}
						>
							{s}
						</button>
					))}
				</div>
			</div>

			{/* Quick Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard
					label="Total"
					value={stats.total}
					icon="fa-list-ul"
					color="bg-slate-800"
				/>
				<StatCard
					label="Pending"
					value={stats.pending}
					icon="fa-clock"
					color="bg-amber-500"
				/>
				<StatCard
					label="Confirmed"
					value={stats.confirmed}
					icon="fa-check-circle"
					color="bg-emerald-500"
				/>
				<StatCard
					label="Completed"
					value={stats.completed}
					icon="fa-flag-checkered"
					color="bg-indigo-600"
				/>
			</div>

			{/* Appointments List */}
			<div className="space-y-4">
				{appointments.length === 0 ? (
					<div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center">
						<div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
							<i className="fas fa-calendar-times text-3xl"></i>
						</div>
						<h3 className="text-xl font-bold text-slate-400">
							No appointments found matching this filter.
						</h3>
					</div>
				) : (
					appointments.map((apt: Appointment) => (
						<AppointmentItem
							key={apt.id}
							appointment={apt}
							doctor={apt.doctor}
							patient={apt.patient}
							service={apt.service}
							isPatientView={user.role === Role.PATIENT}
							onStatusChange={handleStatusChange}
							onMarkComplete={handleMarkComplete}
							onDelete={
								user.role === Role.ADMIN
									? (id) => deleteAppointment(id)
									: undefined
							}
							isUpdating={isUpdating}
						/>
					))
				)}
			</div>

			<Pagination count={count} />

			{/* Complete Appointment Modal */}
			<Modal
				isOpen={!!completingApt}
				onClose={() => setCompletingApt(null)}
				title="Complete Appointment"
				subtitle={completingApt ? `Patient: ${completingApt.patient.name}` : undefined}
			>
				<MedicalRecordForm
					diagnosis={diagnosis}
					prescription={prescription}
					notes={notes}
					onDiagnosis={setDiagnosis}
					onPrescription={setPrescription}
					onNotes={setNotes}
					onSubmit={handleCompleteSubmit}
					isLoading={isCreating || isUpdating}
					submitLabel="Save Record & Complete"
				/>
			</Modal>
		</div>
	);
}

export default Appointments;
