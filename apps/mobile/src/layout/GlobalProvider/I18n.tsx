import { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n from '@/i18n';
import { I18nReadyGate } from '@/i18n/ReadyGate';

/**
 * I18n Provider
 * - I18nextProvider: Internationalization context
 * - I18nReadyGate: Ensures i18n is ready before rendering
 */
const I18n = ({ children }: PropsWithChildren) => {
  return (
    <I18nextProvider i18n={i18n}>
      <I18nReadyGate>{children}</I18nReadyGate>
    </I18nextProvider>
  );
};

export default I18n;
