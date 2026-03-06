
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-xl' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
      <div className={`bg-white rounded-[3rem] w-full ${maxWidth} overflow-hidden shadow-2xl animate-in zoom-in duration-300`}>
        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
