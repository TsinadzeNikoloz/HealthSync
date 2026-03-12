import React, { useState, useEffect } from 'react';
import { useUser } from '../../features/authentication/useUser';
import { useUpdateAvailability } from '../../features/appointments/useUpdateAvailability';
import { AvailabilitySlot } from '../../types';

const DAYS = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
];

interface DaySlot {
	enabled: boolean;
	startTime: string;
	endTime: string;
}

const DEFAULT_SLOT: DaySlot = { enabled: false, startTime: '09:00', endTime: '17:00' };

export function AvailabilitySchedule() {
	const { user } = useUser();
	const { saveAvailability, isSaving } = useUpdateAvailability();

	const [schedule, setSchedule] = useState<DaySlot[]>(
		DAYS.map(() => ({ ...DEFAULT_SLOT })),
	);

	useEffect(() => {
		if (user?.availability) {
			setSchedule((prev) =>
				prev.map((slot, i) => {
					const match = user.availability!.find(
						(a: AvailabilitySlot) => a.dayOfWeek === i,
					);
					return match
						? { enabled: true, startTime: match.startTime, endTime: match.endTime }
						: { ...slot, enabled: false };
				}),
			);
		}
	}, [user]);

	const updateDay = (i: number, patch: Partial<DaySlot>) =>
		setSchedule((prev) =>
			prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)),
		);

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		const availability: AvailabilitySlot[] = schedule
			.map((d, i) => ({ dayOfWeek: i, startTime: d.startTime, endTime: d.endTime, enabled: d.enabled }))
			.filter((d) => d.enabled)
			.map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }));
		saveAvailability(availability);
	};

	return (
		<form
			onSubmit={handleSave}
			className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6"
		>
			<div>
				<h3 className="text-lg font-black text-slate-800">Weekly Availability</h3>
				<p className="text-sm text-slate-400 font-medium mt-1">
					Set the days and hours when patients can book appointments with you.
				</p>
			</div>

			<div className="flex flex-col gap-3">
				{DAYS.map((day, i) => (
					<div
						key={day}
						className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${schedule[i].enabled ? 'border-indigo-100 bg-indigo-50/40' : 'border-slate-100 bg-slate-50/50'}`}
					>
						<button
							type="button"
							onClick={() => updateDay(i, { enabled: !schedule[i].enabled })}
							className={`w-11 h-6 rounded-full transition-all flex-shrink-0 relative ${schedule[i].enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
						>
							<span
								className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${schedule[i].enabled ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'}`}
							/>
						</button>

						<span
							className={`w-24 text-sm font-black ${schedule[i].enabled ? 'text-indigo-700' : 'text-slate-400'}`}
						>
							{day}
						</span>

						{schedule[i].enabled ? (
							<div className="flex items-center gap-2 flex-1">
								<input
									type="time"
									value={schedule[i].startTime}
									onChange={(e) => updateDay(i, { startTime: e.target.value })}
									className="flex-1 px-3 py-2 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10"
								/>
								<span className="text-slate-300 font-bold text-sm">to</span>
								<input
									type="time"
									value={schedule[i].endTime}
									onChange={(e) => updateDay(i, { endTime: e.target.value })}
									className="flex-1 px-3 py-2 bg-white border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10"
								/>
							</div>
						) : (
							<span className="text-xs text-slate-300 font-bold uppercase tracking-widest">
								Unavailable
							</span>
						)}
					</div>
				))}
			</div>

			<div className="pt-4 border-t border-slate-50 flex justify-end">
				<button
					type="submit"
					disabled={isSaving}
					className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 disabled:opacity-70"
				>
					{isSaving ? 'Saving...' : 'Save Schedule'}
				</button>
			</div>
		</form>
	);
}
