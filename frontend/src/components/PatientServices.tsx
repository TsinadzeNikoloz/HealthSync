import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../features/authentication/useUser';
import { useServices } from '../features/services/useServices';
import { useDeleteService } from '../features/services/useDeleteService';
import { useEditService } from '../features/services/useEditService';
import { useCreateService } from '../features/services/useCreateService';
import { useDoctors } from '../features/doctors/useDoctors';
import { Service, ServiceCategory } from '../types';
import ServiceCard from './services/ServiceCard';
import ServiceForm, { ServiceFormData } from './services/ServiceForm';
import Button from './ui/Button';
import Modal from './ui/Modal';

const emptyForm: ServiceFormData = {
	name: '',
	summary: '',
	price: '',
	duration: '',
	maxPatients: '',
	category: '',
	imageCover: '',
};

function PatientServices() {
	const [searchParams, setSearchParams] = useSearchParams();
	const { user } = useUser();
	const { services } = useServices();
	const { deleteService } = useDeleteService();
	const { editService, isEditing } = useEditService();
	const { createService, isCreating } = useCreateService();
	const { doctors: allDoctors } = useDoctors();

	const isAdmin = user?.role === 'ADMIN';

	const search = searchParams.get('search') || '';
	const setSearch = (value: string) => {
		const next = new URLSearchParams(searchParams);
		if (value) next.set('search', value);
		else next.delete('search');
		next.delete('page');
		setSearchParams(next);
	};

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
			duration: String(service.duration),
			maxPatients: String(service.maxPatients),
			category: service.category,
			imageCover: service.imageCover || '',
		});
		setSelectedDoctors(service.doctors?.map((d) => d._id) ?? []);
	};

	const handleAddSubmit = (e: { preventDefault(): void }) => {
		e.preventDefault();
		createService(
			{
				name: form.name,
				summary: form.summary,
				price: Number(form.price),
				duration: Number(form.duration),
				maxPatients: Number(form.maxPatients),
				category: form.category as ServiceCategory,
				imageCover: form.imageCover,
				doctors: selectedDoctors,
			},
			{
				onSuccess: () => {
					setIsAdding(false);
					setForm(emptyForm);
					setSelectedDoctors([]);
				},
			},
		);
	};

	const handleEditSubmit = (e: { preventDefault(): void }) => {
		e.preventDefault();
		if (!editingService) return;
		editService(
			{
				id: editingService.id,
				updates: {
					name: form.name,
					summary: form.summary,
					price: Number(form.price),
					duration: Number(form.duration),
					maxPatients: Number(form.maxPatients),
					category: form.category as ServiceCategory,
					doctors: selectedDoctors,
				},
			},
			{ onSuccess: () => setEditingService(null) },
		);
	};

	return (
		<div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
			<div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div>
					<h2 className="text-4xl font-black text-slate-900 tracking-tight">
						{isAdmin ? 'Clinic Inventory' : 'Our Specializations'}
					</h2>
					<p className="text-slate-500 text-lg mt-2 font-medium">
						{isAdmin
							? 'Manage the available medical services and pricing.'
							: 'Schedule a session with our world-class medical team.'}
					</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="relative group">
						<i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors text-sm"></i>
						<input
							type="text"
							placeholder="Search services..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 w-56 transition-all"
						/>
					</div>
					{isAdmin && (
						<Button
							leftIcon={(<i className="fas fa-plus"></i>)}
							onClick={openAdd}
						>
							Add New Service
						</Button>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
				{services.map((service) => (
					<ServiceCard
						key={service.id}
						service={service}
						isAdmin={isAdmin}
						onEdit={isAdmin ? openEdit : undefined}
						onDelete={isAdmin ? (id) => deleteService(id) : undefined}
					/>
				))}
			</div>

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
					showImageField
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
				/>
			</Modal>
		</div>
	);
}

export default PatientServices;
