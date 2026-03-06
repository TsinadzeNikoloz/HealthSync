
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { getUserPhotoUrl } from '../utils/helpers';
import { useNotifications } from '../features/notifications/useNotifications';
import { useMarkAllRead } from '../features/notifications/useMarkAllRead';
import { useMarkRead } from '../features/notifications/useMarkRead';
import { useOutsideClick } from '../hooks/useOutsideClick';

interface HeaderProps {
  user: User;
  onMenuToggle: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const typeIcon: Record<string, string> = {
  appointment: 'fa-calendar-check',
  record: 'fa-file-medical',
  system: 'fa-bell',
};
const typeBg: Record<string, string> = {
  appointment: 'bg-indigo-50 text-indigo-600',
  record: 'bg-emerald-50 text-emerald-600',
  system: 'bg-slate-100 text-slate-500',
};

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount } = useNotifications();
  const { markAllRead } = useMarkAllRead();
  const { markRead } = useMarkRead();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const ref = useOutsideClick<HTMLDivElement>(close);

  const handleClick = (id: string, read: boolean, link?: string) => {
    if (!read) markRead(id);
    setOpen(false);
    if (link) navigate(link);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
        aria-label="Notifications"
      >
        <i className="fas fa-bell text-lg"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-14 right-0 w-80 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <p className="font-black text-slate-800 text-sm">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-widest transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <i className="fas fa-bell-slash text-2xl text-slate-200 mb-2 block"></i>
                <p className="text-slate-300 text-xs font-bold">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n._id, n.read, n.link)}
                  className={`w-full text-left flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-indigo-50/40' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${typeBg[n.type] ?? typeBg.system}`}>
                    <i className={`fas ${typeIcon[n.type] ?? typeIcon.system} text-xs`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug ${!n.read ? 'font-bold text-slate-800' : 'font-medium text-slate-500'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-300 font-bold mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5"></div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ user, onMenuToggle }) => {
  return (
    <header className="px-6 md:px-10 py-6 flex items-center justify-between sticky top-0 z-30 glass border-b border-white/20">
      <div className="flex items-center gap-4">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
          aria-label="Open menu"
        >
          <i className="fas fa-bars text-lg"></i>
        </button>

        <div className="flex flex-col">
          <h1 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
            {user.role === 'ADMIN' ? 'Administrator' : user.role === 'DOCTOR' ? 'Physician Control' : 'Personal Health'}
          </h1>
          <p className="text-xl font-black text-slate-800">Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.name}</p>
            <p className={`text-[10px] font-extrabold uppercase tracking-widest ${user.role === 'ADMIN' ? 'text-rose-500' : user.role === 'DOCTOR' ? 'text-emerald-500' : 'text-indigo-500'}`}>{user.role}</p>
          </div>
          <div className="relative">
            <img
              src={getUserPhotoUrl(user.photo, user.name)}
              alt={user.name}
              className="w-12 h-12 rounded-2xl border-2 border-white shadow-md transition-transform group-hover:scale-105"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
