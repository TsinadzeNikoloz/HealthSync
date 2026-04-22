import { useRef, useState } from 'react';
import { ServiceCategory, User } from '../../types';
import Button from '../../ui/Button';
import Select from '../../ui/Select';

const CATEGORIES: ServiceCategory[] = [
	'CONSULTATION',
	'TREATMENT',
	'DIAGNOSTIC',
	'THERAPY',
	'SURGERY',
];

export interface ServiceFormData {
	name: string;
	summary: string;
	price: string;
	priceDiscount: string;
	duration: string;
	category: ServiceCategory | '';
}

interface ServiceFormProps {
	form: ServiceFormData;
	onChange: (updates: Partial<ServiceFormData>) => void;
	selectedDoctors: string[];
	onToggleDoctor: (id: string) => void;
	allDoctors: User[];
	onSubmit: (e: { preventDefault(): void }, imageFile: File | null) => void;
	isLoading: boolean;
	submitLabel: string;
	existingImage?: string;
}

const inputCls =
	'w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none font-semibold text-slate-700 transition-colors';
const labelCls =
	'text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1';

export default function ServiceForm({
	form,
	onChange,
	selectedDoctors,
	onToggleDoctor,
	allDoctors,
	onSubmit,
	isLoading,
	submitLabel,
	existingImage,
}: ServiceFormProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setImageFile(file);
		setImagePreview(URL.createObjectURL(file));
	};

	const preview = imagePreview || existingImage;

	return (
		<form onSubmit={(e) => onSubmit(e, imageFile)} className="space-y-5">
			<div className="space-y-2">
				<label className={labelCls}>Service Name</label>
				<input
					className={inputCls}
					value={form.name}
					onChange={(e) => onChange({ name: e.target.value })}
					placeholder="e.g. Cardiology Consultation"
					required
				/>
			</div>
			<div className="space-y-2">
				<label className={labelCls}>Summary</label>
				<textarea
					className={`${inputCls} h-20 resize-none`}
					value={form.summary}
					onChange={(e) => onChange({ summary: e.target.value })}
					placeholder="Brief description..."
					required
				/>
			</div>
			<div className="space-y-2">
				<label className={labelCls}>Cover Image</label>
				<div
					onClick={() => fileInputRef.current?.click()}
					className="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 transition-colors hover:border-blue-300 hover:bg-blue-50/30"
				>
					{preview ? (
						<img
							src={preview}
							alt="Cover"
							className="h-12 w-16 rounded-xl object-cover"
						/>
					) : (
						<div className="flex h-12 w-16 items-center justify-center rounded-xl bg-slate-200">
							<i className="fas fa-image text-slate-400"></i>
						</div>
					)}
					<div>
						<p className="text-sm font-semibold text-slate-700">
							{imageFile ? imageFile.name : 'Click to upload image'}
						</p>
						<p className="text-xs text-slate-400">JPG, PNG, WEBP</p>
					</div>
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleImageChange}
					className="hidden"
				/>
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<label className={labelCls}>Price ($)</label>
					<input
						type="number"
						min="0"
						className={inputCls}
						value={form.price}
						onChange={(e) => onChange({ price: e.target.value })}
						required
					/>
				</div>
				<div className="space-y-2">
					<label className={labelCls}>Discount Price ($)</label>
					<input
						type="number"
						min="0"
						className={inputCls}
						value={form.priceDiscount}
						onChange={(e) => onChange({ priceDiscount: e.target.value })}
						placeholder="Optional"
					/>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<label className={labelCls}>Duration (min)</label>
					<input
						type="number"
						min="0"
						className={inputCls}
						value={form.duration}
						onChange={(e) => onChange({ duration: e.target.value })}
						required
					/>
				</div>
				<div className="space-y-2">
					<Select
						label="Category"
						value={form.category}
						onChange={(e) =>
							onChange({ category: e.target.value as ServiceCategory })
						}
						options={[
							{ value: '', label: 'Select category' },
							...CATEGORIES.map((c) => ({ value: c, label: c })),
						]}
						required
					/>
				</div>
			</div>
			<div className="space-y-2">
				<label className={labelCls}>Assign Doctors</label>
				<div className="flex max-h-40 flex-col gap-2 overflow-y-auto pr-1">
					{allDoctors.length === 0 && (
						<p className="px-2 text-sm text-slate-400">No doctors available</p>
					)}
					{allDoctors.map((doc) => (
						<label
							key={doc._id}
							className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors hover:border-blue-200"
						>
							<input
								type="checkbox"
								checked={selectedDoctors.includes(doc._id)}
								onChange={() => onToggleDoctor(doc._id)}
								className="h-4 w-4 accent-blue-600"
							/>
							<div className="flex flex-col">
								<span className="text-sm font-semibold text-slate-700">
									{doc.name}
								</span>
								{doc.specialty && (
									<span className="text-xs text-slate-400">
										{doc.specialty}
									</span>
								)}
							</div>
						</label>
					))}
				</div>
			</div>
			<div className="pt-4">
				<Button type="submit" className="w-full py-5" disabled={isLoading}>
					{isLoading
						? `${submitLabel.replace(/^(\w+)/, '$1ing...')}`
						: submitLabel}
				</Button>
			</div>
		</form>
	);
}
