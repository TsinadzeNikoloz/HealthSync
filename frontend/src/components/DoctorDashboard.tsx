
import React from 'react';
import { AppointmentStatus } from '../types';
import { useAppointments } from '../features/appointments/useAppointments';
import { useUpdateAppointment } from '../features/appointments/useUpdateAppointment';
import AppointmentItem from './appointments/AppointmentItem';
import StatCard from './dashboard/StatCard';

const DoctorDashboard: React.FC = () => {
  const { appointments } = useAppointments();
  const { editAppointment, isUpdating } = useUpdateAppointment();

  const myAppointments = [...appointments]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pendingCount = myAppointments.filter(a => a.status === AppointmentStatus.PENDING).length;

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    editAppointment({ id, updates: { status } });
  };

  const handleMarkComplete = (id: string) => {
    handleStatusChange(id, AppointmentStatus.COMPLETED);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Physician Schedule</h2>
          <p className="text-slate-500 mt-2 font-medium">Managing clinical workflow and patient intake.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <StatCard label="Total Patients" value={myAppointments.length} icon="fa-users" color="bg-indigo-600" />
          <StatCard label="Awaiting Action" value={pendingCount} icon="fa-clock" color="bg-amber-500" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold text-slate-800">Appointment Queue</h3>
          <div className="flex gap-2">
            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Today</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {myAppointments.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center text-slate-400 italic font-bold">
              Your schedule is clear for today.
            </div>
          ) : (
            myAppointments.map(apt => (
              <AppointmentItem
                key={apt.id}
                appointment={apt}
                patient={apt.patient}
                service={apt.service}
                isPatientView={false}
                onStatusChange={handleStatusChange}
                onMarkComplete={handleMarkComplete}
                isUpdating={isUpdating}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
