import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckSquare, AlertTriangle, Info, X } from 'lucide-react';
import type { ToastEventDetail } from '@lib/toast';

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastEventDetail[]>([]);

  useEffect(() => {
    const handleToast = (e: any) => {
      if (e.detail) {
        const newToast = e.detail;
        setToasts((prev) => [...prev, newToast]);

        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, 5000);
      }
    };

    window.addEventListener('dz-toast', handleToast);
    return () => window.removeEventListener('dz-toast', handleToast);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-4 pointer-events-none items-center">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let colorClass = 'text-tertiary';
          let bgIconClass = 'bg-tertiary/10';
          
          if (toast.type === 'success') {
            Icon = CheckSquare;
            colorClass = 'text-primary';
            bgIconClass = 'bg-primary/10';
          } else if (toast.type === 'error') {
            Icon = AlertTriangle;
            colorClass = 'text-error';
            bgIconClass = 'bg-error/10';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pointer-events-auto bg-white border border-gray-200 shadow-2xl flex w-80 md:w-96 overflow-hidden relative"
              style={{ borderRadius: '0px' }}
            >
              <div className={`w-12 flex items-center justify-center border-r border-gray-100 ${bgIconClass}`}>
                <Icon size={18} className={colorClass} />
              </div>
              
              <div className="flex-1 p-4 flex flex-col justify-center">
                <span className="font-label text-[9px] uppercase tracking-widest text-gray-500 mb-1">
                  {toast.type === 'success' ? 'Operación Exitosa' : toast.type === 'error' ? 'Fallo del Sistema' : 'Notificación'}
                </span>
                <p className="font-body text-sm text-gray-900 leading-snug">
                  {toast.message}
                </p>
              </div>

              <button 
                onClick={() => dismissToast(toast.id)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
