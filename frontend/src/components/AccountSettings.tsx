import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../features/authentication/useUser';
import { useUpdateUser } from '../features/authentication/useUpdateUser';
import { useUpdatePassword } from '../features/authentication/useUpdatePassword';
import { useUpdateAvailability } from '../features/appointments/useUpdateAvailability';
import { Role, AvailabilitySlot } from '../types';
import { getUserPhotoUrl } from '../utils/helpers';

const inputCls =
	'w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none font-semibold text-slate-700 transition-all';
const labelCls =
	'text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1';

const DAYS = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
];

interface DaySlot {
	enabled: boolean;
	startTime: string;
	endTime: string;
}
const DEFAULT_SLOT: DaySlot = {
	enabled: false,
	startTime: '09:00',
	endTime: '17:00',
};

const AccountSettings: React.FC = () => {
	const { user } = useUser();
	const { updateUser, isUpdating } = useUpdateUser();
	const { updatePassword, isUpdating: isUpdatingPassword } =
		useUpdatePassword();
	const { saveAvailability, isSaving } = useUpdateAvailability();

	const [schedule, setSchedule] = useState<DaySlot[]>(
		DAYS.map(() => ({ ...DEFAULT_SLOT })),
	);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [photoFile, setPhotoFile] = useState<File | null>(null);

	// Profile fields
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [dateOfBirth, setDateOfBirth] = useState('');
	const [gender, setGender] = useState('');
	const [address, setAddress] = useState('');

	// Password fields
	const [passwordCurrent, setPasswordCurrent] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConfirm, setPasswordConfirm] = useState('');
	const [passwordError, setPasswordError] = useState('');

	// Pre-fill form once user loads
	useEffect(() => {
		if (user) {
			setName(user.name || '');
			setEmail(user.email || '');
			setPhone(user.phone || '');
			setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '');
			setGender(user.gender || '');
			setAddress(user.address || '');
			// Pre-fill availability schedule for doctors
			if (user.availability) {
				setSchedule((prev) =>
					prev.map((slot, i) => {
						const match = user.availability!.find(
							(a: AvailabilitySlot) => a.dayOfWeek === i,
						);
						return match
							? {
									enabled: true,
									startTime: match.startTime,
									endTime: match.endTime,
								}
							: { ...slot, enabled: false };
					}),
				);
			}
		}
	}, [user]);

	const updateDay = (i: number, patch: Partial<DaySlot>) =>
		setSchedule((prev) =>
			prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)),
		);

	const handleSaveSchedule = (e: React.FormEvent) => {
		e.preventDefault();
		const availability: AvailabilitySlot[] = schedule
			.map((d, i) => ({
				dayOfWeek: i,
				startTime: d.startTime,
				endTime: d.endTime,
				enabled: d.enabled,
			}))
			.filter((d) => d.enabled)
			.map(({ dayOfWeek, startTime, endTime }) => ({
				dayOfWeek,
				startTime,
				endTime,
			}));
		saveAvailability(availability);
	};

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

	const handlePasswordChange = (e: React.FormEvent) => {
		e.preventDefault();
		setPasswordError('');
		if (password !== passwordConfirm) {
			setPasswordError('New passwords do not match.');
			return;
		}
		if (password.length < 8) {
			setPasswordError('Password must be at least 8 characters.');
			return;
		}
		updatePassword(
			{ passwordCurrent, password, passwordConfirm },
			{
				onSuccess: () => {
					setPasswordCurrent('');
					setPassword('');
					setPasswordConfirm('');
				},
			},
		);
	};

	return (
		<div className="max-w-2xl mx-auto flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
			<div>
				<h2 className="text-3xl font-black text-slate-800">Account Settings</h2>
				<p className="text-slate-500 mt-1">
					Manage your personal profile and security preferences.
				</p>
			</div>

			{/* Profile Info */}
			<form
				onSubmit={handleSave}
				className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6"
			>
				<h3 className="text-lg font-black text-slate-800">
					Personal Information
				</h3>

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

			{/* Weekly Schedule for doctors */}
			{user?.role === Role.DOCTOR && (
				<form
					onSubmit={handleSaveSchedule}
					className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6"
				>
					<div>
						<h3 className="text-lg font-black text-slate-800">
							Weekly Availability
						</h3>
						<p className="text-sm text-slate-400 font-medium mt-1">
							Set the days and hours when patients can book appointments
							with you.
						</p>
					</div>

					<div className="flex flex-col gap-3">
						{DAYS.map((day, i) => (
							<div
								key={day}
								className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${schedule[i].enabled ? 'border-indigo-100 bg-indigo-50/40' : 'border-slate-100 bg-slate-50/50'}`}
							>
								<button
									type="button"
									onClick={() =>
										updateDay(i, { enabled: !schedule[i].enabled })
									}
									className={`w-11 h-6 rounded-full transition-all flex-shrink-0 relative ${schedule[i].enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
								>
									<span
										className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${schedule[i].enabled ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'}`}
									/>
								</button>

								<span
									className={`w-24 text-sm font-black ${schedule[i].enabled ? 'text-indigo-700' : 'text-slate-400'}`}
								>
									{day}
								</span>

								{schedule[i].enabled ? (
									<div className="flex items-center gap-2 flex-1">
										<input
											type="time"
											value={schedule[i].startTime}
											onChange={(e) =>
												updateDay(i, { startTime: e.target.value })
											}
											className="flex-1 px-3 py-2 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10"
										/>
										<span className="text-slate-300 font-bold text-sm">
											to
										</span>
										<input
											type="time"
											value={schedule[i].endTime}
											onChange={(e) =>
												updateDay(i, { endTime: e.target.value })
											}
											className="flex-1 px-3 py-2 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10"
										/>
									</div>
								) : (
									<span className="text-xs text-slate-300 font-bold uppercase tracking-widest">
										Unavailable
									</span>
								)}
							</div>
						))}
					</div>

					<div className="pt-4 border-t border-slate-50 flex justify-end">
						<button
							type="submit"
							disabled={isSaving}
							className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 disabled:opacity-70"
						>
							{isSaving ? 'Saving...' : 'Save Schedule'}
						</button>
					</div>
				</form>
			)}

			{/* Change Password */}
			<form
				onSubmit={handlePasswordChange}
				className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6"
			>
				<h3 className="text-lg font-black text-slate-800">
					Change Password
				</h3>

				{passwordError && (
					<div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-3">
						<i className="fas fa-info-circle"></i>
						{passwordError}
					</div>
				)}

				<div className="space-y-2">
					<label className={labelCls}>Current Password</label>
					<input
						type="password"
						value={passwordCurrent}
						onChange={(e) => setPasswordCurrent(e.target.value)}
						className={inputCls}
						placeholder="••••••••"
						required
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<label className={labelCls}>New Password</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className={inputCls}
							placeholder="••••••••"
							minLength={8}
							required
						/>
					</div>
					<div className="space-y-2">
						<label className={labelCls}>Confirm New Password</label>
						<input
							type="password"
							value={passwordConfirm}
							onChange={(e) => setPasswordConfirm(e.target.value)}
							className={inputCls}
							placeholder="••••••••"
							minLength={8}
							required
						/>
					</div>
				</div>

				<div className="pt-4 border-t border-slate-50 flex justify-end">
					<button
						type="submit"
						disabled={isUpdatingPassword}
						className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-100 disabled:opacity-70"
					>
						{isUpdatingPassword ? 'Updating...' : 'Update Password'}
					</button>
				</div>
			</form>

			{/* Two-Factor Authentication */}
			<div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
				<div className="flex items-start justify-between gap-6">
					<div className="flex items-start gap-4">
						<div
							className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${user?.twoFactorEnabled ? 'bg-emerald-50' : 'bg-slate-50'}`}
						>
							<i
								className={`fas fa-shield-alt text-xl ${user?.twoFactorEnabled ? 'text-emerald-500' : 'text-slate-300'}`}
							></i>
						</div>
						<div>
							<h3 className="text-lg font-black text-slate-800">
								Two-Factor Authentication
							</h3>
							<p className="text-sm text-slate-400 font-medium mt-1">
								{user?.twoFactorEnabled
									? 'Your account is protected. An OTP code will be required on every login.'
									: 'Add an extra layer of security. An OTP code will be sent to your email on login.'}
							</p>
						</div>
					</div>

					<button
						type="button"
						disabled={isUpdating}
						onClick={() => {
							const fd = new FormData();
							fd.append(
								'twoFactorEnabled',
								String(!user?.twoFactorEnabled),
							);
							updateUser(fd);
						}}
						className={`w-14 h-7 rounded-full transition-all flex-shrink-0 relative disabled:opacity-50 ${user?.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
					>
						<span
							className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${user?.twoFactorEnabled ? 'left-[calc(100%-1.625rem)]' : 'left-0.5'}`}
						/>
					</button>
				</div>

				{user?.twoFactorEnabled && (
					<div className="mt-5 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex items-center gap-3 text-sm text-emerald-700 font-semibold">
						<i className="fas fa-check-circle text-emerald-500"></i>
						Two-factor authentication is active on your account.
					</div>
				)}
			</div>
		</div>
	);
};

export default AccountSettings;
