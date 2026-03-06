
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, icon, error, className = '', ...props }) => {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <i className={`fas ${icon} absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors`}></i>
        )}
        <input 
          className={`w-full ${icon ? 'pl-12' : 'px-6'} pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none font-semibold text-slate-700 transition-all ${error ? 'border-rose-300 focus:ring-rose-500/10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase">{error}</p>}
    </div>
  );
};

export default Input;
