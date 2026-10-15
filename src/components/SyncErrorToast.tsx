import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { SYNC_ERROR_EVENT } from '../services/applicationSync';

/** Shows a visible message when a change could not be saved to the database. */
export const SyncErrorToast: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const onError = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail || 'A change could not be saved.');
      window.setTimeout(() => setMessage(null), 8000);
    };
    window.addEventListener(SYNC_ERROR_EVENT, onError);
    return () => window.removeEventListener(SYNC_ERROR_EVENT, onError);
  }, []);

  if (!message) return null;
  return (
    <div role="alert" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-md z-[60] bg-rose-700 text-white rounded-xl shadow-xl p-3.5 flex items-start gap-2.5 text-sm">
      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="flex-1 leading-snug">{message}</p>
      <button onClick={() => setMessage(null)} aria-label="Close" className="shrink-0 p-0.5 hover:bg-white/10 rounded">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
