import { useUser } from '../features/authentication/useUser';
import { Role } from '../types';
import { ProfileForm } from '../features/users/ProfileForm';
import { AvailabilitySchedule } from '../features/users/AvailabilitySchedule';
import { PasswordForm } from '../features/users/PasswordForm';
import { TwoFactorCard } from '../features/users/TwoFactorCard';
import { DeleteAccountCard } from '../features/users/DeleteAccountCard';

function AccountSettings() {
	const { user } = useUser();

	return (
		<div className="mx-auto flex max-w-2xl flex-col gap-8 pb-12 duration-500 animate-in fade-in">
			<div>
				<h2 className="text-3xl font-black text-slate-800">Account Settings</h2>
				<p className="mt-1 text-slate-500">
					Manage your personal profile and security preferences.
				</p>
			</div>

			<ProfileForm />
			{user?.role === Role.DOCTOR && <AvailabilitySchedule />}
			<PasswordForm />
			<TwoFactorCard />
			<DeleteAccountCard />
		</div>
	);
}

export default AccountSettings;
