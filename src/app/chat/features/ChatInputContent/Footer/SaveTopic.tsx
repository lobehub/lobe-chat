import { ActionIcon, Icon, Tooltip } from '@lobehub/ui';
import { Button } from 'antd';
import { useResponsive } from 'antd-style';
import { LucideGalleryVerticalEnd } from 'lucide-react';
import { memo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';

import HotKeys from '@/components/HotKeys';
import { PREFIX_KEY, SAVE_TOPIC_KEY } from '@/const/hotkeys';
import { useSessionStore } from '@/store/session';

const SaveTopic = memo(() => {
  const { t } = useTranslation('common');
  const [hasTopic, saveToTopic] = useSessionStore((s) => [!!s.activeTopicId, s.saveToTopic]);
  const { mobile } = useResponsive();

  const hotkeys = [PREFIX_KEY, SAVE_TOPIC_KEY].join('+');

  useHotkeys(hotkeys, saveToTopic, {
    preventDefault: true,
  });

  if (hasTopic) return undefined;

  const Render = mobile ? ActionIcon : Button;
  const icon: any = mobile ? LucideGalleryVerticalEnd : <Icon icon={LucideGalleryVerticalEnd} />;

  return (
    <Tooltip title={<HotKeys desc={t('topic.saveCurrentMessages')} keys={hotkeys} />}>
      <Render aria-label={t('topic.saveCurrentMessages')} icon={icon} onClick={saveToTopic} />
    </Tooltip>
  );
});

export default SaveTopic;
