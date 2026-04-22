import { MedicalRecord } from '../../types';
import { generateMedicalRecordPDF } from '../../utils/generateMedicalRecordPDF';

interface MedicalRecordCardProps {
	record: MedicalRecord;
	doctor?: { name?: string };
}

function MedicalRecordCard({ record, doctor }: MedicalRecordCardProps) {
	const dateObj = new Date(record.createdAt);
	const day = dateObj.getDate();
	const month = dateObj
		.toLocaleDateString('en-US', { month: 'short' })
		.toUpperCase();
	const year = dateObj.getFullYear();

	return (
		<div className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-100 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-md sm:flex-row">
			{/* Indigo left panel - date + doctor */}
			<div className="flex flex-shrink-0 items-center justify-between gap-4 bg-blue-600 px-6 py-4 sm:min-w-[100px] sm:flex-col sm:items-center sm:justify-between sm:gap-0 sm:py-6">
				<div className="text-center">
					<p className="text-xs font-black uppercase tracking-widest text-blue-100">
						{month}
					</p>
					<p className="mt-0.5 text-4xl font-black tabular-nums leading-none text-white">
						{day}
					</p>
					<p className="mt-1 text-xs font-black tabular-nums text-blue-100">
						{year}
					</p>
				</div>
				<div className="text-center sm:mt-4">
					<p className="text-xs font-black uppercase tracking-widest text-blue-100">
						Dr.
					</p>
					<p className="mt-0.5 max-w-[80px] truncate text-xs font-black leading-tight text-white">
						{doctor?.name || 'Unknown'}
					</p>
				</div>
			</div>

			{/* White right panel - content */}
			<div className="flex min-w-0 flex-1 flex-col justify-between gap-4 bg-white p-6">
				<div>
					<h3 className="text-xl font-black leading-tight tracking-tight text-slate-800 transition-colors duration-300 group-hover:text-blue-700">
						{record.diagnosis}
					</h3>

					{record.appointment?.service?.name && (
						<div className="mt-3 flex items-start gap-2">
							<span className="mt-0.5 flex-shrink-0 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
								Service
							</span>
							<p className="text-sm font-semibold leading-relaxed text-slate-600">
								{record.appointment.service.name}
							</p>
						</div>
					)}

					{record.prescription && (
						<div className="mt-3 flex items-start gap-2">
							<span className="mt-0.5 flex-shrink-0 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
								Prescription
							</span>
							<p className="text-sm font-semibold leading-relaxed text-slate-600">
								{record.prescription}
							</p>
						</div>
					)}

					{record.notes && (
						<div className="mt-3 flex items-start gap-2">
							<span className="mt-0.5 flex-shrink-0 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
								Notes
							</span>
							<p className="text-sm font-semibold leading-relaxed text-slate-600">
								{record.notes}
							</p>
						</div>
					)}
				</div>

				<div className="flex justify-end">
					<button
						onClick={() => generateMedicalRecordPDF(record)}
						aria-label="Download PDF for this medical record"
						className="min-h-[44px] whitespace-nowrap rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
					>
						<i className="fas fa-file-pdf mr-1"></i> PDF
					</button>
				</div>
			</div>
		</div>
	);
}

export default MedicalRecordCard;
