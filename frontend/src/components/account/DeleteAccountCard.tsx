import { useState } from 'react';
import { useDeleteAccount } from '../../features/authentication/useDeleteAccount';
import ConfirmModal from '../ui/ConfirmModal';

export function DeleteAccountCard() {
	const [showConfirm, setShowConfirm] = useState(false);
	const { deleteAccount, isPending } = useDeleteAccount();

	return (
		<>
			<div className="bg-white p-10 rounded-[2.5rem] border border-rose-100 shadow-sm">
				<div className="flex flex-col gap-1 mb-6">
					<h3 className="text-lg font-black text-rose-600">Danger Zone</h3>
					<p className="text-sm text-slate-500">
						Permanently delete your account and all associated data. This action cannot be undone.
					</p>
				</div>
				<button
					type="button"
					onClick={() => setShowConfirm(true)}
					className="px-6 py-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl font-bold text-sm hover:bg-rose-100 transition-all"
				>
					<i className="fas fa-trash-alt mr-2"></i>Delete My Account
				</button>
			</div>

			{showConfirm && (
				<ConfirmModal
					title="Delete Account"
					message="This will permanently delete your account and all your data — appointments, records, and messages. This cannot be reversed."
					confirmLabel={isPending ? 'Deleting...' : 'Delete Account'}
					onConfirm={() => deleteAccount()}
					onCancel={() => setShowConfirm(false)}
				/>
			)}
		</>
	);
}
