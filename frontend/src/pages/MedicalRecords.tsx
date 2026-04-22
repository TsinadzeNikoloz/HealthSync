import { useState } from 'react';
import { Role } from '../types';
import { useUser } from '../features/authentication/useUser';
import { useMedicalRecords } from '../features/medical-records/useMedicalRecords';
import { usePatientMedicalRecords } from '../features/medical-records/usePatientMedicalRecords';
import { useCreateMedicalRecord } from '../features/medical-records/useCreateMedicalRecord';
import { useAppointments } from '../features/appointments/useAppointments';
import { getUserPhotoUrl } from '../utils/helpers';
import MedicalRecordCard from '../features/medical-records/MedicalRecordCard';
import MedicalRecordForm from '../features/medical-records/MedicalRecordForm';
import EmptyState from '../ui/EmptyState';
import Modal from '../ui/Modal';
import Pagination from '../ui/Pagination';
import Select from '../ui/Select';
import Spinner from '../ui/Spinner';

function MedicalRecords() {
	const { user } = useUser();
	// For patients: paginated own records. For doctors/admins: used to build patient list.
	const { records: allRecords, count, isPending } = useMedicalRecords();
	// For doctors/admins: full record list for the selected patient (no pagination issues).
	const isStaff =
		user?.role === Role.DOCTOR || user?.role === Role.ADMIN;
	const { createRecord } = useCreateMedicalRecord();
	const { appointments } = useAppointments();

	const [selectedPatientId, setSelectedPatientId] = useState<string>('');
	const [isAdding, setIsAdding] = useState(false);

	const [diagnosis, setDiagnosis] = useState('');
	const [prescription, setPrescription] = useState('');
	const [notes, setNotes] = useState('');
	const [appointmentId, setAppointmentId] = useState('');

	// For patients: always their own ID; for doctors/admins: chosen from dropdown
	const effectivePatientId =
		user?.role === Role.PATIENT ? (user._id ?? '') : selectedPatientId;

	const { records: patientRecords, isPending: isPatientPending } =
		usePatientMedicalRecords(isStaff ? effectivePatientId : undefined);

	// Records to display
	const displayRecords = isStaff ? patientRecords : allRecords;
	const isLoadingRecords = isStaff ? isPatientPending : isPending;

	// For doctors: derive unique patient list from all fetched records
	const patientMap = new Map<
		string,
		{ _id: string; name: string; email: string }
	>();
	allRecords.forEach((r) => {
		if (r.patient?._id && !patientMap.has(r.patient._id)) {
			patientMap.set(r.patient._id, r.patient);
		}
	});
	const patients = Array.from(patientMap.values());
	const selectedPatient = patientMap.get(effectivePatientId);

	const patientAppointments = appointments.filter(
		(a) => a.patient?._id === effectivePatientId,
	);

	const handleAddRecord = (e: { preventDefault(): void }) => {
		e.preventDefault();
		if (!effectivePatientId || !diagnosis || !appointmentId) return;

		createRecord({
			patient: effectivePatientId,
			appointment: appointmentId,
			diagnosis,
			prescription,
			notes,
		});

		setIsAdding(false);
		setDiagnosis('');
		setPrescription('');
		setNotes('');
		setAppointmentId('');
	};

	if (isPending) return <Spinner />;

	return (
		<div className="mx-auto flex max-w-6xl flex-col gap-10">
			<div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
				<div>
					<h2 className="text-4xl font-black tracking-tight text-slate-800">
						{user?.role === Role.PATIENT
							? 'Your Medical History'
							: 'Clinical Charts'}
					</h2>
					<p className="mt-2 font-medium text-slate-500">
						Comprehensive health documentation and clinical notes.
					</p>
				</div>

				{isStaff && (
					<div className="flex items-center gap-4">
						<Select
							value={selectedPatientId}
							onChange={(e) => setSelectedPatientId(e.target.value)}
							options={[
								{ value: '', label: 'Select Patient Chart' },
								...patients.map((p) => ({ value: p._id, label: p.name })),
							]}
						/>
						{selectedPatientId && (
							<button
								onClick={() => setIsAdding(true)}
								className="flex items-center gap-2 whitespace-nowrap rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-100"
							>
								<i className="fas fa-plus"></i> New Entry
							</button>
						)}
					</div>
				)}
			</div>

			{!effectivePatientId ? (
				<EmptyState
					icon="fa-folder-open"
					title="Please select a patient to view their records"
				/>
			) : isLoadingRecords ? (
				<Spinner />
			) : (
				<div className="flex flex-col gap-8">
					{selectedPatient && isStaff && (
						<div className="flex items-center gap-6 rounded-3xl border border-blue-100 bg-blue-50 p-6">
							<img
								src={getUserPhotoUrl(undefined, selectedPatient.name)}
								className="h-16 w-16 rounded-2xl border-4 border-white shadow-sm"
								alt=""
							/>
							<div>
								<h4 className="text-lg font-bold text-blue-900">
									{selectedPatient.name}
								</h4>
								<p className="text-sm font-medium text-blue-600">
									{selectedPatient.email}
								</p>
							</div>
						</div>
					)}

					{displayRecords.length === 0 ? (
						<EmptyState
							icon="fa-file-medical"
							title="No medical records found for this patient."
						/>
					) : (
						<>
							<div className="flex flex-col gap-4">
								{displayRecords.map((record) => (
									<MedicalRecordCard
										key={record.id}
										record={record}
										doctor={record.doctor}
									/>
								))}
							</div>
							{/* Only paginate for the patient's own view */}
							{!isStaff && <Pagination count={count} />}
						</>
					)}
				</div>
			)}

			{/* Add Record Modal */}
			<Modal
				isOpen={isAdding}
				onClose={() => {
					setIsAdding(false);
					setDiagnosis('');
					setPrescription('');
					setNotes('');
					setAppointmentId('');
				}}
				title="Add Clinical Entry"
				subtitle={
					selectedPatient ? `Recording for: ${selectedPatient.name}` : undefined
				}
			>
				<MedicalRecordForm
					diagnosis={diagnosis}
					prescription={prescription}
					notes={notes}
					appointmentId={appointmentId}
					appointments={patientAppointments}
					onDiagnosis={setDiagnosis}
					onPrescription={setPrescription}
					onNotes={setNotes}
					onAppointmentId={setAppointmentId}
					onSubmit={handleAddRecord}
					submitLabel="Finalize Medical Record"
				/>
			</Modal>
		</div>
	);
}

export default MedicalRecords;
