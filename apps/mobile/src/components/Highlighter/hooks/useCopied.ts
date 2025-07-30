import { useCallback, useEffect, useMemo, useState } from 'react';

export const useCopied = () => {
  const [copied, setCopy] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => {
      setCopy(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [copied]);

  const setCopied = useCallback(() => setCopy(true), []);

  return useMemo(() => ({ copied, setCopied }), [copied]);
};
