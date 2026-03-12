import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../features/authentication/useForgotPassword';
import AuthPane from './auth/AuthPane';
import Input from './ui/Input';

function ForgotPassword() {
	const [email, setEmail] = useState('');
	const [sent, setSent] = useState(false);
	const { forgotPassword, isPending } = useForgotPassword();

	const handleSubmit = (e: { preventDefault(): void }) => {
		e.preventDefault();
		if (!email) return;
		forgotPassword(email, {
			onSuccess: () => setSent(true),
		});
	};

	return (
		<div className="min-h-screen flex overflow-hidden font-['Plus_Jakarta_Sans']">
			<AuthPane
				title={
					<>
						Account <br />
						<span className="text-indigo-400">Recovery.</span>
					</>
				}
				description="No worries — it happens to everyone. Enter your email and we'll send you a secure link to reset your password."
				footer={
					<div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-6">
						<div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
							<i className="fas fa-lock text-indigo-300 text-xl"></i>
						</div>
						<div>
							<p className="text-white font-bold text-sm">
								Secure Reset Process
							</p>
							<p className="text-indigo-200/60 text-xs mt-1 font-medium">
								Reset links expire in 10 minutes for your security.
							</p>
						</div>
					</div>
				}
			/>

			{/* Right Pane */}
			<div className="w-full lg:w-2/5 flex items-center justify-center p-8 md:p-20 bg-white">
				<div className="max-w-md w-full">
					<div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
						<div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
							<i className="fas fa-heartbeat text-xl"></i>
						</div>
						<span className="text-2xl font-black text-slate-900">
							HealthSync
						</span>
					</div>

					{sent ? (
						<div className="text-center">
							<div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
								<i className="fas fa-paper-plane text-emerald-500 text-3xl"></i>
							</div>
							<h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
								Check Your Inbox
							</h2>
							<p className="text-slate-500 font-medium mb-10">
								If <span className="font-bold text-slate-700">{email}</span> is
								registered, a reset link is on its way.
							</p>
							<Link
								to="/login"
								className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1"
							>
								<i className="fas fa-arrow-left text-xs opacity-50"></i>
								Back to Login
							</Link>
						</div>
					) : (
						<>
							<div className="mb-10">
								<h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
									Forgot Password
								</h2>
								<p className="text-slate-500 font-medium">
									Enter your email and we'll send you a reset link.
								</p>
							</div>

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

								<button
									type="submit"
									disabled={isPending}
									className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
								>
									Send Reset Link
									<i className="fas fa-arrow-right text-xs opacity-50"></i>
								</button>
							</form>

							<div className="mt-10 text-center">
								<Link
									to="/login"
									className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
								>
									<i className="fas fa-arrow-left text-xs"></i>
									Back to login
								</Link>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default ForgotPassword;
