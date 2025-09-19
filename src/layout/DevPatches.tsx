'use client';

// Dev-only patches to reduce noisy console warnings (e.g., Ant Design + React 19 compatibility)
// This does not affect production builds.
import { useEffect } from 'react';

const shouldFilter = (args: unknown[]) => {
  const first = args?.[0];
  if (typeof first !== 'string') return false;
  const msg = first.toLowerCase();
  // Heuristics to suppress known compatibility chatter without hiding real errors
  // Adjust patterns as needed.
  return (
    (msg.includes('antd') && (msg.includes('compat') || msg.includes('react 19'))) ||
    msg.includes('[antd:')
  );
};

export default function DevPatches() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const origWarn = console.warn;
    const origError = console.error;

    console.warn = (...args: unknown[]) => {
      if (shouldFilter(args)) return; // drop known noisy warnings
      origWarn(...args);
    };
    console.error = (...args: unknown[]) => {
      if (shouldFilter(args)) return; // drop known noisy errors from compatibility checks
      origError(...args);
    };

    return () => {
      console.warn = origWarn;
      console.error = origError;
    };
  }, []);

  return null;
}
