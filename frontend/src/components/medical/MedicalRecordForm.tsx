const inputCls =
	'w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-slate-700';
const labelCls =
	'text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1';

interface MedicalRecordFormProps {
	diagnosis: string;
	prescription: string;
	notes: string;
	onDiagnosis: (v: string) => void;
	onPrescription: (v: string) => void;
	onNotes: (v: string) => void;
	onSubmit: (e: { preventDefault(): void }) => void;
	isLoading?: boolean;
	submitLabel?: string;
}

export default function MedicalRecordForm({
	diagnosis,
	prescription,
	notes,
	onDiagnosis,
	onPrescription,
	onNotes,
	onSubmit,
	isLoading = false,
	submitLabel = 'Save Record',
}: MedicalRecordFormProps) {
	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<label className={labelCls}>
					Diagnosis <span className="text-rose-400">*</span>
				</label>
				<input
					className={inputCls}
					value={diagnosis}
					onChange={(e) => onDiagnosis(e.target.value)}
					placeholder="e.g. Hypertension Stage 1"
					required
				/>
			</div>

			<div className="flex flex-col gap-2">
				<label className={labelCls}>Prescription</label>
				<textarea
					className={`${inputCls} h-24 resize-none`}
					value={prescription}
					onChange={(e) => onPrescription(e.target.value)}
					placeholder="Medicine name & dosage..."
				/>
			</div>

			<div className="flex flex-col gap-2">
				<label className={labelCls}>Clinical Notes</label>
				<textarea
					className={`${inputCls} h-28 resize-none`}
					value={notes}
					onChange={(e) => onNotes(e.target.value)}
					placeholder="Confidential clinical observations..."
				/>
			</div>

			<div className="pt-2">
				<button
					type="submit"
					disabled={isLoading}
					className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
				>
					{isLoading ? 'Saving...' : submitLabel}
				</button>
			</div>
		</form>
	);
}
