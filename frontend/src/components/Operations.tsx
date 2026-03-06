
import React from 'react';
import { useAppointments } from '../features/appointments/useAppointments';

const Operations: React.FC = () => {
  const { appointments } = useAppointments();

  const totalRevenue = appointments.reduce((acc, apt) => {
    return acc + (apt.price || 0);
  }, 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Clinic Operations</h2>
          <p className="text-slate-500">Enterprise resource planning and business analytics.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center gap-2">
          <i className="fas fa-download"></i> Export Reports
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <OperationalCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon="fa-dollar-sign" color="text-emerald-500" />
        <OperationalCard label="Efficiency Rate" value="94.2%" icon="fa-bolt" color="text-amber-500" />
        <OperationalCard label="Patient Retention" value="+12%" icon="fa-heart" color="text-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Appointment Density</h3>
          <div className="space-y-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
              <div key={day} className="flex items-center gap-4">
                <span className="w-10 text-xs font-bold text-slate-400 uppercase">{day}</span>
                <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${Math.random() * 80 + 20}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <i className="fas fa-microchip text-indigo-400"></i>
            </div>
            <h3 className="text-xl font-bold">Operational AI</h3>
          </div>
          <p className="text-slate-400 leading-relaxed mb-6">
            Predictive analysis suggests hiring one more staff member for the Cardiology department based on increasing booking trends over the last 30 days.
          </p>
          <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold self-start">Optimize Staffing</button>
        </div>
      </div>
    </div>
  );
};

const OperationalCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl mb-4 ${color}`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
  </div>
);

export default Operations;
