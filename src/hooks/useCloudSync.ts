import { useEffect, useState } from 'react';
import { isCloudMode, pullApplications } from '../services/applicationSync';

/** Keep applications fresh while a dashboard is open (on open, on focus, every 30 s). */
export const useCloudSync = () => {
  const [loading, setLoading] = useState(isCloudMode());

  useEffect(() => {
    if (!isCloudMode()) return;
    let alive = true;
    pullApplications().finally(() => alive && setLoading(false));
    const onFocus = () => void pullApplications();
    window.addEventListener('focus', onFocus);
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void pullApplications();
    }, 30000);
    return () => {
      alive = false;
      window.removeEventListener('focus', onFocus);
      clearInterval(timer);
    };
  }, []);

  return { loading };
};
