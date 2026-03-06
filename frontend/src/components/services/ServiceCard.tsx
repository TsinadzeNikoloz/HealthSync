
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Service } from '../../types';
import ConfirmModal from '../ui/ConfirmModal';

interface ServiceCardProps {
  service: Service;
  isAdmin?: boolean;
  onEdit?: (service: Service) => void;
  onDelete?: (id: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, isAdmin, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden card-hover flex flex-col h-full">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={service.imageCover || `https://picsum.photos/seed/${service.name.replace(/\s+/g, '-').toLowerCase()}/800/450`}
          alt={service.name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-indigo-600 font-black text-sm">{formatCurrency(service.price)}</span>
        </div>
        {isAdmin && (
          <div className="absolute top-4 left-4 flex gap-2">
            <button
              onClick={() => onEdit?.(service)}
              className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 shadow-sm transition-colors"
              title="Edit service"
            >
              <i className="fas fa-pen text-xs"></i>
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-500 shadow-sm transition-colors"
              title="Delete service"
            >
              <i className="fas fa-trash text-xs"></i>
            </button>
          </div>
        )}
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-slate-800 mb-2">{service.name}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">{service.summary}</p>

        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <i className="fas fa-clock text-indigo-400"></i>
              {service.duration} Mins
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <i className="fas fa-star text-amber-400"></i>
              {(service.ratingsAverage || 0).toFixed(1)}
            </div>
          </div>
          <button
            onClick={() => navigate(`/services/${service.id}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            {isAdmin ? 'View' : 'Book Session'}
          </button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Delete Service"
          message={`Are you sure you want to delete "${service.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => { setShowConfirm(false); onDelete?.(service.id); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default ServiceCard;
