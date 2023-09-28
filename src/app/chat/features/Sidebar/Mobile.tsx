import { Modal } from '@lobehub/ui';
import { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';

const Mobile = memo<PropsWithChildren>(({ children }) => {
  const [showAgentSettings, toggleConfig] = useGlobalStore((s) => [
    s.preference.mobileShowTopic,
    s.toggleMobileTopic,
  ]);

  const { t } = useTranslation('common');

  return (
    <Modal onCancel={() => toggleConfig(false)} open={showAgentSettings} title={t('topic.title')}>
      {children}
    </Modal>
  );
});

export default Mobile;
