import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../features/authentication/useUser';
import { useServices } from '../features/services/useServices';
import { useDeleteService } from '../features/services/useDeleteService';
import { useEditService } from '../features/services/useEditService';
import { useCreateService } from '../features/services/useCreateService';
import { Service, ServiceCategory } from '../types';
import ServiceCard from './services/ServiceCard';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';

const CATEGORIES: ServiceCategory[] = ['CONSULTATION', 'TREATMENT', 'DIAGNOSTIC', 'THERAPY', 'SURGERY'];

const PatientServices: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUser();
  const { services } = useServices();

  const search = searchParams.get('search') || '';
  const setSearch = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('search', value); else next.delete('search');
    next.delete('page');
    setSearchParams(next);
  };
  const { deleteService } = useDeleteService();
  const { editService, isEditing } = useEditService();
  const { createService, isCreating } = useCreateService();

  const isAdmin = user?.role === 'ADMIN';

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const emptyForm = { name: '', summary: '', price: '', duration: '', maxPatients: '', category: '' as ServiceCategory | '', imageCover: '' };
  const [form, setForm] = useState(emptyForm);

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      summary: service.summary,
      price: String(service.price),
      duration: String(service.duration),
      maxPatients: String(service.maxPatients),
      category: service.category,
      imageCover: service.imageCover || '',
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createService(
      {
        name: form.name,
        summary: form.summary,
        price: Number(form.price),
        duration: Number(form.duration),
        maxPatients: Number(form.maxPatients),
        category: form.category as ServiceCategory,
        imageCover: form.imageCover,
      },
      { onSuccess: () => { setIsAdding(false); setForm(emptyForm); } }
    );
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    editService(
      {
        id: editingService.id,
        updates: {
          name: form.name,
          summary: form.summary,
          price: Number(form.price),
          duration: Number(form.duration),
          maxPatients: Number(form.maxPatients),
          category: form.category as ServiceCategory,
        },
      },
      { onSuccess: () => setEditingService(null) }
    );
  };

  const inputCls = 'w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-slate-700';
  const labelCls = 'text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1';

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            {isAdmin ? 'Clinic Inventory' : 'Our Specializations'}
          </h2>
          <p className="text-slate-500 text-lg mt-2 font-medium">
            {isAdmin ? 'Manage the available medical services and pricing.' : 'Schedule a session with our world-class medical team.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors text-sm"></i>
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 w-56 transition-all"
            />
          </div>
          {isAdmin && (
            <Button leftIcon={<i className="fas fa-plus"></i>} onClick={() => { setForm(emptyForm); setIsAdding(true); }}>
              Add New Service
            </Button>
          )}
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isAdmin={isAdmin}
            onEdit={isAdmin ? handleEdit : undefined}
            onDelete={isAdmin ? (id) => deleteService(id) : undefined}
          />
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="New Service">
        <form onSubmit={handleAddSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className={labelCls}>Service Name</label>
            <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Cardiology Consultation" required />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Summary</label>
            <textarea className={`${inputCls} h-20 resize-none`} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Brief description..." required />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Image URL</label>
            <input className={inputCls} value={form.imageCover} onChange={e => setForm(f => ({ ...f, imageCover: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelCls}>Price ($)</label>
              <input type="number" min="0" className={inputCls} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Duration (min)</label>
              <input type="number" min="0" className={inputCls} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelCls}>Max Patients</label>
              <input type="number" min="1" className={inputCls} value={form.maxPatients} onChange={e => setForm(f => ({ ...f, maxPatients: e.target.value }))} required />
            </div>
            <Select
              label="Category"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as ServiceCategory }))}
              options={[{ value: '', label: 'Select category' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
              required
            />
          </div>
          <div className="pt-4">
            <Button type="submit" className="w-full py-5" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Service'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        title="Edit Service"
        subtitle={editingService?.name}
      >
        <form onSubmit={handleEditSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className={labelCls}>Service Name</label>
            <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Summary</label>
            <textarea className={`${inputCls} h-20 resize-none`} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelCls}>Price ($)</label>
              <input type="number" min="0" className={inputCls} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Duration (min)</label>
              <input type="number" min="0" className={inputCls} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelCls}>Max Patients</label>
              <input type="number" min="1" className={inputCls} value={form.maxPatients} onChange={e => setForm(f => ({ ...f, maxPatients: e.target.value }))} required />
            </div>
            <Select
              label="Category"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as ServiceCategory }))}
              options={[{ value: '', label: 'Select category' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
              required
            />
          </div>
          <div className="pt-4">
            <Button type="submit" className="w-full py-5" disabled={isEditing}>
              {isEditing ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PatientServices;
