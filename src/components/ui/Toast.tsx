import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; type: ToastType; message: string; }

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-slide-up bg-bg-elevated',
              t.type === 'success' && 'border-success-500/40',
              t.type === 'error' && 'border-error-500/40',
              t.type === 'info' && 'border-accent-500/40',
            )}
          >
            {t.type === 'success' && <CheckCircle size={18} className="text-success-500 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle size={18} className="text-error-500 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info size={18} className="text-accent-400 shrink-0 mt-0.5" />}
            <p className="text-sm text-neutral-100 flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-neutral-500 hover:text-white">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
