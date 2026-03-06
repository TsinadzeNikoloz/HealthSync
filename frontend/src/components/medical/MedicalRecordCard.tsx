
import React from 'react';
import { MedicalRecord } from '../../types';
import { generateMedicalRecordPDF } from '../../utils/generateMedicalRecordPDF';

interface MedicalRecordCardProps {
  record: MedicalRecord;
  doctor?: { name?: string };
  showTimelineDot?: boolean;
}

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({ record, doctor, showTimelineDot = true }) => {
  return (
    <div className="relative pl-0 md:pl-20 group">
      {/* Timeline Connector (Hidden on mobile for better space usage) */}
      {showTimelineDot && (
        <div className="hidden md:block absolute left-6 top-8 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow-sm z-10 group-hover:scale-125 transition-transform"></div>
      )}
      
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group-hover:border-indigo-100">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100/50">
                Clinical Entry
              </span>
              <span className="text-[10px] font-bold text-slate-400">#{record.id.toUpperCase()}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
              {record.diagnosis}
            </h3>
          </div>
          
          <div className="text-left md:text-right bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl flex flex-col items-start md:items-end gap-2">
            <p className="text-sm font-black text-slate-900 flex items-center md:justify-end gap-2">
              <i className="far fa-calendar-alt text-indigo-400"></i>
              {new Date(record.createdAt).toLocaleDateString()}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Practitioner: <span className="text-slate-600 font-black">{doctor?.name || 'Unknown Doctor'}</span>
            </p>
            <button
              onClick={() => generateMedicalRecordPDF(record)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
            >
              <i className="fas fa-file-pdf"></i> Download PDF
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 group-hover:bg-emerald-50 transition-colors flex flex-col justify-center">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <i className="fas fa-prescription-bottle-alt"></i> Pharmacy / Prescription
            </p>
            <p className="text-slate-900 font-bold text-sm">
              {record.prescription || 'No medications prescribed at this time.'}
            </p>
          </div>

          <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-50 flex flex-col h-full relative group-hover:bg-white transition-colors">
            <div className="absolute top-4 right-6 text-slate-100 text-4xl opacity-50 select-none">
              <i className="fas fa-quote-right"></i>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 relative z-10">
              Clinical Findings & Provider Notes
            </p>
            <p className="text-slate-500 italic text-sm leading-relaxed flex-1 relative z-10">
              "{record.notes}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordCard;
