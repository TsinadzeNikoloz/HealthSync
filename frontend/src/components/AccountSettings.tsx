import { useUser } from '../features/authentication/useUser';
import { Role } from '../types';
import { ProfileForm } from './account/ProfileForm';
import { AvailabilitySchedule } from './account/AvailabilitySchedule';
import { PasswordForm } from './account/PasswordForm';
import { TwoFactorCard } from './account/TwoFactorCard';
import { DeleteAccountCard } from './account/DeleteAccountCard';

function AccountSettings() {
	const { user } = useUser();

	return (
		<div className="max-w-2xl mx-auto flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
			<div>
				<h2 className="text-3xl font-black text-slate-800">Account Settings</h2>
				<p className="text-slate-500 mt-1">
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
