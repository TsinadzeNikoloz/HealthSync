import { ServiceCategory, User } from '../../types';
import Button from '../ui/Button';
import Select from '../ui/Select';

const CATEGORIES: ServiceCategory[] = ['CONSULTATION', 'TREATMENT', 'DIAGNOSTIC', 'THERAPY', 'SURGERY'];

export interface ServiceFormData {
  name: string;
  summary: string;
  price: string;
  duration: string;
  maxPatients: string;
  category: ServiceCategory | '';
  imageCover: string;
}

interface ServiceFormProps {
  form: ServiceFormData;
  onChange: (updates: Partial<ServiceFormData>) => void;
  selectedDoctors: string[];
  onToggleDoctor: (id: string) => void;
  allDoctors: User[];
  onSubmit: (e: { preventDefault(): void }) => void;
  isLoading: boolean;
  submitLabel: string;
  showImageField?: boolean;
}

const inputCls = 'w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-slate-700';
const labelCls = 'text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1';

export default function ServiceForm({
  form, onChange, selectedDoctors, onToggleDoctor, allDoctors,
  onSubmit, isLoading, submitLabel, showImageField = false,
}: ServiceFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className={labelCls}>Service Name</label>
        <input className={inputCls} value={form.name} onChange={e => onChange({ name: e.target.value })} placeholder="e.g. Cardiology Consultation" required />
      </div>
      <div className="space-y-2">
        <label className={labelCls}>Summary</label>
        <textarea className={`${inputCls} h-20 resize-none`} value={form.summary} onChange={e => onChange({ summary: e.target.value })} placeholder="Brief description..." required />
      </div>
      {showImageField && (
        <div className="space-y-2">
          <label className={labelCls}>Image URL</label>
          <input className={inputCls} value={form.imageCover} onChange={e => onChange({ imageCover: e.target.value })} placeholder="https://..." />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Price ($)</label>
          <input type="number" min="0" className={inputCls} value={form.price} onChange={e => onChange({ price: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Duration (min)</label>
          <input type="number" min="0" className={inputCls} value={form.duration} onChange={e => onChange({ duration: e.target.value })} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Max Patients</label>
          <input type="number" min="1" className={inputCls} value={form.maxPatients} onChange={e => onChange({ maxPatients: e.target.value })} required />
        </div>
        <Select
          label="Category"
          value={form.category}
          onChange={e => onChange({ category: e.target.value as ServiceCategory })}
          options={[{ value: '', label: 'Select category' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
          required
        />
      </div>
      <div className="space-y-2">
        <label className={labelCls}>Assign Doctors</label>
        <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-1">
          {allDoctors.length === 0 && (
            <p className="text-sm text-slate-400 px-2">No doctors available</p>
          )}
          {allDoctors.map(doc => (
            <label key={doc._id} className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:border-indigo-200 transition-colors">
              <input
                type="checkbox"
                checked={selectedDoctors.includes(doc._id)}
                onChange={() => onToggleDoctor(doc._id)}
                className="accent-indigo-600 w-4 h-4"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-700">{doc.name}</span>
                {doc.specialty && <span className="text-xs text-slate-400">{doc.specialty}</span>}
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className="pt-4">
        <Button type="submit" className="w-full py-5" disabled={isLoading}>
          {isLoading ? `${submitLabel.replace(/^(\w+)/, '$1ing...')}` : submitLabel}
        </Button>
      </div>
    </form>
  );
}
