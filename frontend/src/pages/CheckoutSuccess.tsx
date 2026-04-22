import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createAppointmentFromCheckout } from '../services/apiAppointments';

function CheckoutSuccess() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const service = searchParams.get('service');
	const doctor = searchParams.get('doctor');
	const date = searchParams.get('date');
	const price = searchParams.get('price');
	const paramsValid = Boolean(service && doctor && date && price);

	const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
		paramsValid ? 'loading' : 'error',
	);
	const called = useRef(false);

	useEffect(() => {
		if (!paramsValid || called.current) return;
		called.current = true;

		createAppointmentFromCheckout({
			service: service!,
			doctor: doctor!,
			date: date!,
			price: price!,
		})
			.then(() => setStatus('success'))
			.catch(() => setStatus('error'));
	}, [date, doctor, price, service, paramsValid]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
			<div className="w-full max-w-md rounded-[3rem] bg-white p-12 text-center shadow-xl">
				{status === 'loading' && (
					<>
						<div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
						<h2 className="mb-2 text-2xl font-black text-slate-800">
							Confirming your booking...
						</h2>
						<p className="font-medium text-slate-500">
							Please wait while we finalise your appointment.
						</p>
					</>
				)}

				{status === 'success' && (
					<>
						<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-emerald-50">
							<i className="fas fa-check text-3xl text-emerald-500"></i>
						</div>
						<h2 className="mb-2 text-2xl font-black text-slate-800">
							Booking Confirmed!
						</h2>
						<p className="mb-8 font-medium text-slate-500">
							Your appointment has been successfully scheduled. A confirmation
							email is on its way.
						</p>
						<button
							onClick={() => navigate('/appointments')}
							className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-100 transition-all hover:-translate-y-0.5 active:scale-95"
						>
							View My Appointments
						</button>
					</>
				)}

				{status === 'error' && (
					<>
						<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-rose-50">
							<i className="fas fa-exclamation text-3xl text-rose-500"></i>
						</div>
						<h2 className="mb-2 text-2xl font-black text-slate-800">
							Something went wrong
						</h2>
						<p className="mb-8 font-medium text-slate-500">
							We couldn't confirm your appointment. If payment was taken, please
							contact support.
						</p>
						<button
							onClick={() => navigate('/services')}
							className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white transition-all hover:-translate-y-0.5 active:scale-95"
						>
							Back to Services
						</button>
					</>
				)}
			</div>
		</div>
	);
}

export default CheckoutSuccess;
