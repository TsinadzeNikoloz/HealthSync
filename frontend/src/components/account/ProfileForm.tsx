import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../features/authentication/useUser';
import { useUpdateUser } from '../../features/authentication/useUpdateUser';
import { getUserPhotoUrl } from '../../utils/helpers';

const inputCls =
	'w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none font-semibold text-slate-700 transition-all';
const labelCls =
	'text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1';

export function ProfileForm() {
	const { user } = useUser();
	const { updateUser, isUpdating } = useUpdateUser();

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [photoFile, setPhotoFile] = useState<File | null>(null);

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [dateOfBirth, setDateOfBirth] = useState('');
	const [gender, setGender] = useState('');
	const [address, setAddress] = useState('');

	useEffect(() => {
		if (user) {
			setName(user.name || '');
			setEmail(user.email || '');
			setPhone(user.phone || '');
			setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '');
			setGender(user.gender || '');
			setAddress(user.address || '');
		}
	}, [user]);

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setPhotoFile(file);
		setPhotoPreview(URL.createObjectURL(file));
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('name', name);
		formData.append('email', email);
		if (phone) formData.append('phone', phone);
		if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth);
		if (gender) formData.append('gender', gender);
		if (address) formData.append('address', address);
		if (photoFile) formData.append('photo', photoFile);
		updateUser(formData);
	};

	return (
		<form
			onSubmit={handleSave}
			className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6"
		>
			<h3 className="text-lg font-black text-slate-800">Personal Information</h3>

			{/* Avatar row */}
			<div className="flex items-center gap-5 pb-2">
				<div className="relative flex-shrink-0">
					<img
						src={photoPreview || getUserPhotoUrl(user?.photo, user?.name)}
						className="w-20 h-20 rounded-[2.5rem] border-4 border-white shadow-xl object-cover"
						alt="Profile"
					/>
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className="absolute -bottom-2 -right-2 bg-indigo-600 text-white w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
					>
						<i className="fas fa-camera text-xs"></i>
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handlePhotoChange}
					/>
				</div>
				<div>
					<p className="font-bold text-slate-800">{user?.name}</p>
					<p className="text-sm font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
						{user?.role}
					</p>
					{user?.specialty && (
						<p className="text-sm text-slate-400 font-medium mt-0.5">
							{user.specialty}
						</p>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<label className={labelCls}>Full Name</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className={inputCls}
						required
					/>
				</div>
				<div className="space-y-2">
					<label className={labelCls}>Email Address</label>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className={inputCls}
						required
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<label className={labelCls}>Phone Number</label>
					<input
						type="tel"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						className={inputCls}
						placeholder="+1 (555) 000-0000"
					/>
				</div>
				<div className="space-y-2">
					<label className={labelCls}>Date of Birth</label>
					<input
						type="date"
						value={dateOfBirth}
						onChange={(e) => setDateOfBirth(e.target.value)}
						className={inputCls}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<label className={labelCls}>Sex</label>
					<select
						value={gender}
						onChange={(e) => setGender(e.target.value)}
						className={`${inputCls} appearance-none`}
					>
						<option value="">Prefer not to say</option>
						<option value="male">Male</option>
						<option value="female">Female</option>
						<option value="other">Undisclosed</option>
					</select>
				</div>
				<div className="space-y-2">
					<label className={labelCls}>Address</label>
					<input
						type="text"
						value={address}
						onChange={(e) => setAddress(e.target.value)}
						className={inputCls}
						placeholder="City, Country"
					/>
				</div>
			</div>

			<div className="pt-4 border-t border-slate-50 flex justify-end">
				<button
					type="submit"
					disabled={isUpdating}
					className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 disabled:opacity-70"
				>
					{isUpdating ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</form>
	);
}
