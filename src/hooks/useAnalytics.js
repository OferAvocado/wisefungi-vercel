import { useEffect, useRef, useCallback } from 'react';

export function useAnalytics() {
  const trackPage = useCallback((customPath) => {
    const currentPath = customPath || window.location.pathname;
    
    // Send beacon or fetch
    try {
      // Create a small unblocking promise
      setTimeout(() => {
        if (navigator.sendBeacon) {
          // sendBeacon requires a Blob or FormData for custom content-type but works fine with string payload if endpoint accepts it
          // Vercel serverless functions parse text/plain automatically if we handle it, but fetch keepalive is safer for JSON
          fetch('/api/analytics_track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: currentPath }),
            keepalive: true
          }).catch(() => {});
        } else {
          fetch('/api/analytics_track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: currentPath }),
            keepalive: true
          }).catch(() => {});
        }
      }, 0);
    } catch (err) {
      // Silent fail
    }
  }, []);

  return { trackPage };
}
