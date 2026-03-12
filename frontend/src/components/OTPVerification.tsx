import React, { useState } from 'react';
import { useVerifyOTP } from '../features/authentication/useVerifyOTP';

const inputCls =
	'w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none font-semibold text-slate-700 transition-all';
const labelCls = 'text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1';

interface OTPVerificationProps {
	pendingEmail: string;
	onBack: () => void;
}

export function OTPVerification({ pendingEmail, onBack }: OTPVerificationProps) {
	const [otp, setOtp] = useState('');
	const { verifyOTP, isPending } = useVerifyOTP();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		verifyOTP({ email: pendingEmail, otp });
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-50 font-['Plus_Jakarta_Sans']">
			<div className="bg-white p-12 rounded-[3rem] shadow-xl max-w-md w-full">
				<div className="flex items-center gap-3 mb-10 justify-center">
					<div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
						<i className="fas fa-heartbeat text-xl"></i>
					</div>
					<span className="text-2xl font-black text-slate-900">HealthSync</span>
				</div>
				<h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight text-center">
					Verify Identity
				</h2>
				<p className="text-slate-500 font-medium text-center mb-10">
					Enter the code sent to{' '}
					<span className="font-bold text-slate-700">{pendingEmail}</span>
				</p>
				<form onSubmit={handleSubmit} className="space-y-6">
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
						onClick={onBack}
						className="w-full text-slate-400 font-bold hover:text-slate-600 transition-colors pt-2"
					>
						Back to login
					</button>
				</form>
			</div>
		</div>
	);
}
