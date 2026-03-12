import React from 'react';

interface AuthPaneProps {
  title: React.ReactNode;
  description: string;
  footer: React.ReactNode;
}

export default function AuthPane({ title, description, footer }: AuthPaneProps) {
  return (
    <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-700">
      <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-indigo-500/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-400/10 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4"></div>
      <div className="relative z-10 p-20 flex flex-col justify-between h-full w-full">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20">
              <i className="fas fa-heartbeat text-2xl"></i>
            </div>
            <span className="text-3xl font-black text-white tracking-tight">HealthSync</span>
          </div>
          <div className="max-w-xl">
            <h1 className="text-6xl font-black text-white leading-[1.1] mb-8">{title}</h1>
            <p className="text-indigo-100/70 text-xl leading-relaxed font-medium">{description}</p>
          </div>
        </div>
        {footer}
      </div>
    </div>
  );
}
