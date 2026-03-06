import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../features/authentication/useLogin';
import { useSignup } from '../features/authentication/useSignup';
import { useVerifyOTP } from '../features/authentication/useVerifyOTP';

const inputCls =
	'w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none font-semibold text-slate-700 transition-all';
const selectCls =
	'w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none font-semibold text-slate-700 transition-all appearance-none';
const labelCls =
	'text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1';

const Auth: React.FC = () => {
	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [dateOfBirth, setDateOfBirth] = useState('');
	const [gender, setGender] = useState('');
	const [address, setAddress] = useState('');
	const [passwordConfirm, setPasswordConfirm] = useState('');
	const [otp, setOtp] = useState('');
	const [error, setError] = useState('');

	const {
		login,
		isPending: isLoggingIn,
		pendingEmail,
		setPendingEmail,
	} = useLogin();
	const { signup, isPending: isSigningUp } = useSignup();
	const { verifyOTP, isPending: isVerifying } = useVerifyOTP();

	const isPending = isLoggingIn || isSigningUp || isVerifying;

	const handleOtpSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		verifyOTP({ email: pendingEmail!, otp });
	};

	const handleSubmit = (e: React.FormEvent) => {
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
			<div className="min-h-screen flex items-center justify-center bg-slate-50 font-['Plus_Jakarta_Sans']">
				<div className="bg-white p-12 rounded-[3rem] shadow-xl max-w-md w-full">
					<div className="flex items-center gap-3 mb-10 justify-center">
						<div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
							<i className="fas fa-heartbeat text-xl"></i>
						</div>
						<span className="text-2xl font-black text-slate-900">
							HealthSync
						</span>
					</div>
					<h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight text-center">
						Verify Identity
					</h2>
					<p className="text-slate-500 font-medium text-center mb-10">
						Enter the code sent to{' '}
						<span className="font-bold text-slate-700">{pendingEmail}</span>
					</p>
					<form onSubmit={handleOtpSubmit} className="space-y-6">
						<div className="space-y-2">
							<label className={labelCls}>Verification Code</label>
							<div className="relative group">
								<i className="fas fa-shield-alt absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
								<input
									type="text"
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									className={`${inputCls} text-center text-xl tracking-[0.5em]`}
									placeholder="000000"
									maxLength={6}
									required
								/>
							</div>
						</div>
						<button
							type="submit"
							disabled={isPending}
							className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
						>
							Verify & Continue{' '}
							<i className="fas fa-arrow-right text-xs opacity-50"></i>
						</button>
						<button
							type="button"
							onClick={() => setPendingEmail(null)}
							className="w-full text-slate-400 font-bold hover:text-slate-600 transition-colors pt-2"
						>
							Back to login
						</button>
					</form>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex bg-slate-50 overflow-hidden font-['Plus_Jakarta_Sans']">
			{/* Left Pane: Gradient */}
			<div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-700">
				<div className="absolute top-0 right-0 w-3/4 h-3/4 bg-indigo-500/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/4"></div>
				<div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-400/10 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4"></div>
				<div className="relative z-10 p-20 flex flex-col justify-between h-full w-full">
					<div>
						<div className="flex items-center gap-3 mb-12">
							<div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20">
								<i className="fas fa-heartbeat text-2xl"></i>
							</div>
							<span className="text-3xl font-black text-white tracking-tight">
								HealthSync
							</span>
						</div>
						<div className="max-w-xl">
							<h1 className="text-6xl font-black text-white leading-[1.1] mb-8">
								Care that's <br />
								<span className="text-indigo-400">Perfectly Synced.</span>
							</h1>
							<p className="text-indigo-100/70 text-xl leading-relaxed font-medium">
								Our advanced management platform bridges the gap between patient
								needs and professional medical expertise. Experience healthcare
								without friction.
							</p>
						</div>
					</div>
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
								<i className="fas fa-star"></i>
								<i className="fas fa-star"></i>
								<i className="fas fa-star"></i>
								<i className="fas fa-star"></i>
								<i className="fas fa-star"></i>
							</div>
						</div>
					</div>
				</div>
			</div>

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

					<form onSubmit={handleSubmit} className="space-y-6">
						{!isLogin && (
							<div className="space-y-2">
								<label className={labelCls}>Full Name</label>
								<div className="relative group">
									<i className="fas fa-user absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
									<input
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										className={inputCls}
										placeholder="Enter your name"
										required
									/>
								</div>
							</div>
						)}

						<div className="space-y-2">
							<label className={labelCls}>Email Address</label>
							<div className="relative group">
								<i className="fas fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className={inputCls}
									placeholder="name@email.com"
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between items-center ml-1">
								<label className={labelCls}>Password</label>
								{isLogin && (
									<Link
										to="/forgot-password"
										className="text-[10px] font-bold text-indigo-600 hover:underline tracking-widest uppercase"
									>
										Forgot?
									</Link>
								)}
							</div>
							<div className="relative group">
								<i className="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className={inputCls}
									placeholder="••••••••"
									required
								/>
							</div>
						</div>

						{!isLogin && (
							<div className="space-y-2">
								<label className={labelCls}>Confirm Password</label>
								<div className="relative group">
									<i className="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
									<input
										type="password"
										value={passwordConfirm}
										onChange={(e) => setPasswordConfirm(e.target.value)}
										className={inputCls}
										placeholder="••••••••"
										required
									/>
								</div>
							</div>
						)}

						{/* Optional signup fields */}
						{!isLogin && (
							<>
								<div className="pt-2 border-t border-slate-100">
									<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
										Optional Details
									</p>

									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<label className={labelCls}>Phone</label>
											<div className="relative group">
												<i className="fas fa-phone absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
												<input
													type="tel"
													value={phone}
													onChange={(e) => setPhone(e.target.value)}
													className={inputCls}
													placeholder="+1 555 0000"
												/>
											</div>
										</div>

										<div className="space-y-2">
											<label className={labelCls}>Date of Birth</label>
											<div className="relative group">
												<i className="fas fa-calendar absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
												<input
													type="date"
													value={dateOfBirth}
													onChange={(e) => setDateOfBirth(e.target.value)}
													className={inputCls}
												/>
											</div>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4 mt-4">
										<div className="space-y-2">
											<label className={labelCls}>Sex</label>
											<div className="relative group">
												<i className="fas fa-venus-mars absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none"></i>
												<select
													value={gender}
													onChange={(e) => setGender(e.target.value)}
													className={selectCls}
												>
													<option value="">Select</option>
													<option value="male">Male</option>
													<option value="female">Female</option>
													<option value="other">Undisclosed</option>
												</select>
											</div>
										</div>

										<div className="space-y-2">
											<label className={labelCls}>Address</label>
											<div className="relative group">
												<i className="fas fa-map-marker-alt absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
												<input
													type="text"
													value={address}
													onChange={(e) => setAddress(e.target.value)}
													className={inputCls}
													placeholder="City, Country"
												/>
											</div>
										</div>
									</div>
								</div>
							</>
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
};

export default Auth;
