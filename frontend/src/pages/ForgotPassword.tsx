import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../features/authentication/useForgotPassword';
import AppLogo from '../ui/AppLogo';
import AuthPane from '../features/authentication/AuthPane';
import Input from '../ui/Input';

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
		<div className="flex min-h-screen overflow-hidden font-['Plus_Jakarta_Sans']">
			<AuthPane
				title={
					<>
						Account <br />
						<span className="text-blue-400">Recovery.</span>
					</>
				}
				description="No worries — it happens to everyone. Enter your email and we'll send you a secure link to reset your password."
				footer={
					<div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
						<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/20">
							<i className="fas fa-lock text-xl text-blue-300"></i>
						</div>
						<div>
							<p className="text-sm font-bold text-white">
								Secure Reset Process
							</p>
							<p className="mt-1 text-xs font-medium text-blue-200/60">
								Reset links expire in 10 minutes for your security.
							</p>
						</div>
					</div>
				}
			/>

			{/* Right Pane */}
			<div className="flex w-full items-center justify-center bg-white p-8 md:p-20 lg:w-2/5">
				<div className="w-full max-w-md">
					<AppLogo className="mb-10 justify-center lg:hidden" />

					{sent ? (
						<div className="text-center">
							<div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-blue-50">
								<i className="fas fa-paper-plane text-3xl text-blue-500"></i>
							</div>
							<h2 className="mb-3 text-3xl font-black tracking-tight text-slate-900">
								Check Your Inbox
							</h2>
							<p className="mb-10 font-medium text-slate-500">
								If <span className="font-bold text-slate-700">{email}</span> is
								registered, a reset link is on its way.
							</p>
							<Link
								to="/login"
								className="inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-10 py-4 font-black text-white shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 hover:bg-blue-700"
							>
								<i className="fas fa-arrow-left text-xs opacity-50"></i>
								Back to Login
							</Link>
						</div>
					) : (
						<>
							<div className="mb-10">
								<h2 className="mb-3 text-4xl font-black tracking-tight text-slate-900">
									Forgot Password
								</h2>
								<p className="font-medium text-slate-500">
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
									className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 font-black text-white shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 hover:bg-blue-700 active:scale-95 disabled:opacity-70"
								>
									{isPending ? 'Sending...' : 'Send Reset Link'}
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
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default ForgotPassword;
