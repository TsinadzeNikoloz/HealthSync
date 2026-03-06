import React, { useState } from 'react';
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

const inputCls =
	'w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-slate-700';
const labelCls =
	'text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1';

const Appointments: React.FC = () => {
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

	const handleCompleteSubmit = (e: React.FormEvent) => {
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
			{completingApt && (
				<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
					<div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
						<div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
							<div>
								<h3 className="text-2xl font-extrabold text-slate-800">
									Complete Appointment
								</h3>
								<p className="text-sm text-slate-500 mt-1">
									Patient:{' '}
									<span className="font-bold text-slate-700">
										{completingApt.patient.name}
									</span>
								</p>
							</div>
							<button
								onClick={() => setCompletingApt(null)}
								className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
							>
								<i className="fas fa-times"></i>
							</button>
						</div>

						<form
							onSubmit={handleCompleteSubmit}
							className="p-10 flex flex-col gap-6"
						>
							<div className="flex flex-col gap-2">
								<label className={labelCls}>
									Diagnosis <span className="text-rose-400">*</span>
								</label>
								<input
									className={inputCls}
									value={diagnosis}
									onChange={(e) => setDiagnosis(e.target.value)}
									placeholder="e.g. Hypertension Stage 1"
									required
								/>
							</div>

							<div className="flex flex-col gap-2">
								<label className={labelCls}>Prescription</label>
								<textarea
									className={`${inputCls} h-24 resize-none`}
									value={prescription}
									onChange={(e) => setPrescription(e.target.value)}
									placeholder="Medicine name & dosage..."
								/>
							</div>

							<div className="flex flex-col gap-2">
								<label className={labelCls}>Clinical Notes</label>
								<textarea
									className={`${inputCls} h-28 resize-none`}
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder="Confidential clinical observations..."
								/>
							</div>

							<div className="pt-2">
								<button
									type="submit"
									disabled={isCreating || isUpdating}
									className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
								>
									{isCreating || isUpdating
										? 'Saving...'
										: 'Save Record & Complete'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Appointments;
