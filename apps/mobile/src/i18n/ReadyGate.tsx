import { PropsWithChildren, useEffect, useState } from 'react';
import i18n from '@/i18n';

export const I18nReadyGate = ({ children }: PropsWithChildren) => {
  const [ready, setReady] = useState(!!i18n?.isInitialized);

  useEffect(() => {
    if (ready) return;
    if (!i18n || typeof i18n.on !== 'function') return;
    const onInit = () => setReady(true);
    i18n.on('initialized', onInit);
    return () => {
      if (i18n && typeof i18n.off === 'function') i18n.off('initialized', onInit);
    };
  }, [ready]);

  return ready ? children : null;
};

export default I18nReadyGate;
