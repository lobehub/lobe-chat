import { ActionIcon, Hotkey } from '@lobehub/ui';
import { Popconfirm } from 'antd';
import { LucideGalleryVerticalEnd, LucideMessageSquarePlus } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useActionSWR } from '@/libs/swr';
import { useChatStore } from '@/store/chat';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum } from '@/types/hotkey';

const SaveTopic = memo(() => {
  const { t } = useTranslation('chat');
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.SaveTopic));
  const [hasTopic, openNewTopicOrSaveTopic] = useChatStore((s) => [
    !!s.activeTopicId,
    s.openNewTopicOrSaveTopic,
  ]);
  const { showTopicPanelButton } = useServerConfigStore(featureFlagsSelectors);

  const mobile = useIsMobile();
  const { mutate, isValidating } = useActionSWR('openNewTopicOrSaveTopic', openNewTopicOrSaveTopic);
  const [confirmOpened, setConfirmOpened] = useState(false);

  // If topic panel feature is disabled, don't show the save topic button
  if (!showTopicPanelButton) return null;

  const icon = hasTopic ? LucideMessageSquarePlus : LucideGalleryVerticalEnd;
  const desc = t(hasTopic ? 'topic.openNewTopic' : 'topic.saveCurrentMessages');

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
          <Flexbox align={'center'} horizontal style={{ marginBottom: 8 }}>
            <div style={{ marginRight: '16px', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
              {t(hasTopic ? 'topic.checkOpenNewTopic' : 'topic.checkSaveCurrentMessages')}
            </div>
            <Hotkey keys={hotkey} />
          </Flexbox>
        }
      >
        <ActionIcon
          aria-label={desc}
          icon={icon}
          loading={isValidating}
          onClick={() => setConfirmOpened(true)}
        />
      </Popconfirm>
    );
  } else {
    return (
      <ActionIcon
        aria-label={desc}
        icon={icon}
        loading={isValidating}
        onClick={() => mutate()}
        size={{ blockSize: 32, size: 16, strokeWidth: 2.3 }}
        title={desc}
        tooltipProps={{
          hotkey,
        }}
        variant={'outlined'}
      />
    );
  }
});

SaveTopic.displayName = 'SaveTopic';

export default SaveTopic;
