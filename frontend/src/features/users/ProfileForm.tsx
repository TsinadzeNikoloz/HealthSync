import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useUser } from '../../features/authentication/useUser';
import { useUpdateUser } from '../../features/authentication/useUpdateUser';
import { getUserPhotoUrl } from '../../utils/helpers';

const inputCls =
	'w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none font-semibold text-slate-700 transition-all';
const labelCls =
	'text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1';

interface FormFields {
	name: string;
	email: string;
	phone: string;
	dateOfBirth: string;
	gender: string;
	address: string;
}

export function ProfileForm() {
	const { user } = useUser();
	const { updateUser, isUpdating } = useUpdateUser();

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [photoFile, setPhotoFile] = useState<File | null>(null);

	const { register, handleSubmit, reset } = useForm<FormFields>();

	useEffect(() => {
		if (user) {
			reset({
				name: user.name ?? '',
				email: user.email ?? '',
				phone: user.phone ?? '',
				dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
				gender: user.gender ?? '',
				address: user.address ?? '',
			});
		}
	}, [user, reset]);

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setPhotoFile(file);
		setPhotoPreview(URL.createObjectURL(file));
	};

	const onSubmit = (data: FormFields) => {
		const formData = new FormData();
		formData.append('name', data.name);
		formData.append('email', data.email);
		if (data.phone) formData.append('phone', data.phone);
		if (data.dateOfBirth) formData.append('dateOfBirth', data.dateOfBirth);
		if (data.gender) formData.append('gender', data.gender);
		if (data.address) formData.append('address', data.address);
		if (photoFile) formData.append('photo', photoFile);
		updateUser(formData);
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-6 rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-sm"
		>
			<h3 className="text-lg font-black text-slate-800">
				Personal Information
			</h3>

			{/* Avatar row */}
			<div className="flex items-center gap-5 pb-2">
				<div className="relative flex-shrink-0">
					<img
						src={photoPreview || getUserPhotoUrl(user?.photo, user?.name)}
						className="h-20 w-20 rounded-[2.5rem] border-4 border-white object-cover shadow-xl"
						alt="Profile"
					/>
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700"
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
					<p className="mt-0.5 text-sm font-bold uppercase tracking-widest text-blue-500">
						{user?.role}
					</p>
					{user?.specialty && (
						<p className="mt-0.5 text-sm font-medium text-slate-400">
							{user.specialty}
						</p>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div className="space-y-2">
					<label className={labelCls}>Full Name</label>
					<input type="text" {...register('name', { required: true })} className={inputCls} />
				</div>
				<div className="space-y-2">
					<label className={labelCls}>Email Address</label>
					<input type="email" {...register('email', { required: true })} className={inputCls} />
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div className="space-y-2">
					<label className={labelCls}>Phone Number</label>
					<input type="tel" {...register('phone')} className={inputCls} placeholder="+36 00 00 0000" />
				</div>
				<div className="space-y-2">
					<label className={labelCls}>Date of Birth</label>
					<input type="date" {...register('dateOfBirth')} className={inputCls} />
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div className="space-y-2">
					<label className={labelCls}>Sex</label>
					<select {...register('gender')} className={`${inputCls} appearance-none`}>
						<option value="">Prefer not to say</option>
						<option value="male">Male</option>
						<option value="female">Female</option>
						<option value="other">Undisclosed</option>
					</select>
				</div>
				<div className="space-y-2">
					<label className={labelCls}>Address</label>
					<input type="text" {...register('address')} className={inputCls} placeholder="City, Country" />
				</div>
			</div>

			<div className="flex justify-end border-t border-slate-100 pt-4">
				<button
					type="submit"
					disabled={isUpdating}
					className="rounded-2xl bg-blue-600 px-10 py-4 font-bold text-white shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 disabled:opacity-70"
				>
					{isUpdating ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</form>
	);
}
