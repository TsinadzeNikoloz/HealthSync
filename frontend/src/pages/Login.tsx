import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../features/authentication/useLogin';
import { OTPVerification } from '../features/authentication/OTPVerification';
import AppLogo from '../ui/AppLogo';
import AuthPane from '../features/authentication/AuthPane';
import Input from '../ui/Input';

function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');

	const { login, isPending, pendingEmail, setPendingEmail } = useLogin();

	const handleSubmit = (e: { preventDefault(): void }) => {
		e.preventDefault();
		setError('');
		if (!email || !password) {
			setError('Please fill in all fields');
			return;
		}
		login({ email, password });
	};

	if (pendingEmail) {
		return (
			<OTPVerification
				pendingEmail={pendingEmail}
				onBack={() => setPendingEmail(null)}
			/>
		);
	}

	return (
		<div className="flex min-h-screen overflow-hidden bg-slate-50 font-['Plus_Jakarta_Sans']">
			<AuthPane
				title={
					<>
						Care that's <br />
						<span className="text-blue-400">Perfectly Synced.</span>
					</>
				}
				description="Our advanced management platform bridges the gap between patient needs and professional medical expertise. Experience healthcare without friction."
				footer={null}
			/>

			{/* Right Pane */}
			<div className="flex w-full items-center justify-center overflow-y-auto bg-white p-8 md:px-20 md:py-16 lg:w-2/5">
				<div className="w-full max-w-md">
					<AppLogo className="mb-10 justify-center lg:hidden" />

					<div className="mb-10">
						<h2 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
							Welcome Back
						</h2>
						<p className="font-medium text-slate-500">
							Sign in to manage your appointments.
						</p>
					</div>

					<div className="mb-10 flex gap-2 rounded-2xl bg-slate-100 p-1.5">
						<Link
							to="/login"
							className="flex-1 rounded-xl py-3 text-center text-sm font-bold transition-all duration-300 bg-white text-blue-600 shadow-lg"
						>
							Log In
						</Link>
						<Link
							to="/signup"
							className="flex-1 rounded-xl py-3 text-center text-sm font-bold transition-all duration-300 text-slate-500 hover:text-slate-800"
						>
							Sign Up
						</Link>
					</div>

					{error && (
						<div className="mb-8 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-600">
							<i className="fas fa-circle-xmark"></i>
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="flex flex-col gap-6">
						<Input
							label="Email Address"
							icon="fa-envelope"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="name@email.com"
							required
						/>

						<div className="flex flex-col gap-2">
							<div className="ml-1 flex items-center justify-between">
								<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
									Password
								</span>
								<Link
									to="/forgot-password"
									className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline"
								>
									Forgot?
								</Link>
							</div>
							<div className="relative">
								<Input
									icon="fa-lock"
									type={showPassword ? 'text' : 'password'}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword((s) => !s)}
									aria-label={showPassword ? 'Hide password' : 'Show password'}
									className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
								>
									<i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={isPending}
							className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 font-black text-white shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 hover:bg-blue-700 active:scale-95 disabled:opacity-70"
						>
							Sign In to Account
							<i className="fas fa-arrow-right text-xs opacity-50"></i>
						</button>
					</form>

					<p className="mb-4 mt-8 text-center text-[11px] font-medium leading-relaxed text-slate-400">
						By accessing HealthSync you agree to our Privacy Policy and Terms of
						Use.
					</p>

					<div className="flex items-center justify-center gap-4 text-[11px] font-bold uppercase tracking-widest">
						<Link
							to="/services"
							className="flex items-center gap-1.5 text-slate-400 transition-colors hover:text-blue-600"
						>
							<i className="fas fa-stethoscope text-[10px]"></i>
							Browse Services
						</Link>
						<span className="text-slate-200">|</span>
						<Link
							to="/about"
							className="flex items-center gap-1.5 text-slate-400 transition-colors hover:text-blue-600"
						>
							<i className="fas fa-info-circle text-[10px]"></i>
							About Us
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Login;
