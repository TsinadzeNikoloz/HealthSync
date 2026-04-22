import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useUser } from '../features/authentication/useUser';

const inputCls =
	'w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none font-semibold text-slate-700 transition-all';
const labelCls =
	'text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1';

function AboutUs() {
	const { user } = useUser();
	const [isOpen, setIsOpen] = useState(false);
	const [form, setForm] = useState({
		name: '',
		email: '',
		subject: '',
		message: '',
	});
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState('');

	// sync user data once it resolves (avoids race condition on initial render)
	useEffect(() => {
		if (user) {
			setForm((f) => ({
				...f,
				name: user.name ?? '',
				email: user.email ?? '',
			}));
		}
	}, [user]);

	const handleSubmit = async (e: { preventDefault(): void }) => {
		e.preventDefault();
		setSending(true);
		setError('');
		try {
			await apiClient.post('/contact', form);
			setSent(true);
			setForm({ name: '', email: '', subject: '', message: '' });
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="mx-auto flex max-w-6xl flex-col gap-16 pb-20 duration-500 animate-in fade-in">
			{/* Hero */}
			<div className="flex flex-col gap-4 text-center">
				<h2 className="text-5xl font-black tracking-tight text-slate-900">
					We Care About Your Health
				</h2>
				<p className="mx-auto max-w-2xl text-xl font-medium text-slate-500">
					Providing world-class healthcare with the latest technology and a
					human touch.
				</p>
			</div>

			{/* Mission */}
			<div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
				<div className="aspect-video overflow-hidden rounded-[3rem] shadow-2xl">
					<img
						src="/HealthSync.png"
						className="h-full w-full object-cover"
						alt="Clinic Interior"
					/>
				</div>
				<div className="flex flex-col gap-6 px-4">
					<div className="flex flex-col gap-2">
						<h3 className="text-2xl font-black text-slate-800">Our Mission</h3>
						<p className="font-medium leading-relaxed text-slate-500">
							To synchronize technology and human expertise to deliver
							personalized healthcare that empowers every patient to live their
							healthiest life.
						</p>
					</div>
				</div>
			</div>

			{/* Why Us */}
			<div className="flex flex-col gap-8">
				<h3 className="text-2xl font-black text-slate-800">
					Why Choose HealthSync
				</h3>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
					{[
						{
							icon: 'fa-user-doctor',
							title: 'Expert Physicians',
							desc: 'Board-certified doctors with years of clinical experience across all major specialties.',
							color: 'bg-blue-50 text-blue-500',
						},
						{
							icon: 'fa-laptop-medical',
							title: 'Modern Technology',
							desc: 'Digital records, online booking, and real-time availability — healthcare built for today.',
							color: 'bg-amber-50 text-amber-500',
						},
						{
							icon: 'fa-heart',
							title: 'Patient First',
							desc: 'Every decision we make is centered around your comfort, safety, and wellbeing.',
							color: 'bg-rose-50 text-rose-500',
						},
					].map((item) => (
						<div
							key={item.title}
							className="flex flex-col gap-4 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm"
						>
							<div
								className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color}`}
							>
								<i className={`fas ${item.icon} text-xl`}></i>
							</div>
							<div>
								<p className="text-lg font-black text-slate-800">
									{item.title}
								</p>
								<p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
									{item.desc}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Contact */}
			<div className="flex flex-col justify-between gap-6 border-t border-slate-100 pt-10 md:flex-row md:items-center">
				<div className="flex flex-col gap-1">
					<p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
						Get in touch
					</p>
					<p className="flex items-center gap-2 font-medium text-slate-600">
						<i className="fas fa-map-marker-alt text-slate-300"></i> Budapest,
						Pázmány Péter stny. 1/C, 1117
					</p>
					<p className="flex items-center gap-2 font-medium text-slate-600">
						<i className="fas fa-envelope text-slate-300"></i>{' '}
						healthsync2026@gmail.com
					</p>
				</div>
				<button
					onClick={() => {
						setIsOpen(true);
						setSent(false);
						setError('');
					}}
					className="self-start rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5 md:self-auto"
				>
					<i className="fas fa-envelope mr-2"></i>Send a Message
				</button>
			</div>

			{/* Contact Modal */}
			<Modal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				title="Contact Support"
				subtitle="We'll get back to you as soon as possible."
			>
				{sent ? (
					<div className="flex flex-col items-center gap-4 py-8 text-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
							<i className="fas fa-check text-2xl text-blue-500"></i>
						</div>
						<p className="text-lg font-black text-slate-800">Message sent!</p>
						<p className="font-medium text-slate-500">
							We'll be in touch soon.
						</p>
						<Button onClick={() => setIsOpen(false)} className="mt-2">
							Close
						</Button>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="flex flex-col gap-5">
						{error && (
							<div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
								{error}
							</div>
						)}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="flex flex-col gap-2">
								<label className={labelCls}>Your Name</label>
								<input
									className={inputCls}
									value={form.name}
									onChange={(e) =>
										setForm((f) => ({ ...f, name: e.target.value }))
									}
									placeholder="John Doe"
									required
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label className={labelCls}>Your Email</label>
								<input
									type="email"
									className={inputCls}
									value={form.email}
									onChange={(e) =>
										setForm((f) => ({ ...f, email: e.target.value }))
									}
									placeholder="you@email.com"
									required
								/>
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<label className={labelCls}>Subject</label>
							<input
								className={inputCls}
								value={form.subject}
								onChange={(e) =>
									setForm((f) => ({ ...f, subject: e.target.value }))
								}
								placeholder="How can we help?"
								required
							/>
						</div>
						<div className="flex flex-col gap-2">
							<label className={labelCls}>Message</label>
							<textarea
								className={`${inputCls} resize-none`}
								rows={4}
								value={form.message}
								onChange={(e) =>
									setForm((f) => ({ ...f, message: e.target.value }))
								}
								placeholder="Describe your issue or question..."
								required
							/>
						</div>
						<div className="pt-2">
							<Button type="submit" className="w-full py-5" disabled={sending}>
								{sending ? 'Sending...' : 'Send Message'}
							</Button>
						</div>
					</form>
				)}
			</Modal>
		</div>
	);
}

export default AboutUs;
