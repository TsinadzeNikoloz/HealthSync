import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../features/authentication/useLogin';
import { useSignup } from '../features/authentication/useSignup';
import { OTPVerification } from './OTPVerification';
import AuthPane from './auth/AuthPane';
import Input from './ui/Input';
import Select from './ui/Select';

function Auth() {
	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [dateOfBirth, setDateOfBirth] = useState('');
	const [gender, setGender] = useState('');
	const [address, setAddress] = useState('');
	const [passwordConfirm, setPasswordConfirm] = useState('');
	const [error, setError] = useState('');

	const {
		login,
		isPending: isLoggingIn,
		pendingEmail,
		setPendingEmail,
	} = useLogin();
	const { signup, isPending: isSigningUp } = useSignup();

	const isPending = isLoggingIn || isSigningUp;

	const handleSubmit = (e: { preventDefault(): void }) => {
		e.preventDefault();
		setError('');
		if (isLogin) {
			if (!email || !password) {
				setError('Please fill in all fields');
				return;
			}
			login({ email, password });
		} else {
			if (!email || !name || !password || !passwordConfirm) {
				setError('Please fill in all fields');
				return;
			}
			if (password !== passwordConfirm) {
				setError('Passwords do not match');
				return;
			}
			signup({
				name,
				email,
				password,
				passwordConfirm,
				...(phone && { phone }),
				...(dateOfBirth && { dateOfBirth }),
				...(gender && { gender: gender as 'male' | 'female' | 'other' }),
				...(address && { address }),
			});
		}
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
		<div className="min-h-screen flex bg-slate-50 overflow-hidden font-['Plus_Jakarta_Sans']">
			<AuthPane
				title={
					<>
						Care that's <br />
						<span className="text-indigo-400">Perfectly Synced.</span>
					</>
				}
				description="Our advanced management platform bridges the gap between patient needs and professional medical expertise. Experience healthcare without friction."
				footer={
					<div className="flex flex-wrap gap-10 items-center">
						<div className="flex -space-x-4">
							{[1, 2, 3, 4].map((i) => (
								<img
									key={i}
									src={`https://i.pravatar.cc/100?u=${i}`}
									className="w-12 h-12 rounded-full border-4 border-indigo-950 shadow-2xl"
									alt=""
								/>
							))}
						</div>
						<div>
							<p className="text-white font-bold">Join 12,000+ Patients</p>
							<div className="flex text-amber-400 text-xs mt-1">
								{[1, 2, 3, 4, 5].map((i) => (
									<i key={i} className="fas fa-star"></i>
								))}
							</div>
						</div>
					</div>
				}
			/>

			{/* Right Pane */}
			<div className="w-full lg:w-2/5 flex items-start justify-center p-8 md:px-20 md:py-16 bg-white overflow-y-auto">
				<div className="max-w-md w-full">
					<div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
						<div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
							<i className="fas fa-heartbeat text-xl"></i>
						</div>
						<span className="text-2xl font-black text-slate-900">
							HealthSync
						</span>
					</div>

					<div className="mb-10">
						<h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
							{isLogin ? 'Welcome Back' : 'Get Started'}
						</h2>
						<p className="text-slate-500 font-medium">
							{isLogin
								? 'Sign in to manage your appointments.'
								: 'Create your secure account in seconds.'}
						</p>
					</div>

					<div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-10">
						<button
							onClick={() => setIsLogin(true)}
							className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${isLogin ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
						>
							Log In
						</button>
						<button
							onClick={() => setIsLogin(false)}
							className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${!isLogin ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
						>
							Sign Up
						</button>
					</div>

					{error && (
						<div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold border border-rose-100 mb-8 flex items-center gap-3">
							<i className="fas fa-info-circle"></i>
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="flex flex-col gap-6">
						{!isLogin && (
							<Input
								label="Full Name"
								icon="fa-user"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Enter your name"
								required
							/>
						)}

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
							<div className="flex justify-between items-center ml-1">
								<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
									Password
								</span>
								{isLogin && (
									<Link
										to="/forgot-password"
										className="text-[10px] font-bold text-indigo-600 hover:underline tracking-widest uppercase"
									>
										Forgot?
									</Link>
								)}
							</div>
							<Input
								icon="fa-lock"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
							/>
						</div>

						{!isLogin && (
							<Input
								label="Confirm Password"
								icon="fa-lock"
								type="password"
								value={passwordConfirm}
								onChange={(e) => setPasswordConfirm(e.target.value)}
								placeholder="••••••••"
								required
							/>
						)}

						{!isLogin && (
							<div className="flex flex-col gap-4 pt-2 border-t border-slate-100">
								<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
									Optional Details
								</p>

								<div className="grid grid-cols-2 gap-4">
									<Input
										label="Phone"
										icon="fa-phone"
										type="tel"
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										placeholder="+1 555 0000"
									/>
									<Input
										label="Date of Birth"
										icon="fa-calendar"
										type="date"
										value={dateOfBirth}
										onChange={(e) => setDateOfBirth(e.target.value)}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<Select
										label="Sex"
										icon="fa-venus-mars"
										value={gender}
										onChange={(e) => setGender(e.target.value)}
										options={[
											{ value: '', label: 'Select' },
											{ value: 'male', label: 'Male' },
											{ value: 'female', label: 'Female' },
											{ value: 'other', label: 'Undisclosed' },
										]}
									/>
									<Input
										label="Address"
										icon="fa-map-marker-alt"
										type="text"
										value={address}
										onChange={(e) => setAddress(e.target.value)}
										placeholder="City, Country"
									/>
								</div>
							</div>
						)}

						<button
							type="submit"
							disabled={isPending}
							className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
						>
							{isLogin ? 'Sign In to Account' : 'Create My Account'}
							<i className="fas fa-arrow-right text-xs opacity-50"></i>
						</button>
					</form>

					<p className="mt-12 mb-8 text-center text-[11px] text-slate-400 font-medium leading-relaxed">
						By accessing HealthSync you agree to our <br />
						<a href="#" className="text-slate-900 font-bold hover:underline">
							Privacy Policy
						</a>{' '}
						and{' '}
						<a href="#" className="text-slate-900 font-bold hover:underline">
							Terms of Use
						</a>
						.
					</p>
				</div>
			</div>
		</div>
	);
}

export default Auth;
