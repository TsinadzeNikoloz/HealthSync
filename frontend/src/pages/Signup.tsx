import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSignup } from '../features/authentication/useSignup';
import AppLogo from '../ui/AppLogo';
import AuthPane from '../features/authentication/AuthPane';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface SignupFormData {
	name: string;
	email: string;
	password: string;
	passwordConfirm: string;
	phone?: string;
	dateOfBirth?: string;
	gender?: string;
	address?: string;
}

function Signup() {
	const [showPassword, setShowPassword] = useState(false);
	const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
	const [showOptional, setShowOptional] = useState(false);

	const { signup, isPending } = useSignup();

	const {
		register,
		handleSubmit,
		getValues,
		formState: { errors },
	} = useForm<SignupFormData>();

	const onSubmit = (data: SignupFormData) => {
		signup({
			name: data.name,
			email: data.email,
			password: data.password,
			passwordConfirm: data.passwordConfirm,
			...(data.phone && { phone: data.phone }),
			...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
			...(data.gender && { gender: data.gender as 'male' | 'female' | 'other' }),
			...(data.address && { address: data.address }),
		});
	};

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
			<div className="flex w-full items-start justify-center overflow-y-auto bg-white p-8 md:px-20 md:py-16 lg:w-2/5">
				<div className="w-full max-w-md">
					<AppLogo className="mb-10 justify-center lg:hidden" />

					<div className="mb-10">
						<h2 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
							Get Started
						</h2>
						<p className="font-medium text-slate-500">
							Create your secure account in seconds.
						</p>
					</div>

					<div className="mb-10 flex gap-2 rounded-2xl bg-slate-100 p-1.5">
						<Link
							to="/login"
							className="flex-1 rounded-xl py-3 text-center text-sm font-bold transition-all duration-300 text-slate-500 hover:text-slate-800"
						>
							Log In
						</Link>
						<Link
							to="/signup"
							className="flex-1 rounded-xl py-3 text-center text-sm font-bold transition-all duration-300 bg-white text-blue-600 shadow-lg"
						>
							Sign Up
						</Link>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
						<Input
							label="Full Name"
							icon="fa-user"
							placeholder="Enter your name"
							error={errors.name?.message}
							{...register('name', { required: 'Name is required' })}
						/>

						<Input
							label="Email Address"
							icon="fa-envelope"
							type="email"
							placeholder="name@email.com"
							error={errors.email?.message}
							{...register('email', { required: 'Email is required' })}
						/>

						<div className="relative">
							<Input
								label="Password"
								icon="fa-lock"
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••••"
								error={errors.password?.message}
								{...register('password', { required: 'Password is required' })}
							/>
							<button
								type="button"
								onClick={() => setShowPassword((s) => !s)}
								aria-label={showPassword ? 'Hide password' : 'Show password'}
								className="absolute right-5 top-[calc(50%+14px)] -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
							>
								<i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
							</button>
						</div>

						<div className="relative">
							<Input
								label="Confirm Password"
								icon="fa-lock"
								type={showPasswordConfirm ? 'text' : 'password'}
								placeholder="••••••••"
								error={errors.passwordConfirm?.message}
								{...register('passwordConfirm', {
									required: 'Please confirm your password',
									validate: (val) =>
										val === getValues('password') || 'Passwords do not match',
								})}
							/>
							<button
								type="button"
								onClick={() => setShowPasswordConfirm((s) => !s)}
								aria-label={showPasswordConfirm ? 'Hide password' : 'Show password'}
								className="absolute right-5 top-[calc(50%+14px)] -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
							>
								<i className={`fas ${showPasswordConfirm ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
							</button>
						</div>

						<div className="rounded-2xl border border-slate-100 bg-slate-50">
							<button
								type="button"
								onClick={() => setShowOptional((s) => !s)}
								className="flex w-full items-center justify-between px-5 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-blue-600"
							>
								<span className="flex items-center gap-2">
									<i className="fas fa-sliders text-slate-400"></i>
									Optional Details
								</span>
								<i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${showOptional ? 'rotate-180' : ''}`}></i>
							</button>

							{showOptional && (
								<div className="flex flex-col gap-4 border-t border-slate-100 px-5 pb-5 pt-4">
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<Input
											label="Phone"
											icon="fa-phone"
											type="tel"
											placeholder="+36 00 000 00"
											{...register('phone')}
										/>
										<Input
											label="Date of Birth"
											icon="fa-calendar"
											type="date"
											{...register('dateOfBirth')}
										/>
									</div>

									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<Select
											label="Sex"
											icon="fa-venus-mars"
											options={[
												{ value: '', label: 'Select' },
												{ value: 'male', label: 'Male' },
												{ value: 'female', label: 'Female' },
												{ value: 'other', label: 'Undisclosed' },
											]}
											{...register('gender')}
										/>
										<Input
											label="Address"
											icon="fa-map-marker-alt"
											type="text"
											placeholder="City, Country"
											{...register('address')}
										/>
									</div>
								</div>
							)}
						</div>

						<button
							type="submit"
							disabled={isPending}
							className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 font-black text-white shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 hover:bg-blue-700 active:scale-95 disabled:opacity-70"
						>
							Create My Account
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

export default Signup;
