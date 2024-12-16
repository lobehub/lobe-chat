import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import FullscreenLoading from '@/components/FullscreenLoading';

import { AppLoadingStage } from './type';

interface ContentProps {
  loadingStage: AppLoadingStage;
}
const Content = memo<ContentProps>(({ loadingStage }) => {
  const { t } = useTranslation('common');

  return <FullscreenLoading title={t(`appLoading.${loadingStage}`)} />;
});

export default Content;
