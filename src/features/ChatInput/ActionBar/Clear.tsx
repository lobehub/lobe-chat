import { ActionIcon } from '@lobehub/ui';
import { Popconfirm } from 'antd';
import { Eraser } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import HotKeys from '@/components/HotKeys';
import { ALT_KEY, CLEAN_MESSAGE_KEY, META_KEY } from '@/const/hotkeys';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useChatStore } from '@/store/chat';
import { useFileStore } from '@/store/file';

const Clear = memo(() => {
  const { t } = useTranslation('setting');
  const [clearMessage] = useChatStore((s) => [s.clearMessage]);
  const [clearImageList] = useFileStore((s) => [s.clearImageList]);
  const hotkeys = [META_KEY, ALT_KEY, CLEAN_MESSAGE_KEY].join('+');
  const [confirmOpened, updateConfirmOpened] = useState(false);
  const mobile = useIsMobile();

  const resetConversation = useCallback(async () => {
    await clearMessage();
    clearImageList();
  }, []);

  const actionTitle: any = confirmOpened ? (
    void 0
  ) : (
    <HotKeys desc={t('clearCurrentMessages', { ns: 'chat' })} inverseTheme keys={hotkeys} />
  );

  const popconfirmPlacement = mobile ? 'top' : 'topRight';

  return (
    <Popconfirm
      arrow={false}
      okButtonProps={{ danger: true, type: 'primary' }}
      onConfirm={resetConversation}
      onOpenChange={updateConfirmOpened}
      open={confirmOpened}
      placement={popconfirmPlacement}
      title={
        <div style={{ marginBottom: '8px', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
          {t('confirmClearCurrentMessages', { ns: 'chat' })}
        </div>
      }
    >
      <ActionIcon
        icon={Eraser}
        overlayStyle={{ maxWidth: 'none' }}
        placement={'bottom'}
        title={actionTitle}
      />
    </Popconfirm>
  );
});

export default Clear;
