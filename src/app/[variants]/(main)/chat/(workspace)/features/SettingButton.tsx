'use client';

import { ActionIcon } from '@lobehub/ui';
import { AlignJustify } from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SIZE, MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';

const AgentSettings = dynamic(() => import('./AgentSettings'), {
  ssr: false,
});

const SettingButton = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('common');
  const openChatSettings = useOpenChatSettings();

  return (
    <>
      <ActionIcon
        icon={AlignJustify}
        onClick={() => openChatSettings()}
        size={mobile ? MOBILE_HEADER_ICON_SIZE : DESKTOP_HEADER_ICON_SIZE}
        title={t('header.session', { ns: 'setting' })}
      />
      <AgentSettings />
    </>
  );
});

export default SettingButton;
