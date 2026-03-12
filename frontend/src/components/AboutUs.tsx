import { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useUser } from '../features/authentication/useUser';

const inputCls = 'w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none font-semibold text-slate-700 transition-all';
const labelCls = 'text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1';

function AboutUs() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to send');
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-16 animate-in fade-in duration-500 pb-20">

      {/* Hero */}
      <div className="text-center flex flex-col gap-4">
        <h2 className="text-5xl font-black text-slate-900 tracking-tight">
          We Care About Your Health
        </h2>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Providing world-class healthcare with the latest technology and a human touch.
        </p>
      </div>

      {/* Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200"
            className="w-full h-full object-cover"
            alt="Clinic Interior"
          />
        </div>
        <div className="flex flex-col gap-6 px-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-black text-slate-800">Our Mission</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              To synchronize technology and human expertise to deliver personalized
              healthcare that empowers every patient to live their healthiest life.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '20k+', label: 'Happy Patients', color: 'text-indigo-600' },
              { value: '98%', label: 'Satisfaction Rate', color: 'text-emerald-500' },
              { value: '15+', label: 'Specializations', color: 'text-amber-500' },
              { value: '24/7', label: 'Support Available', color: 'text-rose-500' },
            ].map((stat) => (
              <div key={stat.label} className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Us */}
      <div className="flex flex-col gap-8">
        <h3 className="text-2xl font-black text-slate-800">Why Choose HealthSync</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: 'fa-user-md', title: 'Expert Physicians', desc: 'Board-certified doctors with years of clinical experience across all major specialties.', color: 'bg-indigo-50 text-indigo-500' },
            { icon: 'fa-laptop-medical', title: 'Modern Technology', desc: 'Digital records, online booking, and real-time availability — healthcare built for today.', color: 'bg-emerald-50 text-emerald-500' },
            { icon: 'fa-heart', title: 'Patient First', desc: 'Every decision we make is centered around your comfort, safety, and wellbeing.', color: 'bg-rose-50 text-rose-500' },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                <i className={`fas ${item.icon} text-xl`}></i>
              </div>
              <div>
                <p className="font-black text-slate-800 text-lg">{item.title}</p>
                <p className="text-slate-500 text-sm leading-relaxed mt-1 font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="border-t border-slate-100 pt-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Get in touch</p>
          <p className="text-slate-600 font-medium flex items-center gap-2">
            <i className="fas fa-map-marker-alt text-slate-300"></i> Budapest, Pázmány Péter stny. 1/C, 1117
          </p>
          <p className="text-slate-600 font-medium flex items-center gap-2">
            <i className="fas fa-envelope text-slate-300"></i> healthsync2026@gmail.com
          </p>
        </div>
        <button
          onClick={() => { setIsOpen(true); setSent(false); setError(''); }}
          className="self-start md:self-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:-translate-y-0.5 transition-all"
        >
          <i className="fas fa-envelope mr-2"></i>Send a Message
        </button>
      </div>

      {/* Contact Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Contact Support" subtitle="We'll get back to you as soon as possible.">
        {sent ? (
          <div className="text-center py-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
              <i className="fas fa-check text-2xl text-emerald-500"></i>
            </div>
            <p className="font-black text-slate-800 text-lg">Message sent!</p>
            <p className="text-slate-500 font-medium">We'll be in touch soon.</p>
            <Button onClick={() => setIsOpen(false)} className="mt-2">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-2xl text-sm font-bold border border-rose-100">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className={labelCls}>Your Name</label>
                <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" required />
              </div>
              <div className="flex flex-col gap-2">
                <label className={labelCls}>Your Email</label>
                <input type="email" className={inputCls} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" required />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelCls}>Subject</label>
              <input className={inputCls} value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="How can we help?" required />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelCls}>Message</label>
              <textarea className={`${inputCls} resize-none`} rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your issue or question..." required />
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full py-5" disabled={sending}>
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}

export default AboutUs;
