import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../features/authentication/useUser';
import { useServices } from '../features/services/useServices';
import { useDeleteService } from '../features/services/useDeleteService';
import { useEditService } from '../features/services/useEditService';
import { useCreateService } from '../features/services/useCreateService';
import { useDoctors } from '../features/doctors/useDoctors';
import { Service } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import ServiceCard from '../features/services/ServiceCard';
import ServiceForm, { ServiceFormData } from '../features/services/ServiceForm';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import Modal from '../ui/Modal';
import Pagination from '../ui/Pagination';
import Spinner from '../ui/Spinner';
import { SERVICES_PAGE_SIZE } from '../utils/constants';

const emptyForm: ServiceFormData = {
	name: '',
	summary: '',
	price: '',
	priceDiscount: '',
	duration: '',
	category: '',
};

function Services() {
	const [searchParams, setSearchParams] = useSearchParams();
	const { user } = useUser();
	const { services, count, isPending } = useServices();
	const { deleteService } = useDeleteService();
	const { editService, isEditing } = useEditService();
	const { createService, isCreating } = useCreateService();
	const { doctors: allDoctors } = useDoctors();

	const isAdmin = user?.role === 'ADMIN';

	const search = searchParams.get('search') || '';
	const [inputValue, setInputValue] = useState(search);
	const debouncedSearch = useDebounce(inputValue);

	useEffect(() => {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (debouncedSearch) next.set('search', debouncedSearch);
			else next.delete('search');
			next.delete('page');
			return next;
		});
	}, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

	const [editingService, setEditingService] = useState<Service | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [form, setForm] = useState<ServiceFormData>(emptyForm);
	const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);

	const updateForm = (updates: Partial<ServiceFormData>) =>
		setForm((f) => ({ ...f, ...updates }));
	const toggleDoctor = (id: string) =>
		setSelectedDoctors((prev) =>
			prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
		);

	const openAdd = () => {
		setForm(emptyForm);
		setSelectedDoctors([]);
		setIsAdding(true);
	};
	const openEdit = (service: Service) => {
		setEditingService(service);
		setForm({
			name: service.name,
			summary: service.summary,
			price: String(service.price),
			priceDiscount: service.priceDiscount ? String(service.priceDiscount) : '',
			duration: String(service.duration),
			category: service.category,
		});
		setSelectedDoctors(service.doctors?.map((d) => d._id) ?? []);
	};

	const buildFormData = (imageFile: File | null) => {
		const fd = new FormData();
		fd.append('name', form.name);
		fd.append('summary', form.summary);
		fd.append('price', form.price);
		if (form.priceDiscount) fd.append('priceDiscount', form.priceDiscount);
		fd.append('duration', form.duration);
		fd.append('category', form.category);
		selectedDoctors.forEach((id) => fd.append('doctors', id));
		if (imageFile) fd.append('imageCover', imageFile);
		return fd;
	};

	const handleAddSubmit = (
		e: { preventDefault(): void },
		imageFile: File | null,
	) => {
		e.preventDefault();
		createService(buildFormData(imageFile), {
			onSuccess: () => {
				setIsAdding(false);
				setForm(emptyForm);
				setSelectedDoctors([]);
			},
		});
	};

	const handleEditSubmit = (
		e: { preventDefault(): void },
		imageFile: File | null,
	) => {
		e.preventDefault();
		if (!editingService) return;
		editService(
			{ id: editingService.id, formData: buildFormData(imageFile) },
			{ onSuccess: () => setEditingService(null) },
		);
	};

	return (
		<div className="mx-auto max-w-7xl pb-12 duration-500 animate-in fade-in">
			<div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
				<div>
					<h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
						{isAdmin ? 'Clinic Inventory' : 'Our Specializations'}
					</h2>
					<p className="mt-2 font-medium text-slate-500">
						{isAdmin
							? 'Manage the available medical services and pricing.'
							: 'Schedule a session with our world-class medical team.'}
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<div className="group relative">
						<i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-300 transition-colors group-focus-within:text-blue-500"></i>
						<input
							type="text"
							placeholder="Search services..."
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 sm:w-56"
						/>
						{inputValue && (
							<button
								type="button"
								onClick={() => setInputValue('')}
								aria-label="Clear search"
								className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-300 transition-colors hover:text-slate-500"
							>
								<i className="fas fa-times text-xs"></i>
							</button>
						)}
					</div>
					{isAdmin && (
						<Button
							leftIcon={<i className="fas fa-plus"></i>}
							onClick={openAdd}
						>
							Add New Service
						</Button>
					)}
				</div>
			</div>

			{isPending ? (
				<Spinner />
			) : services.length === 0 ? (
				<EmptyState
					icon="fa-stethoscope"
					iconBg="bg-blue-50"
					iconColor="text-blue-300"
					title={
						search ? `No results for "${search}"` : 'No services available yet'
					}
					description={
						search ? 'Try a different search term.' : 'Check back soon.'
					}
				/>
			) : (
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
					{services.map((service, index) => (
						<div
							key={service.id}
							className="duration-500 animate-in fade-in slide-in-from-bottom-4"
							style={{ animationDelay: `${Math.min(index, 5) * 80}ms` }}
						>
							<ServiceCard
								service={service}
								isAdmin={isAdmin}
								onEdit={isAdmin ? openEdit : undefined}
								onDelete={isAdmin ? (id) => deleteService(id) : undefined}
							/>
						</div>
					))}
				</div>
			)}

			<Pagination count={count} pageSize={SERVICES_PAGE_SIZE} />

			<Modal
				isOpen={isAdding}
				onClose={() => setIsAdding(false)}
				title="New Service"
			>
				<ServiceForm
					form={form}
					onChange={updateForm}
					selectedDoctors={selectedDoctors}
					onToggleDoctor={toggleDoctor}
					allDoctors={allDoctors}
					onSubmit={handleAddSubmit}
					isLoading={isCreating}
					submitLabel="Create Service"
				/>
			</Modal>

			<Modal
				isOpen={!!editingService}
				onClose={() => setEditingService(null)}
				title="Edit Service"
				subtitle={editingService?.name}
			>
				<ServiceForm
					form={form}
					onChange={updateForm}
					selectedDoctors={selectedDoctors}
					onToggleDoctor={toggleDoctor}
					allDoctors={allDoctors}
					onSubmit={handleEditSubmit}
					isLoading={isEditing}
					submitLabel="Save Changes"
					existingImage={editingService?.imageCover}
				/>
			</Modal>
		</div>
	);
}

export default Services;
