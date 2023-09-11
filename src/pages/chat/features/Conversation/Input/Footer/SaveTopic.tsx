import { ActionIcon, Icon, Tooltip } from '@lobehub/ui';
import { Button } from 'antd';
import { useResponsive } from 'antd-style';
import { LucideGalleryVerticalEnd } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';

const SaveTopic = memo(() => {
  const { t } = useTranslation('common');
  const [hasTopic, saveToTopic] = useSessionStore((s) => [!!s.activeTopicId, s.saveToTopic]);
  const { mobile } = useResponsive();

  if (hasTopic) return undefined;

  const Render = mobile ? ActionIcon : Button;
  const icon: any = mobile ? LucideGalleryVerticalEnd : <Icon icon={LucideGalleryVerticalEnd} />;

  return (
    <Tooltip title={t('topic.saveCurrentMessages')}>
      <Render icon={icon} onClick={saveToTopic} />
    </Tooltip>
  );
});

export default SaveTopic;
