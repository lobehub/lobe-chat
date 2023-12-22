'use client';

import { useTranslation } from 'react-i18next';

import FullscreenLoading from '@/components/FullscreenLoading';

/**
 * 首页加载中
 * @constructor
 */
const Loading = () => {
  const { t } = useTranslation('common');

  return <FullscreenLoading title={t('appInitializing')} />;
};

export default Loading;
