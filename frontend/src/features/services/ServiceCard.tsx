import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Service } from '../../types';
import ConfirmModal from '../../ui/ConfirmModal';
import { formatCurrency, getServiceImageUrl } from '../../utils/helpers';

interface ServiceCardProps {
	service: Service;
	isAdmin?: boolean;
	onEdit?: (service: Service) => void;
	onDelete?: (id: string) => void;
}

function StarRating({ rating }: { rating: number }) {
	const full = Math.floor(rating);
	const half = rating % 1 >= 0.5;
	const empty = 5 - full - (half ? 1 : 0);
	return (
		<span className="flex items-center gap-0.5">
			{Array(full)
				.fill(0)
				.map((_, i) => (
					<i key={`f${i}`} className="fas fa-star text-[9px] text-amber-400" />
				))}
			{half && <i className="fas fa-star-half-alt text-[9px] text-amber-400" />}
			{Array(empty)
				.fill(0)
				.map((_, i) => (
					<i key={`e${i}`} className="fas fa-star text-[9px] text-slate-200" />
				))}
		</span>
	);
}

function ServiceCard({ service, isAdmin, onEdit, onDelete }: ServiceCardProps) {
	const navigate = useNavigate();
	const [showConfirm, setShowConfirm] = useState(false);

	return (
		<div className="card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
			<div className="relative aspect-video overflow-hidden">
				<img
					src={getServiceImageUrl(service.imageCover)}
					alt={service.name}
					className="h-full w-full transform object-cover transition-transform duration-500 hover:scale-105"
				/>
				{/* Gradient overlay for visual depth */}
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

				{/* Price badge */}
				<div className="absolute right-4 top-4 rounded-2xl border border-slate-100 bg-white/95 px-4 py-2 shadow-sm backdrop-blur">
					<span className="text-sm font-black text-blue-600">
						{formatCurrency(service.price)}
					</span>
				</div>

				{/* Category badge */}
				{service.category && (
					<div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-3 py-1 backdrop-blur">
						<span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
							{service.category}
						</span>
					</div>
				)}

				{/* Admin controls */}
				{isAdmin && (
					<div className="absolute left-4 top-4 flex gap-2">
						<button
							onClick={() => onEdit?.(service)}
							aria-label={`Edit ${service.name}`}
							className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-blue-600"
						>
							<i className="fas fa-pen text-xs"></i>
						</button>
						<button
							onClick={() => setShowConfirm(true)}
							aria-label={`Delete ${service.name}`}
							className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-colors hover:text-rose-500"
						>
							<i className="fas fa-trash text-xs"></i>
						</button>
					</div>
				)}
			</div>

			<div className="flex flex-1 flex-col p-8">
				<h3 className="mb-2 text-xl font-bold text-slate-800">
					{service.name}
				</h3>
				<p className="mb-6 flex-1 text-sm leading-relaxed text-slate-500">
					{service.summary}
				</p>

				<div className="flex flex-col gap-4 border-t border-slate-50 pt-6 md:flex-row md:items-center md:justify-between">
					<div className="flex items-center justify-center gap-4 md:justify-start">
						<div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
							<i className="fas fa-clock text-blue-400"></i>
							{service.duration} Mins
						</div>
						<div className="flex items-center gap-1.5">
							<StarRating rating={service.ratingsAverage || 0} />
							<span className="text-[10px] font-black text-slate-400">
								{(service.ratingsAverage || 0).toFixed(1)}
							</span>
						</div>
					</div>
					<button
						onClick={() => navigate(`/services/${service.slug ?? service.id}`)}
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-100 transition-colors hover:bg-blue-700 active:scale-95 md:w-auto"
					>
						{isAdmin ? 'View' : 'Book Session'}
						<i className="fas fa-arrow-right text-xs" />
					</button>
				</div>
			</div>

			{showConfirm && (
				<ConfirmModal
					title="Delete Service"
					message={`Are you sure you want to delete "${service.name}"? This cannot be undone.`}
					confirmLabel="Delete"
					onConfirm={() => {
						setShowConfirm(false);
						onDelete?.(service.id);
					}}
					onCancel={() => setShowConfirm(false)}
				/>
			)}
		</div>
	);
}

export default ServiceCard;
