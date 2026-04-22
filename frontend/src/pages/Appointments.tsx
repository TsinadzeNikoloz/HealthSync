import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Appointment, AppointmentStatus, Role } from '../types';
import { useUser } from '../features/authentication/useUser';
import { useAppointments } from '../features/appointments/useAppointments';
import { useUpdateAppointment } from '../features/appointments/useUpdateAppointment';
import { useDeleteAppointment } from '../features/appointments/useDeleteAppointment';
import { useCreateMedicalRecord } from '../features/medical-records/useCreateMedicalRecord';
import AppointmentItem from '../features/appointments/AppointmentItem';
import Pagination from '../ui/Pagination';
import Modal from '../ui/Modal';
import MedicalRecordForm from '../features/medical-records/MedicalRecordForm';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';

function Appointments() {
	const { user } = useUser();
	const [searchParams, setSearchParams] = useSearchParams();
	const { appointments, count, isPending } = useAppointments();
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

	const sortBy = searchParams.get('sortBy') || 'date-desc';
	const setSort = (value: string) => {
		const next = new URLSearchParams(searchParams);
		next.set('sortBy', value);
		next.delete('page');
		setSearchParams(next);
	};

	const dateFrom = searchParams.get('dateFrom') || '';
	const dateTo = searchParams.get('dateTo') || '';
	const setDateParam = (key: 'dateFrom' | 'dateTo', value: string) => {
		const next = new URLSearchParams(searchParams);
		if (value) next.set(key, value);
		else next.delete(key);
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
		const apt = appointments.find((a: Appointment) => a._id === id);
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
						id: completingApt._id,
						updates: { status: AppointmentStatus.COMPLETED },
					});
					setCompletingApt(null);
				},
			},
		);
	};

	return (
		<div className="mx-auto flex max-w-7xl flex-col gap-10 pb-20">
			{/* Page Header */}
			<div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
				<div>
					<h2 className="text-4xl font-black tracking-tight text-slate-800">
						{user.role === Role.ADMIN ? 'Global Schedule' : 'My Appointments'}
					</h2>
					<p className="mt-2 font-medium text-slate-500">
						{user.role === Role.PATIENT
							? 'Keep track of your medical visits and health schedule.'
							: 'Managing clinical consultations and patient flow.'}
					</p>
				</div>

				<div className="flex flex-col items-end gap-3">
					{/* Row 1: sort + status filter */}
					<div className="flex items-center gap-3">
						<select
							value={sortBy}
							onChange={(e) => setSort(e.target.value)}
							className="rounded-2xl border border-slate-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10"
						>
							<option value="date-desc">Date: Newest</option>
							<option value="date-asc">Date: Oldest</option>
							<option value="price-desc">Price: High to Low</option>
							<option value="price-asc">Price: Low to High</option>
						</select>

						<div className="flex overflow-x-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-sm">
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
									className={`whitespace-nowrap rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
										filter === s
											? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
											: 'text-slate-400 hover:text-slate-600'
									}`}
								>
									{s}
								</button>
							))}
						</div>
					</div>

					{/* Row 2: date range */}
					<div className="flex items-center gap-2">
						<input
							type="date"
							value={dateFrom}
							onChange={(e) => setDateParam('dateFrom', e.target.value)}
							className="rounded-2xl border border-slate-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10"
						/>
						<span className="text-sm text-slate-400">&mdash;</span>
						<input
							type="date"
							value={dateTo}
							onChange={(e) => setDateParam('dateTo', e.target.value)}
							className="rounded-2xl border border-slate-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10"
						/>
					</div>
				</div>
			</div>

			{/* Appointments List */}
			<div className="flex flex-col gap-4">
				{isPending ? (
					<Spinner />
				) : appointments.length === 0 ? (
					<EmptyState
						icon="fa-calendar-times"
						title={
							filter === 'ALL'
								? 'No appointments yet.'
								: 'No appointments matching this filter.'
						}
					/>
				) : (
					appointments.map((apt: Appointment) => (
						<AppointmentItem
							key={apt._id}
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
				subtitle={
					completingApt ? `Patient: ${completingApt.patient.name}` : undefined
				}
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
