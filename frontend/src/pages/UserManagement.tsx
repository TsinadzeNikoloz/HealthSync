import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Pagination from '../ui/Pagination';
import ConfirmModal from '../ui/ConfirmModal';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Spinner from '../ui/Spinner';
import { getUserPhotoUrl } from '../utils/helpers';
import { Role } from '../types';
import { useUser } from '../features/authentication/useUser';
import { useUsers } from '../features/users/useUsers';
import { useDeleteUser } from '../features/users/useDeleteUser';
import { useUpdateUser } from '../features/users/useUpdateUser';
import { useCreateUser } from '../features/users/useCreateUser';
import { useDebounce } from '../hooks/useDebounce';

const emptyForm = {
	name: '',
	email: '',
	password: '',
	passwordConfirm: '',
	role: Role.PATIENT as Role,
	specialty: '',
};

function UserManagement() {
	const { user: currentUser } = useUser();
	const { users, count, isPending } = useUsers();
	const { deleteUser } = useDeleteUser();
	const { updateUserField, isUpdating } = useUpdateUser();
	const { createUser, isCreating } = useCreateUser();

	const [searchParams, setSearchParams] = useSearchParams();
	const search = searchParams.get('search') || '';
	const [inputValue, setInputValue] = useState(search);
	const debouncedSearch = useDebounce(inputValue);
	const [pendingDelete, setPendingDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [form, setForm] = useState(emptyForm);
	const [formError, setFormError] = useState('');

	useEffect(() => {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (debouncedSearch) next.set('search', debouncedSearch);
			else next.delete('search');
			next.set('page', '1');
			return next;
		});
	}, [debouncedSearch, setSearchParams]);

	const handleRoleChange = (userId: string, newRole: Role) => {
		updateUserField({ id: userId, updates: { role: newRole } });
	};

	const handleDeleteUser = (userId: string, userName: string) => {
		setPendingDelete({ id: userId, name: userName });
	};

	const handleCreateSubmit = (e: { preventDefault(): void }) => {
		e.preventDefault();
		setFormError('');
		if (form.password !== form.passwordConfirm) {
			setFormError('Passwords do not match');
			return;
		}
		const payload = {
			name: form.name,
			email: form.email,
			password: form.password,
			passwordConfirm: form.passwordConfirm,
			role: form.role,
			...(form.role === Role.DOCTOR && form.specialty ? { specialty: form.specialty } : {}),
		};
		createUser(payload, {
			onSuccess: () => {
				setIsAdding(false);
				setForm(emptyForm);
				setFormError('');
			},
		});
	};

	if (isPending) return <Spinner />;

	return (
		<div className="mx-auto max-w-7xl space-y-8 duration-700 animate-in fade-in slide-in-from-bottom-4">
			{/* Page Header and search */}
			<div className="flex flex-col justify-between gap-6 px-2 md:flex-row md:items-center">
				<div>
					<h2 className="text-4xl font-black tracking-tight text-slate-800">
						User Management
					</h2>
					<p className="mt-2 font-medium text-slate-500">
						Control access levels and manage clinic staff/patients.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<div className="group relative w-full md:w-72">
						<i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-blue-500"></i>
						<label htmlFor="user-search" className="sr-only">
							Search users
						</label>
						<input
							id="user-search"
							type="text"
							placeholder="Search by name or email..."
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pl-14 pr-12 font-semibold text-slate-700 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
						/>
						{inputValue && (
							<button
								type="button"
								onClick={() => setInputValue('')}
								aria-label="Clear search"
								className="absolute right-5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-300 transition-colors hover:text-slate-500"
							>
								<i className="fas fa-times text-xs"></i>
							</button>
						)}
					</div>
					<Button
						leftIcon={<i className="fas fa-plus"></i>}
						onClick={() => { setIsAdding(true); setForm(emptyForm); setFormError(''); }}
					>
						Add User
					</Button>
				</div>
			</div>

			{/* The users table */}
			<div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
				<div className="overflow-x-auto">
					<table className="w-full border-collapse text-left">
						<thead className="border-b border-slate-100 bg-slate-50/50">
							<tr>
								<th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:px-8 sm:py-6">
									User Profile
								</th>
								<th className="hidden px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:table-cell">
									Contact Information
								</th>
								<th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:px-8 sm:py-6">
									Role
								</th>
								<th className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 sm:px-8 sm:py-6">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-50">
							{users.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										className="px-8 py-20 text-center font-bold text-slate-400"
									>
										No users found matching your search.
									</td>
								</tr>
							) : (
								users.map((user) => (
									<tr
										key={user.id}
										className="group transition-all hover:bg-blue-50/30"
									>
										<td className="px-4 py-4 sm:px-8 sm:py-6">
											<div className="flex items-center gap-4">
												<div className="relative">
													<img
														src={getUserPhotoUrl(user.photo, user.name)}
														className="h-12 w-12 rounded-2xl border-2 border-white shadow-md transition-transform group-hover:scale-110"
														alt=""
													/>
													<div
														className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${user.role === Role.ADMIN ? 'bg-rose-500' : user.role === Role.DOCTOR ? 'bg-emerald-500' : 'bg-blue-500'}`}
													></div>
												</div>
												<div>
													<p className="font-bold text-slate-800 transition-colors group-hover:text-blue-600">
														{user.name}
													</p>
													<p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
														ID: #{user.id.slice(-8).toUpperCase()}
													</p>
												</div>
											</div>
										</td>
										<td className="hidden px-8 py-6 sm:table-cell">
											<p className="text-sm font-semibold text-slate-700">
												{user.email}
											</p>
											<p className="text-[10px] font-bold text-slate-400">
												{user.phone || 'No Phone Linked'}
											</p>
										</td>
										<td className="px-4 py-4 sm:px-8 sm:py-6">
											<div className="relative w-32 sm:w-40">
												<select
													value={user.role}
													disabled={isUpdating || user.id === currentUser?.id}
													onChange={(e) =>
														handleRoleChange(user.id, e.target.value as Role)
													}
													className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-100 bg-slate-50 py-2.5 pl-4 pr-10 text-xs font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
												>
													<option value={Role.PATIENT}>Patient</option>
													<option value={Role.DOCTOR}>Doctor</option>
													<option value={Role.ADMIN}>Admin</option>
												</select>
												<i className="fas fa-chevron-down pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-300"></i>
											</div>
										</td>
										<td className="px-4 py-4 text-right sm:px-8 sm:py-6">
											{user.id !== currentUser?.id ? (
												<button
													onClick={() => handleDeleteUser(user.id, user.name)}
													className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-600"
													aria-label={`Delete ${user.name}`}
												>
													<i className="fas fa-trash-alt text-sm"></i>
												</button>
											) : (
												<span className="pr-2 text-[10px] font-black uppercase italic tracking-widest text-slate-300">
													Self Account
												</span>
											)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-8 sm:py-6">
					<Pagination count={count} />
				</div>
			</div>

			{/* Create User Modal */}
			<Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="Add New User">
				<form onSubmit={handleCreateSubmit} className="space-y-5">
					{formError && (
						<div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-600">
							<i className="fas fa-circle-xmark"></i>
							{formError}
						</div>
					)}
					<Input
						label="Full Name"
						icon="fa-user"
						type="text"
						value={form.name}
						onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
						placeholder="Dr. John Smith"
						required
					/>
					<Input
						label="Email Address"
						icon="fa-envelope"
						type="email"
						value={form.email}
						onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
						placeholder="name@clinic.com"
						required
					/>
					<Select
						label="Role"
						icon="fa-shield-halved"
						value={form.role}
						onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role, specialty: '' }))}
						options={[
							{ value: Role.PATIENT, label: 'Patient' },
							{ value: Role.DOCTOR, label: 'Doctor' },
							{ value: Role.ADMIN, label: 'Admin' },
						]}
					/>
					{form.role === Role.DOCTOR && (
						<Input
							label="Specialty"
							icon="fa-stethoscope"
							type="text"
							value={form.specialty}
							onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
							placeholder="e.g. Cardiology"
						/>
					)}
					<Input
						label="Password"
						icon="fa-lock"
						type="password"
						value={form.password}
						onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
						placeholder="••••••••"
						required
					/>
					<Input
						label="Confirm Password"
						icon="fa-lock"
						type="password"
						value={form.passwordConfirm}
						onChange={(e) => setForm((f) => ({ ...f, passwordConfirm: e.target.value }))}
						placeholder="••••••••"
						required
					/>
					<div className="pt-2">
						<Button type="submit" className="w-full py-5" disabled={isCreating}>
							{isCreating ? 'Creating...' : 'Create User'}
						</Button>
					</div>
				</form>
			</Modal>

			{pendingDelete && (
				<ConfirmModal
					title="Remove User"
					message={`Are you absolutely sure you want to remove ${pendingDelete.name}? This action cannot be undone.`}
					confirmLabel="Remove"
					onConfirm={() => {
						deleteUser(pendingDelete.id);
						setPendingDelete(null);
					}}
					onCancel={() => setPendingDelete(null)}
				/>
			)}
		</div>
	);
}

export default UserManagement;
