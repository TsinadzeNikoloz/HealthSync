
import React, { useState } from 'react';
import { Role } from '../types';
import { useUser } from '../features/authentication/useUser';
import { useUsers } from '../features/users/useUsers';
import { useDeleteUser } from '../features/users/useDeleteUser';
import { useServices } from '../features/services/useServices';
import { useCreateService } from '../features/services/useCreateService';
import { useServiceStats } from '../features/services/useServiceStats';
import { useAppointments } from '../features/appointments/useAppointments';
import { getUserPhotoUrl } from '../utils/helpers';
import StatCard from './dashboard/StatCard';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';
import ServiceCard from './services/ServiceCard';
import ConfirmModal from './ui/ConfirmModal';

const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useUser();
  const { users } = useUsers();
  const { deleteUser } = useDeleteUser();
  const { services } = useServices();
  const { createService } = useCreateService();
  const { stats: serviceStats } = useServiceStats();
  const { count: appointmentCount } = useAppointments();
  const [activeTab, setActiveTab] = useState<'users' | 'services'>('users');
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ name: '', summary: '', price: '', description: '' });
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingDeleteUser = users.find(u => u.id === pendingDeleteId);

  const handleDeleteUser = (id: string) => setPendingDeleteId(id);

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    createService({
      name: newService.name,
      summary: newService.summary || 'Standard clinical service.',
      description: newService.description || 'Professional clinical service.',
      price: Number(newService.price),
      duration: 30,
      maxPatients: 1,
      category: 'CONSULTATION',
      imageCover: 'service-default.jpg',
    });
    setShowAddService(false);
    // Reset state including the new summary field
    setNewService({ name: '', summary: '', price: '', description: '' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Patients" value={users.filter(u => u.role === Role.PATIENT).length} icon="fa-users" color="bg-blue-600" />
        <StatCard label="Doctors" value={users.filter(u => u.role === Role.DOCTOR).length} icon="fa-user-md" color="bg-indigo-600" />
        <StatCard label="Appointments" value={appointmentCount} icon="fa-calendar-check" color="bg-emerald-600" />
        <StatCard label="Services" value={services.length} icon="fa-briefcase-medical" color="bg-purple-600" />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-50">
          <button onClick={() => setActiveTab('users')} className={`px-10 py-6 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Users</button>
          <button onClick={() => setActiveTab('services')} className={`px-10 py-6 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'services' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Services</button>
        </div>

        <div className="p-10">
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-800">User Directory</h3>
              <div className="overflow-x-auto rounded-[2rem] border border-slate-50">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map(user => (
                      <tr key={user.id} className="group hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={getUserPhotoUrl(user.photo, user.name)} className="w-10 h-10 rounded-xl" alt="" />
                            <div>
                              <p className="font-bold text-slate-800">{user.name}</p>
                              <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${user.role === Role.ADMIN ? 'bg-rose-50 text-rose-600' : user.role === Role.DOCTOR ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {user.id !== currentUser?.id && (
                            <button onClick={() => handleDeleteUser(user.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                              <i className="fas fa-user-slash text-sm"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800">Clinic Offerings</h3>
                <Button onClick={() => setShowAddService(true)} leftIcon={<i className="fas fa-plus"></i>}>Add Service</Button>
              </div>

              {/* Category stats (only services with rating ≥ 4.5) */}
              {serviceStats.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Category Breakdown <span className="normal-case font-semibold">(rated ≥ 4.5)</span></p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {serviceStats.map((stat) => (
                      <div key={stat._id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">{stat._id}</p>
                        <p className="text-2xl font-black text-slate-800">{stat.numServices}</p>
                        <p className="text-xs text-slate-400 font-semibold mb-3">services</p>
                        <div className="flex flex-col gap-1 text-xs text-slate-500 font-semibold">
                          <span>Avg rating: <span className="text-amber-500 font-black">{stat.avgRating.toFixed(1)}</span></span>
                          <span>Avg price: <span className="text-slate-700 font-black">${Math.round(stat.avgPrice)}</span></span>
                          <span className="text-slate-300">${stat.minPrice} – ${stat.maxPrice}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isAdmin={true}
                    onAction={(id) => console.log('Edit', id)}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {pendingDeleteId && (
        <ConfirmModal
          title="Delete User"
          message={`Are you sure you want to remove ${pendingDeleteUser?.name ?? 'this user'}? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => { deleteUser(pendingDeleteId); setPendingDeleteId(null); }}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}

      <Modal
        isOpen={showAddService}
        onClose={() => setShowAddService(false)}
        title="New Clinic Offering"
      >
        <form onSubmit={handleAddService} className="space-y-6">
          <Input
            label="Service Name"
            placeholder="e.g. Full Dental Checkup"
            value={newService.name}
            onChange={e => setNewService({...newService, name: e.target.value})}
            required
          />
          {/* Add Input for the required summary field */}
          <Input
            label="Service Summary"
            placeholder="A brief tagline (e.g. Essential health screening)"
            value={newService.summary}
            onChange={e => setNewService({...newService, summary: e.target.value})}
            required
          />
          <Input
            label="Base Price ($)"
            type="number"
            placeholder="99"
            value={newService.price}
            onChange={e => setNewService({...newService, price: e.target.value})}
            required
          />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Description</label>
            <textarea
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none font-semibold text-slate-700 h-32 resize-none"
              placeholder="Provide clinical details..."
              value={newService.description}
              onChange={e => setNewService({...newService, description: e.target.value})}
            />
          </div>
          <Button type="submit" className="w-full py-5">Register Service</Button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
