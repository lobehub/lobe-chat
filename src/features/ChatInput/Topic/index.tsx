import { ActionIcon, Icon, Tooltip } from '@lobehub/ui';
import { Button } from 'antd';
import { LucideGalleryVerticalEnd, LucideMessageSquarePlus } from 'lucide-react';
import { memo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';

import HotKeys from '@/components/HotKeys';
import { ALT_KEY, SAVE_TOPIC_KEY } from '@/const/hotkeys';
import { useActionSWR } from '@/libs/swr';
import { useChatStore } from '@/store/chat';

const SaveTopic = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('chat');
  const [hasTopic, openNewTopicOrSaveTopic] = useChatStore((s) => [
    !!s.activeTopicId,
    s.openNewTopicOrSaveTopic,
  ]);

  const { mutate, isValidating } = useActionSWR('openNewTopicOrSaveTopic', openNewTopicOrSaveTopic);

  const icon = hasTopic ? LucideMessageSquarePlus : LucideGalleryVerticalEnd;
  const Render = mobile ? ActionIcon : Button;
  const iconRender: any = mobile ? icon : <Icon icon={icon} />;
  const desc = t(hasTopic ? 'topic.openNewTopic' : 'topic.saveCurrentMessages');

  const hotkeys = [ALT_KEY, SAVE_TOPIC_KEY].join('+');

  useHotkeys(hotkeys, () => mutate(), {
    enableOnFormTags: true,
    preventDefault: true,
  });

  return (
    <Tooltip title={<HotKeys desc={desc} inverseTheme keys={hotkeys} />}>
      <Render aria-label={desc} icon={iconRender} loading={isValidating} onClick={() => mutate()} />
    </Tooltip>
  );
});

export default SaveTopic;
