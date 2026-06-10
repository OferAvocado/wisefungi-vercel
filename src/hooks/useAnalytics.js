import { useEffect, useRef, useCallback } from 'react';

// Safe client-side UUID generator
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function useAnalytics() {
  const activeIntervalRef = useRef(null);
  const currentPathRef = useRef(null);

  // Clear tracking interval on unmount
  useEffect(() => {
    return () => {
      if (activeIntervalRef.current) {
        clearInterval(activeIntervalRef.current);
      }
    };
  }, []);

  const trackPage = useCallback((customPath) => {
    const currentPath = customPath || window.location.pathname;
    
    // If we are already tracking this exact path, don't restart tracking
    if (currentPathRef.current === currentPath) return;
    currentPathRef.current = currentPath;

    // 1. Clear any existing heartbeat interval
    if (activeIntervalRef.current) {
      clearInterval(activeIntervalRef.current);
      activeIntervalRef.current = null;
    }

    // 2. Generate a new unique ID for this page view
    const pageViewId = generateUUID();
    let elapsedSeconds = 0;

    const sendTrack = (durationVal) => {
      try {
        fetch('/api/analytics_track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: pageViewId,
            path: currentPath,
            duration: durationVal
          }),
          keepalive: true
        }).catch(() => {});
      } catch (err) {
        // Silent fail
      }
    };

    // 3. Send initial page view pulse
    sendTrack(0);

    // 4. Setup heartbeat interval to update duration every 10 seconds
    activeIntervalRef.current = setInterval(() => {
      elapsedSeconds += 10;
      sendTrack(elapsedSeconds);
    }, 10000);

  }, []);

  return { trackPage };
}
