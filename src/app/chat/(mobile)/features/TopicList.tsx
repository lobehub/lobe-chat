import { Modal } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';

import TopicListContent from '../../features/TopicListContent';

const Topics = memo(() => {
  const [showAgentSettings, toggleConfig] = useGlobalStore((s) => [
    s.preference.mobileShowTopic,
    s.toggleMobileTopic,
  ]);

  const { t } = useTranslation('common');

  return (
    <Modal onCancel={() => toggleConfig(false)} open={showAgentSettings} title={t('topic.title')}>
      <TopicListContent />
    </Modal>
  );
});

export default Topics;
