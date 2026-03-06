import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createAppointmentFromCheckout } from '../services/apiAppointments';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const service = searchParams.get('service');
    const doctor = searchParams.get('doctor');
    const date = searchParams.get('date');
    const price = searchParams.get('price');

    if (!service || !doctor || !date || !price) {
      setStatus('error');
      return;
    }

    createAppointmentFromCheckout({ service, doctor, date, price })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-[3rem] max-w-md w-full p-12 shadow-xl text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Confirming your booking...</h2>
            <p className="text-slate-500 font-medium">Please wait while we finalise your appointment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-check text-emerald-500 text-3xl"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Booking Confirmed!</h2>
            <p className="text-slate-500 font-medium mb-8">
              Your appointment has been successfully scheduled. A confirmation email is on its way.
            </p>
            <button
              onClick={() => navigate('/appointments')}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              View My Appointments
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-exclamation text-rose-500 text-3xl"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-slate-500 font-medium mb-8">
              We couldn't confirm your appointment. If payment was taken, please contact support.
            </p>
            <button
              onClick={() => navigate('/services')}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              Back to Services
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccess;
