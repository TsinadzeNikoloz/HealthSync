
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../features/authentication/useUser';
import { useAppointments } from '../features/appointments/useAppointments';
import Button from './ui/Button';
import StatCard from './dashboard/StatCard';
import AppointmentItem from './appointments/AppointmentItem';

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { appointments } = useAppointments();

  const myAppointments = [...appointments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 animate-in fade-in duration-700">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-12 md:p-16 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/20 blur-[150px] rounded-full translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-xl bg-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/10">
              Welcome back
            </span>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
              Hello, <span className="text-indigo-400">{user?.name.split(' ')[0]}</span>
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed font-medium">
              Manage your upcoming sessions and get personalized medical guidance.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate('/services')}
            leftIcon={<i className="fas fa-plus"></i>}
            className="hover:scale-110"
          >
            New Appointment
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-black text-slate-800">Your Timeline</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')}>View All History</Button>
        </div>

        <StatCard
          label="Total Visits"
          value={myAppointments.length}
          icon="fa-hospital-user"
          color="bg-indigo-600"
          trend="+1 this month"
        />

        <div className="space-y-4">
          {myAppointments.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
              <p className="text-slate-400 font-bold italic">No sessions booked yet</p>
            </div>
          ) : (
            myAppointments.map(apt => (
              <AppointmentItem
                key={apt.id}
                appointment={apt}
                doctor={apt.doctor}
                service={apt.service}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
