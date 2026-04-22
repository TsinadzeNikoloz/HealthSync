import React, { useId } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, icon, options, className = '', id: propId, ...props }: SelectProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label htmlFor={id} className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <i className={`fas ${icon} absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors z-10 pointer-events-none`}></i>
        )}
        <select
          id={id}
          className={`w-full ${icon ? 'pl-12' : 'px-6'} pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white outline-none font-semibold text-slate-700 transition-colors appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <i className="fas fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-xs"></i>
      </div>
    </div>
  );
}
