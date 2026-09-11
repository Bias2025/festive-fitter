'use client';

import { useEffect } from 'react';

/** Registers the service worker so the app is installable and works offline. */
export default function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return; // avoid caching stale pages in `next dev`
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Installability degrades gracefully without one — nothing to surface to the user.
    });
  }, []);

  return null;
}
