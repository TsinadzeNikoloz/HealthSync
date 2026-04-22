import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserPhotoUrl, getServiceImageUrl, formatCurrency } from '../utils/helpers';
import { useService } from '../features/services/useService';
import { useReviews } from '../features/reviews/useReviews';
import { useCreateReview } from '../features/reviews/useCreateReview';
import { useCheckout } from '../features/appointments/useCheckout';
import { useAvailableSlots } from '../features/appointments/useAvailableSlots';
import { useUser } from '../features/authentication/useUser';
import { Role } from '../types';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';

const CATEGORY_COLORS: Record<string, string> = {
	CONSULTATION: 'bg-blue-50 text-blue-600',
	TREATMENT: 'bg-blue-50 text-blue-600',
	DIAGNOSTIC: 'bg-amber-50 text-amber-600',
	THERAPY: 'bg-blue-50 text-blue-600',
	SURGERY: 'bg-rose-50 text-rose-600',
};

function ServiceDetail() {
	const { slug } = useParams<{ slug: string }>();
	const navigate = useNavigate();
	const { user } = useUser();
	const { service, isPending } = useService(slug!);
	const { reviews } = useReviews(service?._id);
	const { createReview, isCreating } = useCreateReview();
	const { checkout, isCheckingOut } = useCheckout();

	const [isBooking, setIsBooking] = useState(false);
	const [bookingData, setBookingData] = useState({
		doctorId: '',
		date: '',
		time: '',
	});

	const { slots, isPending: slotsLoading } = useAvailableSlots(
		bookingData.doctorId || undefined,
		bookingData.date || undefined,
		service?.duration,
	);

	const [isReviewing, setIsReviewing] = useState(false);
	const [reviewText, setReviewText] = useState('');
	const [reviewRating, setReviewRating] = useState(5);

	const isPatient = user?.role === Role.PATIENT;

	const handleBook = (e: { preventDefault(): void }) => {
		e.preventDefault();
		if (
			!service?._id ||
			!bookingData.doctorId ||
			!bookingData.date ||
			!bookingData.time
		)
			return;
		checkout({
			serviceId: service._id,
			doctor: bookingData.doctorId,
			date: `${bookingData.date}T${bookingData.time}:00`,
		});
	};

	const handleReview = (e: { preventDefault(): void }) => {
		e.preventDefault();
		if (!service?._id || !reviewText) return;
		createReview(
			{ review: reviewText, rating: reviewRating, service: service._id },
			{
				onSuccess: () => {
					setIsReviewing(false);
					setReviewText('');
					setReviewRating(5);
				},
			},
		);
	};

	if (isPending) return <Spinner />;

	if (!service) {
		return (
			<EmptyState
				icon="fa-stethoscope"
				title="Service not found"
				description="This service may have been removed or the link is invalid."
			/>
		);
	}

	const categoryColor =
		CATEGORY_COLORS[service.category] || 'bg-slate-50 text-slate-600';

	const serviceDoctors = service.doctors ?? [];

	return (
		<div className="mx-auto max-w-5xl pb-16 duration-500 animate-in fade-in">
			{/* Back */}
			<button
				onClick={() => navigate(-1)}
				className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-slate-700"
			>
				<i className="fas fa-arrow-left"></i> Back
			</button>

			{/* Hero */}
			<div className="relative mb-10 h-64 overflow-hidden rounded-[2.5rem] sm:h-96 md:h-[28rem]">
				<img
					src={getServiceImageUrl(service.imageCover)}
					alt={service.name}
					className="h-full w-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent"></div>
				<div className="absolute bottom-5 left-5 right-5 flex flex-col gap-3 sm:bottom-8 sm:left-10 sm:right-10 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<span
							className={`rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest ${categoryColor} mb-2 inline-block`}
						>
							{service.category}
						</span>
						<h1 className="text-2xl font-black leading-tight text-white sm:text-4xl">
							{service.name}
						</h1>
					</div>
					<div className="self-start rounded-2xl bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur sm:self-auto sm:px-6 sm:py-3 sm:text-right">
						<p className="text-xl font-black text-blue-600 sm:text-2xl">
							{formatCurrency(service.price)}
						</p>
						{service.priceDiscount && (
							<p className="text-xs text-slate-400 line-through">
								{formatCurrency(service.priceDiscount)}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Stats row */}
			<div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
				{[
					{
						icon: 'fa-clock',
						label: 'Duration',
						value: `${service.duration} min`,
					},
					{
						icon: 'fa-star',
						label: 'Rating',
						value: `${service.ratingsAverage?.toFixed(1) || '—'} (${service.ratingsQuantity || 0})`,
					},
				].map((stat) => (
					<div
						key={stat.label}
						className="rounded-[2rem] border border-slate-100 bg-white p-6 text-center shadow-sm"
					>
						<i className={`fas ${stat.icon} mb-2 text-xl text-blue-400`}></i>
						<p className="text-xl font-black text-slate-800">{stat.value}</p>
						<p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
							{stat.label}
						</p>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				{/* Left: description + reviews */}
				<div className="flex flex-col gap-8 lg:col-span-2">
					{/* Description */}
					<div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-sm">
						<h2 className="mb-4 text-xl font-black text-slate-800">
							About this Service
						</h2>
						<p className="font-medium leading-relaxed text-slate-500">
							{service.description || service.summary}
						</p>
					</div>

					{/* Reviews */}
					<div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-sm">
						<div className="mb-6 flex items-center justify-between">
							<h2 className="text-xl font-black text-slate-800">
								Patient Reviews
							</h2>
							{isPatient && (
								<button
									onClick={() => setIsReviewing(true)}
									className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
								>
									<i className="fas fa-pen mr-2"></i>Write Review
								</button>
							)}
						</div>

						{reviews.length === 0 ? (
							<p className="py-8 text-center font-medium italic text-slate-400">
								No reviews yet. Be the first!
							</p>
						) : (
							<div className="flex flex-col gap-6">
								{reviews.map((r) => (
									<div
										key={r.id}
										className="flex gap-4 border-b border-slate-50 pb-6 last:border-0 last:pb-0"
									>
										<img
											src={getUserPhotoUrl(r.user.photo, r.user.name)}
											className="h-10 w-10 flex-shrink-0 rounded-2xl object-cover"
											alt={r.user.name}
										/>
										<div className="flex-1">
											<div className="mb-1 flex items-center justify-between">
												<p className="text-sm font-bold text-slate-800">
													{r.user.name}
												</p>
												<div className="flex gap-0.5">
													{Array.from({ length: 5 }).map((_, i) => (
														<i
															key={i}
															className={`fas fa-star text-xs ${i < r.rating ? 'text-amber-400' : 'text-slate-200'}`}
														></i>
													))}
												</div>
											</div>
											<p className="text-sm leading-relaxed text-slate-500">
												{r.review}
											</p>
											<p className="mt-2 text-[10px] font-bold text-slate-300">
												{new Date(r.createdAt).toLocaleDateString()}
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Right: doctors + book */}
				<div className="flex flex-col gap-6">
					{!user ? (
						<button
							onClick={() => navigate('/login')}
							className="w-full rounded-2xl bg-blue-600 py-5 text-lg font-black text-white shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-95"
						>
							Sign In to Book
						</button>
					) : (
						isPatient && (
							<button
								onClick={() => setIsBooking(true)}
								className="w-full rounded-2xl bg-blue-600 py-5 text-lg font-black text-white shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-95"
							>
								Book Session
							</button>
						)
					)}

					<div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
						<h2 className="mb-6 text-base font-black text-slate-800">
							Assigned Physicians
						</h2>
						{serviceDoctors.length === 0 ? (
							<p className="text-sm font-medium italic text-slate-400">
								No doctors assigned yet.
							</p>
						) : (
							<div className="flex flex-col gap-4">
								{serviceDoctors.map((d) => (
									<div key={d._id} className="flex items-center gap-4">
										<img
											src={getUserPhotoUrl(undefined, d.name)}
											className="h-11 w-11 rounded-2xl border-2 border-slate-100 object-cover"
											alt={d.name}
										/>
										<div>
											<p className="text-sm font-bold text-slate-800">
												{d.name}
											</p>
											<p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
												{d.email}
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Booking Modal */}
			<Modal
				isOpen={isBooking}
				onClose={() => setIsBooking(false)}
				title="Book Session"
				subtitle={service.name}
			>
				<form onSubmit={handleBook} className="space-y-6">
					<Select
						label="Assigned Physician"
						icon="fa-user-md"
						value={bookingData.doctorId}
						onChange={(e) =>
							setBookingData({
								...bookingData,
								doctorId: e.target.value,
								date: '',
								time: '',
							})
						}
						options={[
							{ value: '', label: 'Select a Doctor' },
							...serviceDoctors.map((d) => ({ value: d._id, label: d.name })),
						]}
						required
					/>
					<Input
						label="Date"
						type="date"
						value={bookingData.date}
						onChange={(e) =>
							setBookingData({ ...bookingData, date: e.target.value, time: '' })
						}
						min={new Date().toISOString().slice(0, 10)}
						required
					/>

					{bookingData.doctorId && bookingData.date && (
						<div className="space-y-3">
							<label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
								Available Time Slots
							</label>
							{slotsLoading ? (
								<div className="flex items-center gap-2 py-2 text-sm font-semibold text-slate-400">
									<span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-transparent"></span>
									Checking availability...
								</div>
							) : slots.length === 0 ? (
								<p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-400">
									No available slots on this day. Try a different date.
								</p>
							) : (
								<div className="flex flex-wrap gap-2">
									{slots.map((slot) => (
										<button
											key={slot}
											type="button"
											onClick={() =>
												setBookingData((b) => ({ ...b, time: slot }))
											}
											className={`rounded-2xl border px-4 py-2 text-sm font-black transition-all ${
												bookingData.time === slot
													? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100'
													: 'border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200 hover:text-blue-600'
											}`}
										>
											{slot}
										</button>
									))}
								</div>
							)}
							<input type="hidden" value={bookingData.time} required />
						</div>
					)}
					<div className="pt-4">
						<Button
							type="submit"
							className="w-full py-5"
							disabled={isCheckingOut}
						>
							{isCheckingOut ? (
								<span className="flex items-center justify-center gap-3">
									<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
									Redirecting to payment...
								</span>
							) : (
								'Confirm Reservation'
							)}
						</Button>
					</div>
				</form>
			</Modal>

			{/* Review Modal */}
			<Modal
				isOpen={isReviewing}
				onClose={() => setIsReviewing(false)}
				title="Write a Review"
				subtitle={service.name}
			>
				<form onSubmit={handleReview} className="space-y-6">
					<div className="space-y-2">
						<label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
							Rating
						</label>
						<div className="flex gap-2">
							{[1, 2, 3, 4, 5].map((n) => (
								<button
									key={n}
									type="button"
									onClick={() => setReviewRating(n)}
									className={`text-2xl transition-transform hover:scale-110 ${n <= reviewRating ? 'text-amber-400' : 'text-slate-200'}`}
								>
									<i className="fas fa-star"></i>
								</button>
							))}
						</div>
					</div>
					<div className="space-y-2">
						<label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
							Your Review
						</label>
						<textarea
							value={reviewText}
							onChange={(e) => setReviewText(e.target.value)}
							rows={4}
							required
							placeholder="Share your experience..."
							className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10"
						/>
					</div>
					<div className="pt-4">
						<Button type="submit" className="w-full py-5" disabled={isCreating}>
							{isCreating ? 'Submitting...' : 'Submit Review'}
						</Button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

export default ServiceDetail;
