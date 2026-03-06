
import React from 'react';
import { AppointmentStatus } from '../../types';

interface BadgeProps {
  status: string | AppointmentStatus;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getStyles = (s: string) => {
    switch (s.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'PENDING':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getStyles(status as string)} ${className}`}>
      {status}
    </span>
  );
};

export default Badge;
