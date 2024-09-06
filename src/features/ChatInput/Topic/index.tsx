import { ActionIcon, Icon, Tooltip } from '@lobehub/ui';
import { Button, Popconfirm } from 'antd';
import { LucideGalleryVerticalEnd, LucideMessageSquarePlus } from 'lucide-react';
import { memo, useState } from 'react';
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

  const [confirmOpened, setConfirmOpened] = useState(false);

  const icon = hasTopic ? LucideMessageSquarePlus : LucideGalleryVerticalEnd;
  const desc = t(hasTopic ? 'topic.openNewTopic' : 'topic.saveCurrentMessages');

  const hotkeys = [ALT_KEY, SAVE_TOPIC_KEY].join('+');

  useHotkeys(hotkeys, () => mutate(), {
    enableOnFormTags: true,
    preventDefault: true,
  });

  if (mobile) {
    return (
      <Popconfirm
        arrow={false}
        okButtonProps={{ danger: false, type: 'primary' }}
        onConfirm={() => mutate()}
        onOpenChange={setConfirmOpened}
        open={confirmOpened}
        placement={'top'}
        title={
          <div style={{ alignItems: 'center', display: 'flex', marginBottom: '8px' }}>
            <div style={{ marginRight: '16px', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
              {t(hasTopic ? 'topic.checkOpenNewTopic' : 'topic.checkSaveCurrentMessages')}
            </div>
            <HotKeys inverseTheme={false} keys={hotkeys} />
          </div>
        }
      >
        <Tooltip>
          <ActionIcon
            aria-label={desc}
            icon={icon}
            loading={isValidating}
            onClick={() => setConfirmOpened(true)}
          />
        </Tooltip>
      </Popconfirm>
    );
  } else {
    return (
      <Tooltip title={<HotKeys desc={desc} inverseTheme keys={hotkeys} />}>
        <Button
          aria-label={desc}
          icon={<Icon icon={icon} />}
          loading={isValidating}
          onClick={() => mutate()}
        />
      </Tooltip>
    );
  }
});

export default SaveTopic;
