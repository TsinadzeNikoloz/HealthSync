import React, { useState } from 'react';
import { useUpdatePassword } from '../../features/authentication/useUpdatePassword';

const inputCls =
	'w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none font-semibold text-slate-700 transition-all';
const labelCls =
	'text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1';

function PasswordInput({
	label,
	value,
	onChange,
	placeholder,
}: {
	label: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
}) {
	const [show, setShow] = useState(false);
	return (
		<div className="space-y-2">
			<label className={labelCls}>{label}</label>
			<div className="relative">
				<input
					type={show ? 'text' : 'password'}
					value={value}
					onChange={onChange}
					className={`${inputCls} pr-12`}
					placeholder={placeholder ?? '••••••••'}
					minLength={8}
					required
				/>
				<button
					type="button"
					onClick={() => setShow((s) => !s)}
					className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
					aria-label={show ? 'Hide password' : 'Show password'}
				>
					<i className={`fas ${show ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
				</button>
			</div>
		</div>
	);
}

export function PasswordForm() {
	const { updatePassword, isUpdating } = useUpdatePassword();

	const [passwordCurrent, setPasswordCurrent] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConfirm, setPasswordConfirm] = useState('');
	const [passwordError, setPasswordError] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
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
		<form
			onSubmit={handleSubmit}
			className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6"
		>
			<h3 className="text-lg font-black text-slate-800">Change Password</h3>

			{passwordError && (
				<div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-3">
					<i className="fas fa-circle-xmark"></i>
					{passwordError}
				</div>
			)}

			<PasswordInput
				label="Current Password"
				value={passwordCurrent}
				onChange={(e) => setPasswordCurrent(e.target.value)}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<PasswordInput
					label="New Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<PasswordInput
					label="Confirm New Password"
					value={passwordConfirm}
					onChange={(e) => setPasswordConfirm(e.target.value)}
				/>
			</div>

			<div className="pt-4 border-t border-slate-100 flex justify-end">
				<button
					type="submit"
					disabled={isUpdating}
					className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-100 disabled:opacity-70"
				>
					{isUpdating ? 'Updating...' : 'Update Password'}
				</button>
			</div>
		</form>
	);
}
