import { useUser } from '../../features/authentication/useUser';
import { useUpdateUser } from '../../features/authentication/useUpdateUser';

export function TwoFactorCard() {
	const { user } = useUser();
	const { updateUser, isUpdating } = useUpdateUser();

	const handleToggle = () => {
		const fd = new FormData();
		fd.append('twoFactorEnabled', String(!user?.twoFactorEnabled));
		updateUser(fd);
	};

	return (
		<div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
			<div className="flex items-start justify-between gap-6">
				<div className="flex items-start gap-4">
					<div
						className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${user?.twoFactorEnabled ? 'bg-emerald-50' : 'bg-slate-50'}`}
					>
						<i
							className={`fas fa-shield-alt text-xl ${user?.twoFactorEnabled ? 'text-emerald-500' : 'text-slate-300'}`}
						></i>
					</div>
					<div>
						<h3 className="text-lg font-black text-slate-800">
							Two-Factor Authentication
						</h3>
						<p className="text-sm text-slate-400 font-medium mt-1">
							{user?.twoFactorEnabled
								? 'Your account is protected. An OTP code will be required on every login.'
								: 'Add an extra layer of security. An OTP code will be sent to your email on login.'}
						</p>
					</div>
				</div>

				<button
					type="button"
					disabled={isUpdating}
					onClick={handleToggle}
					className={`w-14 h-7 rounded-full transition-all flex-shrink-0 relative disabled:opacity-50 ${user?.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
				>
					<span
						className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${user?.twoFactorEnabled ? 'left-[calc(100%-1.625rem)]' : 'left-0.5'}`}
					/>
				</button>
			</div>

			{user?.twoFactorEnabled && (
				<div className="mt-5 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex items-center gap-3 text-sm text-emerald-700 font-semibold">
					<i className="fas fa-check-circle text-emerald-500"></i>
					Two-factor authentication is active on your account.
				</div>
			)}
		</div>
	);
}
