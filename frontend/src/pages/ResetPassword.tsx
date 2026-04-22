import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useResetPassword } from '../features/authentication/useResetPassword';
import AppLogo from '../ui/AppLogo';
import AuthPane from '../features/authentication/AuthPane';

function ResetPassword() {
	const { token } = useParams<{ token: string }>();
	const [password, setPassword] = useState('');
	const [passwordConfirm, setPasswordConfirm] = useState('');
	const [error, setError] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const { resetPassword, isPending } = useResetPassword();

	const handleSubmit = (e: { preventDefault(): void }) => {
		e.preventDefault();
		setError('');
		if (password !== passwordConfirm) {
			setError('Passwords do not match');
			return;
		}
		if (password.length < 8) {
			setError('Password must be at least 8 characters');
			return;
		}
		if (!token) {
			setError('Invalid reset link. Please request a new one.');
			return;
		}
		resetPassword({ token, password, passwordConfirm });
	};

	return (
		<div className="flex min-h-screen overflow-hidden font-['Plus_Jakarta_Sans']">
			<AuthPane
				title={
					<>
						New <br />
						<span className="text-blue-400">Password.</span>
					</>
				}
				description="Choose a strong password to keep your account and medical data secure."
				footer={
					<div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
						<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/20">
							<i className="fas fa-shield-alt text-xl text-blue-300"></i>
						</div>
						<div>
							<p className="text-sm font-bold text-white">
								Password Requirements
							</p>
							<p className="mt-1 text-xs font-medium text-blue-200/60">
								Minimum 8 characters. Use a mix of letters and numbers.
							</p>
						</div>
					</div>
				}
			/>

			{/* Right Pane */}
			<div className="flex w-full items-center justify-center bg-white p-8 md:p-20 lg:w-2/5">
				<div className="w-full max-w-md">
					<AppLogo className="mb-10 justify-center lg:hidden" />

					<div className="mb-10">
						<h2 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
							Reset Password
						</h2>
						<p className="font-medium text-slate-500">
							Enter your new password below.
						</p>
					</div>

					{error && (
						<div className="mb-8 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-600">
							<i className="fas fa-circle-xmark"></i>
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="flex flex-col gap-6">
						<div className="w-full space-y-2">
							<label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
								New Password
							</label>
							<div className="group relative">
								<i className="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-blue-500"></i>
								<input
									type={showPassword ? 'text' : 'password'}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									minLength={8}
									required
									className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pl-12 pr-12 font-semibold text-slate-700 outline-none transition-colors focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors hover:text-slate-500"
								>
									<i
										className={
											showPassword
												? 'fas fa-eye-slash text-sm'
												: 'fas fa-eye text-sm'
										}
									></i>
								</button>
							</div>
						</div>

						<div className="w-full space-y-2">
							<label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
								Confirm Password
							</label>
							<div className="group relative">
								<i className="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-blue-500"></i>
								<input
									type={showConfirm ? 'text' : 'password'}
									value={passwordConfirm}
									onChange={(e) => setPasswordConfirm(e.target.value)}
									placeholder="••••••••"
									minLength={8}
									required
									className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pl-12 pr-12 font-semibold text-slate-700 outline-none transition-colors focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
								/>
								<button
									type="button"
									onClick={() => setShowConfirm((v) => !v)}
									className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors hover:text-slate-500"
								>
									<i
										className={
											showConfirm
												? 'fas fa-eye-slash text-sm'
												: 'fas fa-eye text-sm'
										}
									></i>
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={isPending}
							className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 font-black text-white shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 hover:bg-blue-700 active:scale-95 disabled:opacity-70"
						>
							{isPending ? 'Saving...' : 'Set New Password'}
							{!isPending && (
								<i className="fas fa-arrow-right text-xs opacity-50"></i>
							)}
						</button>
					</form>

					<div className="mt-10 text-center">
						<Link
							to="/login"
							className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-blue-600"
						>
							<i className="fas fa-arrow-left text-xs"></i>
							Back to login
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ResetPassword;
