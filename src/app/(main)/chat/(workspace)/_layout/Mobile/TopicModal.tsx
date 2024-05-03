'use client';

import { Modal } from '@lobehub/ui';
import { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';

const Topics = memo(({ children }: PropsWithChildren) => {
  const [showAgentSettings, toggleConfig] = useGlobalStore((s) => [
    s.preference.mobileShowTopic,
    s.toggleMobileTopic,
  ]);

  const { t } = useTranslation('chat');

  return (
    <Modal
      allowFullscreen
      onCancel={() => toggleConfig(false)}
      open={showAgentSettings}
      title={t('topic.title')}
    >
      {children}
    </Modal>
  );
});

export default Topics;
