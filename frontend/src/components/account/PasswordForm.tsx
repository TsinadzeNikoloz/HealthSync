import React, { useState } from 'react';
import { useUpdatePassword } from '../../features/authentication/useUpdatePassword';

const inputCls =
	'w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none font-semibold text-slate-700 transition-all';
const labelCls =
	'text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1';

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
					disabled={isUpdating}
					className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-slate-100 disabled:opacity-70"
				>
					{isUpdating ? 'Updating...' : 'Update Password'}
				</button>
			</div>
		</form>
	);
}
