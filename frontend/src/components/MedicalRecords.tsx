import { useState, useEffect } from 'react';
import { Role } from '../types';
import { useUser } from '../features/authentication/useUser';
import { useMedicalRecords } from '../features/medical-records/useMedicalRecords';
import { useCreateMedicalRecord } from '../features/medical-records/useCreateMedicalRecord';
import { useAppointments } from '../features/appointments/useAppointments';
import MedicalRecordCard from './medical/MedicalRecordCard';
import MedicalRecordForm from './medical/MedicalRecordForm';
import Modal from './ui/Modal';
import Pagination from './ui/Pagination';

function MedicalRecords() {
	const { user } = useUser();
	const { records, count } = useMedicalRecords();
	const { createRecord } = useCreateMedicalRecord();
	const { appointments } = useAppointments();

	const [selectedPatientId, setSelectedPatientId] = useState<string>('');
	const [isAdding, setIsAdding] = useState(false);

	const [diagnosis, setDiagnosis] = useState('');
	const [prescription, setPrescription] = useState('');
	const [notes, setNotes] = useState('');

	// For patients: auto-select themselves once user loads
	useEffect(() => {
		if (user?.role === Role.PATIENT && user._id && !selectedPatientId) {
			setSelectedPatientId(user._id);
		}
	}, [user]);

	// For doctors: derive unique patient list from records
	const patientMap = new Map<
		string,
		{ _id: string; name: string; email: string }
	>();
	records.forEach((r) => {
		if (r.patient?._id && !patientMap.has(r.patient._id)) {
			patientMap.set(r.patient._id, r.patient);
		}
	});
	const patients = Array.from(patientMap.values());
	const selectedPatient = patientMap.get(selectedPatientId);

	const filteredRecords = records
		.filter((r) => r.patient._id === selectedPatientId)
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);

	const handleAddRecord = (e: { preventDefault(): void }) => {
		e.preventDefault();
		if (!selectedPatientId || !diagnosis) return;

		const relevantApt = appointments
			.filter((a) => a.patient._id === selectedPatientId)
			.sort(
				(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
			)[0];

		if (!relevantApt) return;

		createRecord({
			patient: selectedPatientId,
			appointment: relevantApt._id,
			diagnosis,
			prescription,
			notes,
		});

		setIsAdding(false);
		setDiagnosis('');
		setPrescription('');
		setNotes('');
	};

	return (
		<div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div>
					<h2 className="text-4xl font-black text-slate-800 tracking-tight">
						{user?.role === Role.PATIENT
							? 'Your Medical History'
							: 'Clinical Charts'}
					</h2>
					<p className="text-slate-500 mt-2 font-medium">
						Comprehensive health documentation and clinical notes.
					</p>
				</div>

				{(user?.role === Role.DOCTOR || user?.role === Role.ADMIN) && (
					<div className="flex items-center gap-4">
						<select
							value={selectedPatientId}
							onChange={(e) => setSelectedPatientId(e.target.value)}
							className="bg-white px-5 py-3 border border-slate-200 rounded-2xl font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm"
						>
							<option value="">Select Patient Chart</option>
							{patients.map((p) => (
								<option key={p._id} value={p._id}>
									{p.name}
								</option>
							))}
						</select>
						{selectedPatientId && (
							<button
								onClick={() => setIsAdding(true)}
								className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center gap-2 whitespace-nowrap"
							>
								<i className="fas fa-plus"></i> New Entry
							</button>
						)}
					</div>
				)}
			</div>

			{!selectedPatientId ? (
				<div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
					<div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
						<i className="fas fa-folder-open text-3xl"></i>
					</div>
					<h3 className="text-xl font-bold text-slate-400">
						Please select a patient to view their records
					</h3>
				</div>
			) : (
				<div className="space-y-8">
					{selectedPatient &&
						(user?.role === Role.DOCTOR || user?.role === Role.ADMIN) && (
							<div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex items-center gap-6">
								<img
									src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPatient.name)}&background=6366f1&color=fff&size=64`}
									className="w-16 h-16 rounded-2xl border-4 border-white shadow-sm"
									alt=""
								/>
								<div>
									<h4 className="font-bold text-indigo-900 text-lg">
										{selectedPatient.name}
									</h4>
									<p className="text-indigo-600 text-sm font-medium">
										{selectedPatient.email}
									</p>
								</div>
							</div>
						)}

					{filteredRecords.length === 0 ? (
						<div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-sm">
							<p className="text-slate-400 font-bold italic">
								No medical records found for this period.
							</p>
						</div>
					) : (
						<>
							<div className="grid grid-cols-1 gap-8 relative before:absolute before:left-8 before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-100">
								{filteredRecords.map((record) => (
									<MedicalRecordCard
										key={record.id}
										record={record}
										doctor={record.doctor}
									/>
								))}
							</div>
							<Pagination count={count} />
						</>
					)}
				</div>
			)}

			{/* Add Record Modal */}
			<Modal
				isOpen={isAdding}
				onClose={() => setIsAdding(false)}
				title="Add Clinical Entry"
				subtitle={
					selectedPatient ? `Recording for: ${selectedPatient.name}` : undefined
				}
			>
				<MedicalRecordForm
					diagnosis={diagnosis}
					prescription={prescription}
					notes={notes}
					onDiagnosis={setDiagnosis}
					onPrescription={setPrescription}
					onNotes={setNotes}
					onSubmit={handleAddRecord}
					submitLabel="Finalize Medical Record"
				/>
			</Modal>
		</div>
	);
}

export default MedicalRecords;
