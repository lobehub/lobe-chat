'use client';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * UrlSynchronizer component
 * Synchronizes the Memory Router's internal location with the browser's URL
 * This allows the browser's back/forward buttons to work with SPA navigation
 */
const UrlSynchronizer = () => {
  const location = useLocation();

  useEffect(() => {
    // Build the full path including search params
    const fullPath = `/files${location.pathname === '/' ? '' : location.pathname}${location.search}`;

    // Only update if the URL is actually different
    if (window.location.pathname + window.location.search !== fullPath) {
      // Use replaceState to update URL without adding to history
      window.history.replaceState(null, '', fullPath);
    }
  }, [location.pathname, location.search]);

  return null;
};

export default UrlSynchronizer;
