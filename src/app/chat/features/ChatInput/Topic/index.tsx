import { ActionIcon, Icon, Tooltip } from '@lobehub/ui';
import { Button } from 'antd';
import { LucideGalleryVerticalEnd, LucideMessageSquarePlus } from 'lucide-react';
import { memo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';

import HotKeys from '@/components/HotKeys';
import { PREFIX_KEY, SAVE_TOPIC_KEY } from '@/const/hotkeys';
import { useChatStore } from '@/store/chat';

const SaveTopic = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('chat');
  const [hasTopic, openNewTopicOrSaveTopic] = useChatStore((s) => [
    !!s.activeTopicId,
    s.openNewTopicOrSaveTopic,
  ]);

  const icon = hasTopic ? LucideMessageSquarePlus : LucideGalleryVerticalEnd;
  const Render = mobile ? ActionIcon : Button;
  const iconRender: any = mobile ? icon : <Icon icon={icon} />;
  const desc = t(hasTopic ? 'topic.openNewTopic' : 'topic.saveCurrentMessages');

  const hotkeys = [PREFIX_KEY, SAVE_TOPIC_KEY].join('+');
  useHotkeys(hotkeys, openNewTopicOrSaveTopic, {
    enableOnFormTags: true,
    preventDefault: true,
  });

  return (
    <Tooltip title={<HotKeys desc={desc} keys={hotkeys} />}>
      <Render aria-label={desc} icon={iconRender} onClick={openNewTopicOrSaveTopic} />
    </Tooltip>
  );
});

export default SaveTopic;
