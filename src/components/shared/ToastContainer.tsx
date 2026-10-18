import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useStore } from '../../store';

const ICON_MAP = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLOR_MAP = {
  success: {
    bg: 'bg-emerald-50/95 border-emerald-200 text-emerald-800',
    icon: 'text-emerald-500',
    progress: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-rose-50/95 border-rose-200 text-rose-800',
    icon: 'text-rose-500',
    progress: 'bg-rose-500',
  },
  info: {
    bg: 'bg-blue-50/95 border-blue-200 text-blue-800',
    icon: 'text-blue-500',
    progress: 'bg-blue-500',
  },
  warning: {
    bg: 'bg-amber-50/95 border-amber-200 text-amber-800',
    icon: 'text-amber-500',
    progress: 'bg-amber-500',
  },
};

export const ToastContainer: React.FC = () => {
  const { ui, removeNotification } = useStore();
  const notifications = ui.notifications;

  useEffect(() => {
    if (notifications.length === 0) return;
    const timers = notifications.map((n) =>
      setTimeout(() => {
        removeNotification(n.id);
      }, 3500)
    );
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
      {notifications.slice(-4).map((n) => {
        const Icon = ICON_MAP[n.type] || Info;
        const colors = COLOR_MAP[n.type] || COLOR_MAP.info;

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur-xl ${colors.bg} transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
          >
            <Icon size={18} className={`${colors.icon} shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              {n.title && <div className="text-xs font-bold leading-tight">{n.title}</div>}
              <div className="text-xs font-medium leading-normal opacity-90 mt-0.5">{n.message}</div>
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-slate-700 transition-colors shrink-0 p-0.5 rounded-md hover:bg-black/5"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
