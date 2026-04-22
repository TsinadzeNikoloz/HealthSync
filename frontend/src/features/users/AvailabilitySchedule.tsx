import React, { useState } from 'react';
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

const DEFAULT_SLOT: DaySlot = {
	enabled: false,
	startTime: '09:00',
	endTime: '17:00',
};

export function AvailabilitySchedule() {
	const { user } = useUser();
	const { saveAvailability, isSaving } = useUpdateAvailability();

	// null = no local edits yet, derive from server data on each render
	const [edits, setEdits] = useState<DaySlot[] | null>(null);

	const schedule: DaySlot[] =
		edits ??
		DAYS.map((_, i) => {
			const match = user?.availability?.find(
				(a: AvailabilitySlot) => a.dayOfWeek === i,
			);
			return match
				? { enabled: true, startTime: match.startTime, endTime: match.endTime }
				: { ...DEFAULT_SLOT };
		});

	const updateDay = (i: number, patch: Partial<DaySlot>) =>
		setEdits((prev) =>
			(prev ?? schedule).map((d, idx) => (idx === i ? { ...d, ...patch } : d)),
		);

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		const availability: AvailabilitySlot[] = schedule
			.map((d, i) => ({
				dayOfWeek: i,
				startTime: d.startTime,
				endTime: d.endTime,
				enabled: d.enabled,
			}))
			.filter((d) => d.enabled)
			.map(({ dayOfWeek, startTime, endTime }) => ({
				dayOfWeek,
				startTime,
				endTime,
			}));
		saveAvailability(availability);
	};

	return (
		<form
			onSubmit={handleSave}
			className="space-y-6 rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-sm"
		>
			<div>
				<h3 className="text-lg font-black text-slate-800">
					Weekly Availability
				</h3>
				<p className="mt-1 text-sm font-medium text-slate-400">
					Set the days and hours when patients can book appointments with you.
				</p>
			</div>

			<div className="flex flex-col gap-3">
				{DAYS.map((day, i) => (
					<div
						key={day}
						className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${schedule[i].enabled ? 'border-blue-100 bg-blue-50/40' : 'border-slate-100 bg-slate-50/50'}`}
					>
						<button
							type="button"
							onClick={() => updateDay(i, { enabled: !schedule[i].enabled })}
							className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-all ${schedule[i].enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
						>
							<span
								className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${schedule[i].enabled ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'}`}
							/>
						</button>

						<span
							className={`w-24 text-sm font-black ${schedule[i].enabled ? 'text-blue-700' : 'text-slate-400'}`}
						>
							{day}
						</span>

						{schedule[i].enabled ? (
							<div className="flex flex-1 items-center gap-2">
								<input
									type="time"
									value={schedule[i].startTime}
									onChange={(e) => updateDay(i, { startTime: e.target.value })}
									className="flex-1 rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10"
								/>
								<span className="text-sm font-bold text-slate-300">to</span>
								<input
									type="time"
									value={schedule[i].endTime}
									onChange={(e) => updateDay(i, { endTime: e.target.value })}
									className="flex-1 rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10"
								/>
							</div>
						) : (
							<span className="text-xs font-bold uppercase tracking-widest text-slate-300">
								Unavailable
							</span>
						)}
					</div>
				))}
			</div>

			<div className="flex justify-end border-t border-slate-100 pt-4">
				<button
					type="submit"
					disabled={isSaving}
					className="rounded-2xl bg-blue-600 px-10 py-4 font-bold text-white shadow-xl shadow-blue-100 transition-all hover:bg-blue-700 disabled:opacity-70"
				>
					{isSaving ? 'Saving...' : 'Save Schedule'}
				</button>
			</div>
		</form>
	);
}
