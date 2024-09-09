'use client';

import { Button } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlexboxProps } from 'react-layout-kit';

import { useOpenSettings } from '@/hooks/useInterceptingRoutes';
import { SettingsTabs } from '@/store/global/initialState';

interface ProviderlActionsProps extends FlexboxProps {
  identifier: string;
}

const ProviderlActions = memo<ProviderlActionsProps>(() => {
  const { t } = useTranslation('discover');
  const openSettings = useOpenSettings(SettingsTabs.LLM);

  return (
    <Button onClick={openSettings} size={'large'} style={{ flex: 1 }} type={'primary'}>
      {t('providers.config')}
    </Button>
  );
});

export default ProviderlActions;
