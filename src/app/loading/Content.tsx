import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import FullscreenLoading from '@/components/FullscreenLoading';

const Content = memo<{ goToChat: boolean }>(({ goToChat }) => {
  const { t } = useTranslation('common');

  return (
    <FullscreenLoading title={goToChat ? t('appLoading.goToChat') : t('appLoading.initializing')} />
  );
});

export default Content;
