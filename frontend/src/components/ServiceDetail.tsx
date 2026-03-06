import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserPhotoUrl } from '../utils/helpers';
import { useService } from '../features/services/useService';
import { useReviews } from '../features/reviews/useReviews';
import { useCreateReview } from '../features/reviews/useCreateReview';
import { useCheckout } from '../features/appointments/useCheckout';
import { useAvailableSlots } from '../features/appointments/useAvailableSlots';
import { useUser } from '../features/authentication/useUser';
import { Role } from '../types';
import Modal from './ui/Modal';
import Select from './ui/Select';
import Input from './ui/Input';
import Button from './ui/Button';

const CATEGORY_COLORS: Record<string, string> = {
  CONSULTATION: 'bg-indigo-50 text-indigo-600',
  TREATMENT: 'bg-emerald-50 text-emerald-600',
  DIAGNOSTIC: 'bg-amber-50 text-amber-600',
  THERAPY: 'bg-purple-50 text-purple-600',
  SURGERY: 'bg-rose-50 text-rose-600',
};

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { service, isPending } = useService(id!);
  const { reviews } = useReviews(id);
  const { createReview, isCreating } = useCreateReview();
  const { checkout, isCheckingOut } = useCheckout();


  const [isBooking, setIsBooking] = useState(false);
  const [bookingData, setBookingData] = useState({ doctorId: '', date: '', time: '' });

  const { slots, isPending: slotsLoading } = useAvailableSlots(
    bookingData.doctorId || undefined,
    bookingData.date || undefined,
    id,
  );

  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const isPatient = user?.role === Role.PATIENT;

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !bookingData.doctorId || !bookingData.date || !bookingData.time) return;
    checkout({
      serviceId: id,
      doctor: bookingData.doctorId,
      date: `${bookingData.date}T${bookingData.time}:00`,
    });
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !reviewText) return;
    createReview(
      { review: reviewText, rating: reviewRating, service: id },
      { onSuccess: () => { setIsReviewing(false); setReviewText(''); setReviewRating(5); } }
    );
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-24 text-slate-400 font-bold">Service not found.</div>
    );
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const categoryColor = CATEGORY_COLORS[service.category] || 'bg-slate-50 text-slate-600';

  const serviceDoctors = service.doctors ?? [];

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-in fade-in duration-500">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-700 font-bold text-sm mb-8 transition-colors"
      >
        <i className="fas fa-arrow-left"></i> Back
      </button>

      {/* Hero */}
      <div className="relative rounded-[2.5rem] overflow-hidden h-72 mb-10">
        <img
          src={service.imageCover || `https://picsum.photos/seed/${service.name.replace(/\s+/g, '-').toLowerCase()}/1200/500`}
          alt={service.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent"></div>
        <div className="absolute bottom-8 left-10 right-10 flex items-end justify-between">
          <div>
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${categoryColor} mb-3 inline-block`}>
              {service.category}
            </span>
            <h1 className="text-4xl font-black text-white">{service.name}</h1>
          </div>
          <div className="bg-white/95 backdrop-blur px-6 py-3 rounded-2xl shadow-xl text-right">
            <p className="text-2xl font-black text-indigo-600">{formatCurrency(service.price)}</p>
            {service.priceDiscount && (
              <p className="text-xs text-slate-400 line-through">{formatCurrency(service.price)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { icon: 'fa-clock', label: 'Duration', value: `${service.duration} min` },
          { icon: 'fa-star', label: 'Rating', value: `${service.ratingsAverage?.toFixed(1) || '—'} (${service.ratingsQuantity || 0})` },
          { icon: 'fa-users', label: 'Max Patients', value: service.maxPatients },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm text-center">
            <i className={`fas ${stat.icon} text-indigo-400 text-xl mb-2`}></i>
            <p className="text-xl font-black text-slate-800">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: description + reviews */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Description */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-800 mb-4">About this Service</h2>
            <p className="text-slate-500 leading-relaxed font-medium">
              {service.description || service.summary}
            </p>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-800">Patient Reviews</h2>
              {isPatient && (
                <button
                  onClick={() => setIsReviewing(true)}
                  className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                >
                  <i className="fas fa-pen mr-2"></i>Write Review
                </button>
              )}
            </div>

            {reviews.length === 0 ? (
              <p className="text-slate-400 font-medium italic text-center py-8">No reviews yet. Be the first!</p>
            ) : (
              <div className="flex flex-col gap-6">
                {reviews.map(r => (
                  <div key={r.id} className="flex gap-4 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <img
                      src={getUserPhotoUrl(r.user.photo, r.user.name)}
                      className="w-10 h-10 rounded-2xl flex-shrink-0 object-cover"
                      alt={r.user.name}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-slate-800 text-sm">{r.user.name}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i key={i} className={`fas fa-star text-xs ${i < r.rating ? 'text-amber-400' : 'text-slate-200'}`}></i>
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed">{r.review}</p>
                      <p className="text-[10px] text-slate-300 font-bold mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: doctors + book */}
        <div className="flex flex-col gap-6">
          {isPatient && (
            <button
              onClick={() => setIsBooking(true)}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:-translate-y-1 active:scale-95 transition-all"
            >
              Book Session
            </button>
          )}

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h2 className="text-base font-black text-slate-800 mb-6">Assigned Physicians</h2>
            {serviceDoctors.length === 0 ? (
              <p className="text-slate-400 text-sm font-medium italic">No doctors assigned yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {serviceDoctors.map(d => (
                  <div key={d._id} className="flex items-center gap-4">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=6366f1&color=fff&size=44`}
                      className="w-11 h-11 rounded-2xl object-cover border-2 border-slate-100"
                      alt={d.name}
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{d.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{d.email}</p>
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
            onChange={(e) => setBookingData({ ...bookingData, doctorId: e.target.value, date: '', time: '' })}
            options={[
              { value: '', label: 'Select a Doctor' },
              ...serviceDoctors.map(d => ({ value: d._id, label: d.name })),
            ]}
            required
          />
          <Input
            label="Date"
            type="date"
            value={bookingData.date}
            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value, time: '' })}
            min={new Date().toISOString().slice(0, 10)}
            required
          />

          {bookingData.doctorId && bookingData.date && (
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                Available Time Slots
              </label>
              {slotsLoading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold py-2">
                  <span className="w-4 h-4 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin"></span>
                  Checking availability...
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm font-semibold text-rose-400 bg-rose-50 px-4 py-3 rounded-2xl border border-rose-100">
                  No available slots on this day. Try a different date.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setBookingData(b => ({ ...b, time: slot }))}
                      className={`px-4 py-2 rounded-xl text-sm font-black transition-all border ${
                        bookingData.time === slot
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                          : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-indigo-200 hover:text-indigo-600'
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
            <Button type="submit" className="w-full py-5" disabled={isCheckingOut}>
              {isCheckingOut ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Redirecting to payment...
                </span>
              ) : 'Confirm Reservation'}
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Your Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              required
              placeholder="Share your experience..."
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-slate-700 resize-none"
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
};

export default ServiceDetail;
