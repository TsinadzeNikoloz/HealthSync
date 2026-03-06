
import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in zoom-in duration-500 pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black text-slate-900 tracking-tight">We Care About Your Health</h2>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">Providing world-class healthcare with the latest technology and a human touch.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
          <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Clinic Interior" />
        </div>
        <div className="flex flex-col justify-center space-y-6 px-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-800">Our Mission</h3>
            <p className="text-slate-500 leading-relaxed">To synchronize technology and human expertise to deliver personalized healthcare that empowers every patient to live their healthiest life.</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-3xl font-black text-indigo-600">20k+</p>
              <p className="text-xs font-bold text-slate-400 uppercase mt-1">Happy Patients</p>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-3xl font-black text-emerald-500">98%</p>
              <p className="text-xs font-bold text-slate-400 uppercase mt-1">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-600 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-3xl font-bold mb-2">Visit Our Main Campus</h3>
          <p className="text-indigo-100 flex items-center gap-2">
            <i className="fas fa-map-marker-alt"></i> 123 Healthway Dr, Silicon Valley, CA 94043
          </p>
          <p className="text-indigo-100 flex items-center gap-2 mt-1">
            <i className="fas fa-phone"></i> +1 (800) HEALTH-SYNC
          </p>
        </div>
        <button className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default AboutUs;
