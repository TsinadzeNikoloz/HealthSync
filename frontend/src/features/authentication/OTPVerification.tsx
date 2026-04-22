import { useState } from 'react';
import AppLogo from '../../ui/AppLogo';
import AuthPane from './AuthPane';
import { useVerifyOTP } from './useVerifyOTP';

interface OTPVerificationProps {
	pendingEmail: string;
	onBack: () => void;
}

export function OTPVerification({
	pendingEmail,
	onBack,
}: OTPVerificationProps) {
	const [otp, setOtp] = useState('');
	const { verifyOTP, isPending } = useVerifyOTP();

	const handleSubmit = (e: { preventDefault(): void }) => {
		e.preventDefault();
		verifyOTP({ email: pendingEmail, otp });
	};

	return (
		<div className="flex min-h-screen overflow-hidden bg-slate-50 font-['Plus_Jakarta_Sans']">
			<AuthPane
				title={
					<>
						One Last <br />
						<span className="text-blue-400">Step.</span>
					</>
				}
				description="We sent a 6-digit verification code to your email. Enter it below to confirm your identity and access your account."
				footer={null}
			/>

			{/* Right Pane */}
			<div className="flex w-full items-center justify-center overflow-y-auto bg-white p-8 md:px-20 md:py-16 lg:w-2/5">
				<div className="w-full max-w-md">
					<AppLogo className="mb-10 justify-center lg:hidden" />

					<div className="mb-10">
						<h2 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
							Verify Identity
						</h2>
						<p className="font-medium text-slate-500">
							Enter the code sent to{' '}
							<span className="font-bold text-slate-700">{pendingEmail}</span>
						</p>
					</div>

					<form onSubmit={handleSubmit} className="flex flex-col gap-6">
						<div className="flex flex-col gap-2">
							<label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
								Verification Code
							</label>
							<div className="group relative">
								<i className="fas fa-shield-alt absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-blue-500"></i>
								<input
									type="text"
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 pl-12 pr-6 text-center text-xl font-semibold tracking-[0.5em] text-slate-700 outline-none transition-colors focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
									placeholder="000000"
									maxLength={6}
									required
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={isPending}
							className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 font-black text-white shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 hover:bg-blue-700 active:scale-95 disabled:opacity-70"
						>
							{isPending ? 'Verifying...' : 'Verify & Continue'}
							{!isPending && (
								<i className="fas fa-arrow-right text-xs opacity-50"></i>
							)}
						</button>

						<button
							type="button"
							onClick={onBack}
							className="flex items-center justify-center gap-2 font-bold text-slate-400 transition-colors hover:text-slate-600"
						>
							<i className="fas fa-arrow-left text-xs"></i>
							Back to login
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
