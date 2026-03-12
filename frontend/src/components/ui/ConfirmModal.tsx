interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 bg-rose-50 rounded-[1.5rem] flex items-center justify-center">
          <i className="fas fa-trash text-rose-500 text-2xl"></i>
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 font-medium">{message}</p>
        </div>
        <div className="flex gap-4 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
